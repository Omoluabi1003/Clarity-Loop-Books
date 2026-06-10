import type { Book, Chapter } from "./types";

export interface ManuscriptSection {
  kind: "cover_metadata" | "title_page" | "copyright" | "author_bio" | "toc" | "chapter" | "closing_notes";
  title: string;
  paragraphs: string[];
  chapter?: Chapter;
  pageBreakBefore?: boolean;
}

export interface AssembledManuscript {
  bookId: string;
  title: string;
  authorName: string;
  sections: ManuscriptSection[];
  chapters: Chapter[];
  missingChapterNumbers: number[];
}

export function orderedChapters(book: Book): Chapter[] {
  return [...book.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber || a.id.localeCompare(b.id));
}

export function findMissingChapterNumbers(book: Book): number[] {
  const present = new Set(book.chapters.map((chapter) => chapter.chapterNumber));
  return Array.from({ length: book.chapterCount }, (_, index) => index + 1).filter((number) => !present.has(number));
}

export function contentParagraphs(content: string): string[] {
  return content.replace(/\r\n/g, "\n").split(/\n{2,}/).map((value) => value.trim()).filter(Boolean);
}

export function assembleManuscript(book: Book): AssembledManuscript {
  const chapters = orderedChapters(book);
  const sections: ManuscriptSection[] = [
    { kind: "cover_metadata", title: "Cover direction", paragraphs: [book.coverDirection || book.coverPrompt].filter(Boolean) },
    { kind: "title_page", title: book.title, paragraphs: [book.subtitle, `By ${book.authorName}`, book.publisherCredit || ""].filter(Boolean), pageBreakBefore: true },
  ];
  if (book.copyrightPage || book.publisherCredit) sections.push({ kind: "copyright", title: "Copyright", paragraphs: [book.copyrightPage || `Copyright © ${new Date().getUTCFullYear()} ${book.authorName}. All rights reserved.`, book.publisherCredit || ""].filter(Boolean), pageBreakBefore: true });
  if (book.authorBio) sections.push({ kind: "author_bio", title: "About the Author", paragraphs: contentParagraphs(book.authorBio), pageBreakBefore: true });
  sections.push({ kind: "toc", title: "Table of Contents", paragraphs: chapters.map((chapter) => `Chapter ${chapter.chapterNumber}: ${chapter.title}`), pageBreakBefore: true });
  for (const chapter of chapters) sections.push({ kind: "chapter", title: `Chapter ${chapter.chapterNumber}: ${chapter.title}`, paragraphs: contentParagraphs(chapter.content), chapter, pageBreakBefore: true });
  if (book.closingNotes) sections.push({ kind: "closing_notes", title: "Closing Notes", paragraphs: contentParagraphs(book.closingNotes), pageBreakBefore: true });
  return { bookId: book.id, title: book.title, authorName: book.authorName, sections, chapters, missingChapterNumbers: findMissingChapterNumbers(book) };
}
