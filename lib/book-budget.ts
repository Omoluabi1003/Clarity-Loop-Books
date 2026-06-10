import { analyzeBookQuality, MAX_DUPLICATE_PARAGRAPH_RATE } from "./quality";
import type { Book, BookForm, Chapter, PublishingReadiness } from "./types";

export const DEFAULT_WORDS_PER_PAGE = 275;
export const MIN_WORDS_PER_PAGE = 250;
export const MAX_WORDS_PER_PAGE = 300;
export const MINIMUM_COMPLETION_THRESHOLD = 0.9;
export const CHAPTER_GENERATION_THRESHOLD = 0.85;

export function countWords(content: string): number {
  return content.trim() ? content.trim().split(/\s+/).length : 0;
}

export function normalizeWordsPerPage(value?: number): number {
  return Math.min(MAX_WORDS_PER_PAGE, Math.max(MIN_WORDS_PER_PAGE, Math.round(value || DEFAULT_WORDS_PER_PAGE)));
}

export function calculateBookBudget(input: Pick<BookForm, "targetPageCount" | "chapterCount" | "wordsPerPage">) {
  const wordsPerPage = normalizeWordsPerPage(input.wordsPerPage);
  const targetPages = Math.max(1, Math.round(input.targetPageCount));
  const chapterCount = Math.max(1, Math.round(input.chapterCount));
  const targetWords = targetPages * wordsPerPage;
  const averageWordsPerChapter = Math.round(targetWords / chapterCount);
  const chapterBudgets = Array.from({ length: chapterCount }, (_, index) => {
    const base = Math.floor(targetWords / chapterCount);
    return base + (index < targetWords % chapterCount ? 1 : 0);
  });
  return { wordsPerPage, targetPages, chapterCount, targetWords, averageWordsPerChapter, chapterBudgets };
}

function findMissingChapterNumbers(book: Book): number[] {
  const present = new Set(book.chapters.map((chapter) => chapter.chapterNumber));
  return Array.from({ length: book.chapterCount }, (_, index) => index + 1).filter((number) => !present.has(number));
}

export function recalculateBook(book: Book): Book {
  const wordsPerPage = normalizeWordsPerPage(book.wordsPerPage);
  const analyzed = analyzeBookQuality(book);
  const chapters = analyzed.chapters.map((chapter) => {
    const actualWordCount = countWords(chapter.content);
    const cleanWordCount = chapter.cleanWordCount ?? actualWordCount;
    const completion = chapter.targetWordCount ? cleanWordCount / chapter.targetWordCount : 0;
    const failedQuality = chapter.qualityStatus === "failed_quality_review" || chapter.qualityStatus === "prompt_leak_detected";
    const status = chapter.locked ? "locked" : actualWordCount === 0 ? "pending" : failedQuality ? "failed_quality_review" : completion < CHAPTER_GENERATION_THRESHOLD ? "underdeveloped" : chapter.status === "expanded" ? "expanded" : chapter.status === "reviewed" ? "reviewed" : chapter.status === "edited" ? "edited" : "drafted";
    return { ...chapter, actualWordCount, estimatedPages: Math.ceil(cleanWordCount / wordsPerPage), status } as Chapter;
  });
  const actualWords = analyzed.rawWordCount;
  const actualEstimatedPages = Math.ceil(analyzed.cleanWordCount / wordsPerPage);
  const completed = chapters.filter((chapter) => !chapter.qualityFlags.length && chapter.actualWordCount >= chapter.targetWordCount * CHAPTER_GENERATION_THRESHOLD).length;
  const missing = findMissingChapterNumbers({ ...book, chapters });
  const coverExists = Boolean(book.coverImageUrl || book.useDesignedCover !== false && book.title.trim() && book.authorName.trim());
  const ready = analyzed.cleanWordCount >= book.targetWords * MINIMUM_COMPLETION_THRESHOLD && completed === book.chapterCount && !missing.length && coverExists;
  const status = book.deletedAt || book.status === "deleted" ? "deleted" : ready ? "ready_for_export" : actualWords ? "drafting" : "blueprint";
  return { ...book, wordsPerPage, chapters, actualWords, actualEstimatedPages, qualityScore: analyzed.score, progress: book.chapterCount ? Math.round((completed / book.chapterCount) * 100) : 0, status };
}

