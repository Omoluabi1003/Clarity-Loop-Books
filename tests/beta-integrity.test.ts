import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import { buildBlueprint, buildChapterPrompt, writeSampleChapter } from "../lib/ai";
import { calculateBookBudget, getPublishingReadiness, recalculateBook } from "../lib/book-budget";
import { renderDocx, renderPdf } from "../lib/export-renderers";
import { assembleManuscript, findMissingChapterNumbers } from "../lib/manuscript";
import { parseStudioState, serializeStudioState } from "../lib/persistence";
import { analyzeBookQuality, normalizeParagraphCasing } from "../lib/quality";
import type { BetaFeedback, Book, BookForm } from "../lib/types";

const form: BookForm = {
  title: "The Clarity Loop", subtitle: "Modern Workflows, AI, and Why Understanding Now Comes After Action", authorName: "Paul A.K. Iyogun", authorBio: "Paul writes about modern work and practical clarity.", authorEmail: "", authorWebsite: "", publisherCredit: "ETL GIS Consulting LLC", idea: "Modernization is not merely the adoption of new tools. It is the adoption of new ways of creating clarity.", genre: "Business", targetAudience: "Leaders modernizing professional workflows", tone: "Professional, insightful, thought-provoking, authoritative", writingStyle: "Framework-driven, practical, analytical", chapterCount: 10, targetPageCount: 180, wordsPerPage: 275, chapterSizePreference: "auto", customChapterWords: 0, aiAssistanceLevel: "full", coverDirection: "Midnight blue field with a warm gold clarity loop",
};

function qaBook(): Book {
  const budget = calculateBookBudget(form); const now = new Date().toISOString();
  return { id: "qa-book", title: form.title, subtitle: form.subtitle, authorName: form.authorName, authorBio: form.authorBio, publisherCredit: form.publisherCredit, idea: form.idea, genre: form.genre, targetAudience: form.targetAudience, tone: form.tone, writingStyle: form.writingStyle, chapterCount: budget.chapterCount, targetPageCount: budget.targetPages, wordsPerPage: budget.wordsPerPage, targetWords: budget.targetWords, averageWordsPerChapter: budget.averageWordsPerChapter, actualWords: 0, actualEstimatedPages: 0, chapterSizePreference: "auto", aiAssistanceLevel: "full", bookDna: { thesis: form.idea, promise: "Create clarity through action.", tone: form.tone, audience: form.targetAudience, readingLevel: "Professional", voice: form.writingStyle, themes: ["clarity", "action", "modernization"], styleRules: ["Use original examples", "Include practical application"] }, coverDirection: form.coverDirection, coverPrompt: "Professional midnight blue and warm gold cover", qualityScore: 100, status: "blueprint", progress: 0, updatedAt: now, createdAt: now, color: "midnight", chapters: buildBlueprint(form), exportHistory: [] };
}

test("QA budget is exactly 49,500 words and allocates every word", () => {
  const budget = calculateBookBudget(form);
  assert.equal(budget.targetWords, 49_500); assert.equal(budget.averageWordsPerChapter, 4_950); assert.equal(budget.chapterBudgets.reduce((a, b) => a + b, 0), 49_500);
});

test("chapter prompts contain all professional generation constraints", () => {
  const book = qaBook(); const prompt = buildChapterPrompt(book, book.chapters[1]);
  for (const phrase of ["Book thesis", "Book DNA", "Chapter purpose", "target word count", "Assigned opening style", "Previous chapter summaries", "Phrases and examples to avoid", "Required original examples", "Professional nonfiction structure", "practical application", "Do not repeat opening language"]) assert.match(prompt, new RegExp(phrase, "i"));
});

test("QA reference scenario generates ten distinct chapters above the 90% manuscript gate", () => {
  let book = qaBook();
  book.chapters = book.chapters.map((chapter) => ({ ...chapter, content: writeSampleChapter(book, chapter) }));
  book = recalculateBook(analyzeBookQuality(book).chapters.reduce((current, chapter, index) => ({ ...current, chapters: current.chapters.map((value, position) => position === index ? chapter : value) }), book));
  assert.equal(book.chapters.length, 10); assert.ok(book.actualWords >= 44_550); assert.ok(book.chapters.every((chapter) => chapter.actualWordCount >= chapter.targetWordCount * .85));
  assert.equal(analyzeBookQuality(book).duplicateOpenings.length, 0); assert.equal(getPublishingReadiness(book).exportReadinessStatus, "ready");
});

test("paragraph casing and duplicate opening quality checks work", () => {
  assert.equal(normalizeParagraphCasing("lowercase opening.\n\n##heading"), "Lowercase opening.\n\n## heading");
  const book = qaBook(); book.chapters = book.chapters.slice(0, 2).map((chapter) => ({ ...chapter, content: "same opening sentence for every chapter.\n\nUseful detail follows." })); book.chapterCount = 2;
  const quality = analyzeBookQuality(book); assert.deepEqual(quality.duplicateOpenings, [[1, 2]]); assert.ok(quality.chapters.every((chapter) => chapter.qualityFlags.includes("duplicate_opening")));
});

test("canonical manuscript order is deterministic and reports missing chapters", () => {
  const book = qaBook(); book.chapters = [book.chapters[2], book.chapters[0]];
  assert.deepEqual(findMissingChapterNumbers(book), [2, 4, 5, 6, 7, 8, 9, 10]);
  const manuscript = assembleManuscript(book); assert.deepEqual(manuscript.chapters.map((chapter) => chapter.chapterNumber), [1, 3]); assert.equal(manuscript.sections.find((section) => section.kind === "toc")?.paragraphs[0], `Chapter 1: ${book.chapters[1].title}`);
});

test("PDF and DOCX render complete valid binary packages", async () => {
  let book = qaBook(); book.chapters = book.chapters.slice(0, 2).map((chapter) => ({ ...chapter, content: writeSampleChapter(book, { ...chapter, targetWordCount: 350 }), targetWordCount: 350 })); book.chapterCount = 2; book.targetWords = 700; book.targetPageCount = 3; book = recalculateBook(book);
  const pdf = await renderPdf(book); assert.equal(pdf.subarray(0, 4).toString(), "%PDF"); const parsedPdf = await PDFDocument.load(pdf); assert.ok(parsedPdf.getPageCount() >= 5);
  const docx = await renderDocx(book); assert.equal(docx.subarray(0, 2).toString(), "PK"); assert.ok(docx.length > 5_000);
});

test("save and resume preserves books and beta feedback", () => {
  const feedback: BetaFeedback[] = [{ id: "feedback-1", bookId: "qa-book", type: "export_issue", message: "DOCX did not open in the earlier prototype.", severity: "critical", createdAt: new Date().toISOString() }];
  const restored = parseStudioState(serializeStudioState([qaBook()], feedback)); assert.equal(restored.books[0].title, form.title); assert.deepEqual(restored.feedback, feedback);
});

test("readiness blocks missing and underdeveloped chapters", () => {
  const book = qaBook(); book.chapters = book.chapters.slice(0, 9); const readiness = getPublishingReadiness(book); assert.equal(readiness.exportReadinessStatus, "blocked"); assert.deepEqual(readiness.missingChapterNumbers, [10]); assert.ok(readiness.blockers.some((blocker) => blocker.includes("90%")));
});
