import { analyzeBookQuality, cleanManuscriptContent, normalizeForComparison } from "./quality";
import type { Book, Chapter } from "./types";

export interface ManuscriptSection {
  kind: "cover" | "title_page" | "copyright" | "author_bio" | "toc" | "part_divider" | "chapter" | "closing_notes";
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
  return content.replace(/\r\n/g, "\n").split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function cleanCanonicalChapters(book: Book): Chapter[] {
  const analysis = analyzeBookQuality(book);
  const paragraphCounts = new Map<string, number>();
  for (const chapter of analysis.chapters) {
    for (const block of contentParagraphs(chapter.content).filter((item) => !item.startsWith("#"))) {
      const key = normalizeForComparison(block);
      if (key.split(" ").length >= 8) paragraphCounts.set(key, (paragraphCounts.get(key) || 0) + 1);
    }
  }
  const duplicates = new Set([...paragraphCounts].filter(([, count]) => count > 1).map(([key]) => key));
  return orderedChapters({ ...book, chapters: analysis.chapters }).map((chapter) => ({ ...chapter, content: cleanManuscriptContent(chapter.content, duplicates) }));
}

export function assembleManuscript(book: Book): AssembledManuscript {
  const chapters = cleanCanonicalChapters(book);
  const sections: ManuscriptSection[] = [
    { kind: "cover", title: book.title, paragraphs: [book.subtitle, book.authorName, book.publisherCredit || ""].filter(Boolean) },
    { kind: "title_page", title: book.title, paragraphs: [book.subtitle, `By ${book.authorName}`, book.publisherCredit || ""].filter(Boolean), pageBreakBefore: true },
  ];
  sections.push({ kind: "copyright", title: "Copyright", paragraphs: [book.copyrightPage || `Copyright © ${new Date().getUTCFullYear()} ${book.authorName}. All rights reserved.`, book.publisherCredit || ""].filter(Boolean), pageBreakBefore: true });
  if (book.authorBio) sections.push({ kind: "author_bio", title: "About the Author", paragraphs: contentParagraphs(book.authorBio), pageBreakBefore: true });
  const toc: string[] = [];
  let tocPart = "";
  for (const chapter of chapters) {
    if (chapter.partTitle && chapter.partTitle !== tocPart) { toc.push(chapter.partTitle); tocPart = chapter.partTitle; }
    toc.push(`Chapter ${chapter.chapterNumber}: ${chapter.title}`);
  }
  sections.push({ kind: "toc", title: "Table of Contents", paragraphs: toc, pageBreakBefore: true });
  let currentPart = "";
  for (const chapter of chapters) {
    if (chapter.partTitle && chapter.partTitle !== currentPart) {
      currentPart = chapter.partTitle;
      sections.push({ kind: "part_divider", title: currentPart, paragraphs: [chapter.thesis || chapter.summary].filter(Boolean), pageBreakBefore: true });
    }
    sections.push({ kind: "chapter", title: `Chapter ${chapter.chapterNumber}: ${chapter.title}`, paragraphs: contentParagraphs(chapter.content), chapter, pageBreakBefore: true });
  }
  if (book.closingNotes) sections.push({ kind: "closing_notes", title: "Closing Notes", paragraphs: contentParagraphs(book.closingNotes), pageBreakBefore: true });
  return { bookId: book.id, title: book.title, authorName: book.authorName, sections, chapters, missingChapterNumbers: findMissingChapterNumbers(book) };
}