export function getPublishingReadiness(book: Book): PublishingReadiness {
  const analyzed = analyzeBookQuality(book);
  const current = recalculateBook({ ...book, chapters: analyzed.chapters });
  const missingChapterNumbers = findMissingChapterNumbers(current);
  const cleanLengthAccuracyPercent = current.targetWords ? Math.min(100, Math.round((analyzed.cleanWordCount / current.targetWords) * 100)) : 0;
  const completedChapters = current.chapters.filter((chapter) => chapter.qualityFlags.length === 0 && chapter.actualWordCount >= chapter.targetWordCount * CHAPTER_GENERATION_THRESHOLD).length;
  const coverStatus = current.coverImageUrl ? "uploaded" as const : current.useDesignedCover !== false && current.title.trim() && current.authorName.trim() ? "designed_placeholder" as const : "missing" as const;
  const blockers: string[] = [];
  const warnings: string[] = [];
  if (!current.title.trim()) blockers.push("Add a book title.");
  if (!current.authorName.trim()) blockers.push("Add the author name.");
  if (coverStatus === "missing") blockers.push("A designed or uploaded cover asset is required.");
  if (missingChapterNumbers.length) blockers.push(`Missing chapter number(s): ${missingChapterNumbers.join(", ")}.`);
  if (cleanLengthAccuracyPercent < 90) blockers.push("Clean manuscript word count is below 90% of the requested length.");
  if (completedChapters < current.chapterCount) blockers.push(`${current.chapterCount - completedChapters} chapter(s) are incomplete or failed quality review.`);
  if (analyzed.fatalFillerDetected) blockers.push("Numbered padding or prohibited filler was detected.");
  if (analyzed.phraseThresholdExceeded) blockers.push(`Repeated phrase families exceed the publishing threshold: ${analyzed.repeatedPhraseFamilies.filter((family) => family.exceedsThreshold).map((family) => family.phrase).join(", ")}.`);
  if (analyzed.promptLeakageDetected || analyzed.scaffoldLeakageDetected) blockers.push("Prompt or scaffold leakage must be removed before export.");
  if (analyzed.duplicateParagraphRate > MAX_DUPLICATE_PARAGRAPH_RATE) blockers.push("Duplicate paragraph rate exceeds the publishing threshold.");
  if (analyzed.duplicateOpenings.length) blockers.push("Repeated chapter openings need repair.");
  if (current.chapters.some((chapter) => /^(?:chapter|section)\s+\d+$/i.test(chapter.title.trim()) || /\b(?:building the practice|the way forward)\s+\d+$/i.test(chapter.title.trim()))) blockers.push("Placeholder chapter numbering must be replaced with thesis-aligned titles.");
  if (!current.chapters.length || current.chapters.some((chapter) => !chapter.title.trim() || !chapter.summary.trim())) blockers.push("The table of contents is incomplete or not aligned to the blueprint.");
  if (!current.subtitle.trim()) warnings.push("A subtitle is recommended for this publishing format.");
  if (!current.authorBio.trim()) warnings.push("An author bio is recommended for the finished book.");
  const readinessStatus = blockers.some((value) => value.includes("cover")) ? "needs_cover" : blockers.some((value) => value.includes("word count") || value.includes("incomplete")) ? "needs_expansion" : blockers.length ? "needs_content_review" : current.status === "exported" ? "exported" : "ready_for_export";
  const repetitionRisk = analyzed.duplicateParagraphRate > MAX_DUPLICATE_PARAGRAPH_RATE ? "high" : analyzed.duplicateParagraphRate > MAX_DUPLICATE_PARAGRAPH_RATE / 2 || analyzed.duplicateOpenings.length ? "medium" : "low";
  return {
    targetPages: current.targetPageCount,
    actualEstimatedPages: current.actualEstimatedPages,
    targetWords: current.targetWords,
    actualWords: analyzed.rawWordCount,
    rawWords: analyzed.rawWordCount,
    cleanWords: analyzed.cleanWordCount,
    cleanLengthAccuracyPercent,
    duplicateParagraphRate: analyzed.duplicateParagraphRate,
    repetitionRisk,
    promptLeakageDetected: analyzed.promptLeakageDetected,
    scaffoldLeakageDetected: analyzed.scaffoldLeakageDetected,
    coverStatus,
    pdfReady: blockers.length === 0,
    docxReady: blockers.length === 0,
    readinessStatus,
    chapterCount: current.chapterCount,
    completedChapters,
    missingChapterNumbers,
    lengthAccuracyPercent: cleanLengthAccuracyPercent,
    bookDnaConsistencyScore: current.bookDna?.themes?.length && current.bookDna?.styleRules?.length ? 100 : 70,
    qualityScore: analyzed.score,
    exportReadinessStatus: blockers.length ? "blocked" : warnings.length ? "warning" : "ready",
    blockers,
    warnings,
  };
}
