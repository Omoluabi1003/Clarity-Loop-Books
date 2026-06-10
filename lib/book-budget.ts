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

export function recalculateBook(book: Book): Book {
  const wordsPerPage = normalizeWordsPerPage(book.wordsPerPage);
  const chapters = book.chapters.map((chapter) => {
    const actualWordCount = countWords(chapter.content);
    const completion = chapter.targetWordCount ? actualWordCount / chapter.targetWordCount : 0;
    const status = chapter.locked ? "locked" : actualWordCount === 0 ? "pending" : completion < CHAPTER_GENERATION_THRESHOLD ? "underdeveloped" : chapter.status === "expanded" ? "expanded" : chapter.status === "reviewed" ? "reviewed" : "drafted";
    return { ...chapter, qualityFlags: chapter.qualityFlags || [], openingStyle: chapter.openingStyle || "observation", actualWordCount, estimatedPages: Math.ceil(actualWordCount / wordsPerPage), status } as Chapter;
  });
  const actualWords = chapters.reduce((sum, chapter) => sum + chapter.actualWordCount, 0);
  const actualEstimatedPages = Math.ceil(actualWords / wordsPerPage);
  const completed = chapters.filter((chapter) => chapter.actualWordCount >= chapter.targetWordCount * CHAPTER_GENERATION_THRESHOLD).length;
  const expected = new Set(Array.from({ length: book.chapterCount }, (_, index) => index + 1));
  chapters.forEach((chapter) => expected.delete(chapter.chapterNumber));
  const lengthReady = actualWords >= book.targetWords * MINIMUM_COMPLETION_THRESHOLD;
  const allComplete = completed === book.chapterCount && expected.size === 0;
  const qualityScore = chapters.length ? Math.round(chapters.reduce((sum, chapter) => sum + (chapter.qualityScore ?? (chapter.qualityFlags.length ? 70 : 100)), 0) / chapters.length) : 0;
  const status = lengthReady && allComplete && book.authorName.trim() && book.coverPrompt.trim() ? "ready_for_export" : actualWords ? "drafting" : "blueprint";
  return { ...book, wordsPerPage, chapters, actualWords, actualEstimatedPages, qualityScore, progress: book.chapterCount ? Math.round((completed / book.chapterCount) * 100) : 0, status };
}

export function getPublishingReadiness(book: Book): PublishingReadiness {
  const current = recalculateBook(book);
  const completedChapters = current.chapters.filter((chapter) => chapter.actualWordCount >= chapter.targetWordCount * CHAPTER_GENERATION_THRESHOLD).length;
  const missingChapterNumbers = Array.from({ length: current.chapterCount }, (_, index) => index + 1).filter((number) => !current.chapters.some((chapter) => chapter.chapterNumber === number));
  const lengthAccuracyPercent = current.targetWords ? Math.min(100, Math.round((current.actualWords / current.targetWords) * 100)) : 0;
  const blockers: string[] = [];
  const warnings: string[] = [];
  if (!current.title.trim()) blockers.push("Add a book title.");
  if (!current.authorName.trim()) blockers.push("Add the author name.");
  if (!current.coverPrompt.trim()) blockers.push("Add a cover direction or generated cover concept.");
  if (missingChapterNumbers.length) blockers.push(`Missing chapter number(s): ${missingChapterNumbers.join(", ")}.`);
  if (lengthAccuracyPercent < 90) blockers.push("The manuscript is below 90% of the requested length.");
  if (completedChapters < current.chapterCount) blockers.push(`${current.chapterCount - completedChapters} chapter(s) are incomplete or underdeveloped.`);
  if (current.chapters.some((chapter) => chapter.qualityFlags.includes("duplicate_opening"))) warnings.push("Repeated chapter openings need review.");
  if (current.chapters.some((chapter) => chapter.qualityFlags.length)) warnings.push("One or more chapters have unresolved quality flags.");
  if (!current.authorBio.trim()) warnings.push("Author bio is optional but recommended for a professional manuscript.");
  return {
    targetPages: current.targetPageCount,
    actualEstimatedPages: current.actualEstimatedPages,
    targetWords: current.targetWords,
    actualWords: current.actualWords,
    chapterCount: current.chapterCount,
    completedChapters,
    missingChapterNumbers,
    lengthAccuracyPercent,
    bookDnaConsistencyScore: current.bookDna?.themes?.length && current.bookDna?.styleRules?.length ? 100 : 70,
    qualityScore: current.qualityScore,
    exportReadinessStatus: blockers.length ? "blocked" : warnings.length ? "warning" : "ready",
    blockers,
    warnings,
  };
}
