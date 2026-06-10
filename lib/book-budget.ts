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
    const status = chapter.locked ? "locked" : actualWordCount === 0 ? "pending" : completion < CHAPTER_GENERATION_THRESHOLD ? "underdeveloped" : chapter.status === "expanded" ? "expanded" : "drafted";
    return { ...chapter, actualWordCount, estimatedPages: Math.ceil(actualWordCount / wordsPerPage), status } as Chapter;
  });
  const actualWords = chapters.reduce((sum, chapter) => sum + chapter.actualWordCount, 0);
  const actualEstimatedPages = Math.ceil(actualWords / wordsPerPage);
  const completed = chapters.filter((chapter) => chapter.actualWordCount >= chapter.targetWordCount * CHAPTER_GENERATION_THRESHOLD).length;
  const lengthReady = actualWords >= book.targetWords * MINIMUM_COMPLETION_THRESHOLD;
  const allComplete = completed === chapters.length;
  const status = lengthReady && allComplete && book.authorName.trim() && book.coverPrompt.trim() ? "ready_for_export" : actualWords ? "drafting" : "blueprint";
  return { ...book, wordsPerPage, chapters, actualWords, actualEstimatedPages, progress: chapters.length ? Math.round((completed / chapters.length) * 100) : 0, status };
}

export function getPublishingReadiness(book: Book): PublishingReadiness {
  const current = recalculateBook(book);
  const completedChapters = current.chapters.filter((chapter) => chapter.actualWordCount >= chapter.targetWordCount * CHAPTER_GENERATION_THRESHOLD).length;
  const lengthAccuracyPercent = current.targetWords ? Math.min(100, Math.round((current.actualWords / current.targetWords) * 100)) : 0;
  const blockers: string[] = [];
  if (!current.title.trim()) blockers.push("Add a book title.");
  if (!current.authorName.trim()) blockers.push("Add the author name.");
  if (!current.coverPrompt.trim()) blockers.push("Generate a cover concept.");
  if (lengthAccuracyPercent < 90) blockers.push("Your manuscript is below the requested length. Continue expanding before export.");
  if (completedChapters < current.chapterCount) blockers.push(`${current.chapterCount - completedChapters} chapter(s) are incomplete or underdeveloped.`);
  return {
    targetPages: current.targetPageCount,
    actualEstimatedPages: current.actualEstimatedPages,
    targetWords: current.targetWords,
    actualWords: current.actualWords,
    chapterCount: current.chapterCount,
    completedChapters,
    lengthAccuracyPercent,
    bookDnaConsistencyScore: current.bookDna?.themes?.length && current.bookDna?.styleRules?.length ? 100 : 70,
    exportReadinessStatus: blockers.length ? (lengthAccuracyPercent < 90 || !current.authorName.trim() ? "blocked" : "warning") : "ready",
    blockers,
  };
}
