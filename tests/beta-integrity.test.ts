import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import { buildBlueprint, buildChapterGenerationContext, buildChapterPrompt, writeSampleChapter } from "../lib/ai";
import { calculateBookBudget, getPublishingReadiness, recalculateBook } from "../lib/book-budget";
import { renderDocx, renderPdf } from "../lib/export-renderers";
import { assembleManuscript, findMissingChapterNumbers } from "../lib/manuscript";
import { deleteBookFromState, parseStudioState, serializeStudioState, visibleBooks } from "../lib/persistence";
import { analyzeBookQuality, analyzeChapterQuality, containsPromptLeakage, normalizeParagraphCasing } from "../lib/quality";
import type { BetaFeedback, Book, BookForm } from "../lib/types";
import { BOOK_TYPES, COVER_DESIGN_MODES, CREATION_PATHS } from "../lib/studio-catalog";

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

test("chapter generation keeps structured guidance separate from manuscript output", () => {
  const book = qaBook(); const chapter = book.chapters[1];
  const context = buildChapterGenerationContext(book, chapter); const prompt = buildChapterPrompt(book, chapter);
  assert.equal(context.audienceProfile, book.targetAudience);
  assert.deepEqual(context.previousChapterSummaries, [book.chapters[0].summary]);
  assert.match(prompt, /GENERATION_CONTEXT/); assert.match(prompt, /private editorial guidance/); assert.match(prompt, /Return only publishable chapter prose/);
  const manuscript = writeSampleChapter(book, { ...chapter, targetWordCount: 350 });
  assert.equal(containsPromptLeakage(manuscript), false); assert.doesNotMatch(manuscript, /Guide a professional|Book DNA|Target audience:/i);
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
  const manuscript = assembleManuscript(book); assert.deepEqual(manuscript.chapters.map((chapter) => chapter.chapterNumber), [1, 3]); assert.deepEqual(manuscript.sections.find((section) => section.kind === "toc")?.paragraphs.slice(0, 2), ["Part I: The Old Operating Model", `Chapter 1: ${book.chapters[1].title}`]);
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


test("quality engine detects prompt leakage and cross-chapter duplicate paragraphs", () => {
  const book = qaBook(); const duplicated = "A unique operational example becomes useful when the team records the decision, evidence, result, and next responsible move.";
  book.chapters[0].content = duplicated;
  const chapter = { ...book.chapters[1], content: `Guide a professional through this chapter.\n\n${duplicated}` };
  const quality = analyzeChapterQuality(chapter, [book.chapters[0], chapter]);
  assert.ok(quality.flags.includes("prompt_leakage")); assert.ok(quality.flags.includes("duplicate_paragraph")); assert.equal(quality.status, "prompt_leak_detected");
});

test("soft and permanent deletion remove drafts from Books in Progress", () => {
  const book = qaBook(); const companion = { ...qaBook(), id: "keep-book", title: "Keep Me" };
  const softDeleted = deleteBookFromState([book, companion], book.id, false, "2026-06-10T00:00:00.000Z");
  assert.deepEqual(visibleBooks(softDeleted).map((item) => item.id), ["keep-book"]);
  const deleted = softDeleted.find((item) => item.id === book.id)!;
  assert.equal(deleted.status, "deleted"); assert.equal(deleted.deletedAt, "2026-06-10T00:00:00.000Z"); assert.deepEqual(deleted.chapters, []); assert.deepEqual(deleted.exportHistory, []);
  assert.deepEqual(deleteBookFromState([book, companion], book.id, true).map((item) => item.id), ["keep-book"]);
});


test("fatal padding phrases are removed from clean count and block publishing", () => {
  const book = qaBook();
  const filler = "Application 1 of chapter 1 tests this section’s principle. Evidence 1 frames a situation. Decision 1 names the choice. Pattern 1 records conditions. Trial 1 produces evidence. Reflection 1 chooses the next move.";
  book.chapters[0].content = filler.repeat(40);
  const quality = analyzeBookQuality(book);
  const readiness = getPublishingReadiness(book);
  assert.equal(quality.fatalFillerDetected, true);
  assert.ok(quality.cleanWordCount < quality.rawWordCount);
  assert.equal(readiness.exportReadinessStatus, "blocked");
  assert.ok(readiness.blockers.some((blocker) => blocker.includes("padding")));
});

test("canonical assembly starts with a designed cover and never exports cover direction metadata", () => {
  const book = qaBook();
  book.chapters = book.chapters.map((chapter) => ({ ...chapter, content: writeSampleChapter(book, { ...chapter, targetWordCount: 350 }), targetWordCount: 350 }));
  const manuscript = assembleManuscript(book);
  assert.equal(manuscript.sections[0].kind, "cover");
  assert.equal(manuscript.sections[0].title, book.title);
  assert.equal(manuscript.sections.some((section) => section.title === "Cover direction"), false);
  assert.doesNotMatch(JSON.stringify(manuscript.sections), /Midnight blue field with a warm gold clarity loop/);
  assert.equal(manuscript.sections.filter((section) => section.kind === "part_divider").length, 4);
});

test("Clarity Loop blueprint uses the required thesis-aligned parts and chapter titles", () => {
  const chapters = buildBlueprint(form);
  assert.deepEqual(chapters.map((chapter) => chapter.title), [
    "The Cost of Waiting for Certainty", "Why Modern Work Stalls", "The Limits of Linear Planning", "When Action Creates Understanding", "Kidlin’s Law and the Written Problem",
    "Vibe Coding and Discovery Through Building", "The Four Movements of Clarity", "From Feedback to Better Decisions", "Modernization as a Way of Thinking", "Leading in the Age of Intelligent Systems",
  ]);
  assert.ok(chapters.every((chapter) => chapter.thesis && chapter.objective && chapter.exampleBank?.length && chapter.readerTakeaway));
  assert.doesNotMatch(JSON.stringify(chapters.map((chapter) => chapter.outline)), /Open with a distinct|Develop the central insight|Close with a chapter summary/);
});

test("missing cover and padding failures cannot reach PDF or DOCX readiness", () => {
  const book = qaBook(); book.useDesignedCover = false; book.coverImageUrl = undefined; book.coverPrompt = "";
  const readiness = getPublishingReadiness(book);
  assert.equal(readiness.coverStatus, "missing");
  assert.equal(readiness.pdfReady, false);
  assert.equal(readiness.docxReady, false);
  assert.equal(readiness.readinessStatus, "needs_cover");
});

test("creation path catalog exposes all seven tailored publishing workflows", () => {
  assert.deepEqual(CREATION_PATHS.map((path: { id: string }) => path.id), ["start_from_idea", "nonfiction_book", "fiction_book", "upload_manuscript", "screen_adaptation", "publishing_pack", "movie_pitch_pack"]);
  assert.ok(BOOK_TYPES.nonfiction.includes("Government Modernization"));
  assert.ok(BOOK_TYPES.fiction.includes("Speculative Fiction"));
  assert.ok(BOOK_TYPES.special.includes("TV Pilot"));
  assert.ok(COVER_DESIGN_MODES.includes("Executive Business"));
});

test("forbidden phrase families are reported exactly, removed from clean count, and block readiness above threshold", () => {
  const phrase = "in relation to operating reality";
  const repeated = Array.from({ length: 6 }, (_, index) => `Observation ${index + 1} matters ${phrase} because teams need specific evidence before acting.`).join("\n\n");
  const book = qaBook();
  book.chapters = book.chapters.map((chapter, index) => index === 0 ? { ...chapter, content: repeated, targetWordCount: 20, status: "reviewed", locked: true } : { ...chapter, content: Array.from({ length: 12 }, (_, paragraph) => `Chapter ${chapter.chapterNumber} evidence ${paragraph} describes a distinct decision, stakeholder, constraint, result, and next action for this specific case study.`).join("\n\n"), targetWordCount: 20, status: "reviewed", locked: true });
  book.targetWords = 200;
  book.useDesignedCover = true;
  const analysis = analyzeBookQuality(book);
  const family = analysis.repeatedPhraseFamilies.find((item) => item.phrase === phrase);
  assert.equal(family?.occurrences, 6);
  assert.equal(family?.exceedsThreshold, true);
  assert.ok(analysis.cleanWordCount < analysis.rawWordCount);
  assert.ok(getPublishingReadiness(book).blockers.some((blocker) => blocker.includes(phrase)));
});

test("every creation atelier path has distinct ideation fields, copy, steps, and preview intelligence", () => {
  assert.equal(CREATION_PATHS.length, 7);
  assert.equal(new Set(CREATION_PATHS.map((path) => path.stepOne.title)).size, 7);
  assert.equal(new Set(CREATION_PATHS.map((path) => path.headline)).size, 7);
  assert.ok(CREATION_PATHS.every((path) => path.stepOne.fields.length >= 5));
  assert.ok(CREATION_PATHS.every((path) => path.steps.length === 4 && path.preview.length === 4));

  const fiction = CREATION_PATHS.find((path) => path.id === "fiction_book")!;
  assert.deepEqual(fiction.stepOne.fields.map((field) => field.name), ["storyTitle", "authorName", "genre", "mainCharacter", "centralConflict", "setting", "emotionalPromise"]);
  const nonfiction = CREATION_PATHS.find((path) => path.id === "nonfiction_book")!;
  assert.ok(["centralThesis", "readerProblem", "readerTransformation", "frameworkOrMethod"].every((name) => nonfiction.stepOne.fields.some((field) => field.name === name)));
  const upload = CREATION_PATHS.find((path) => path.id === "upload_manuscript")!;
  assert.ok(upload.stepOne.fields.some((field) => field.type === "file"));
  assert.ok(upload.stepOne.fields.some((field) => field.type === "url"));
  const pitch = CREATION_PATHS.find((path) => path.id === "movie_pitch_pack")!;
  assert.ok(["premise", "format", "targetAudience", "whyNow"].every((name) => pitch.stepOne.fields.some((field) => field.name === name)));
});
