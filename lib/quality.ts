import { CHAPTER_GENERATION_THRESHOLD, countWords } from "./book-budget";
import type { Book, Chapter } from "./types";

const HEADING = /^#{1,6}\s+|^[A-Z][^.!?]{2,70}$/;

export function normalizeParagraphCasing(content: string): string {
  return content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim().replace(/^[-*]\s*$/, "");
      if (!trimmed) return "";
      if (trimmed.startsWith("#")) return trimmed.replace(/^(#+)([^\s#])/, "$1 $2");
      return trimmed.replace(/^(["'“‘(]*)([a-z])/, (_, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);
    })
    .filter(Boolean)
    .join("\n\n");
}

function normalizedOpening(chapter: Chapter): string {
  return normalizeParagraphCasing(chapter.content)
    .split(/\n{2,}/)
    .find((block) => block && !HEADING.test(block))
    ?.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).slice(0, 12).join(" ") || "";
}

export function findDuplicateOpenings(chapters: Chapter[]): number[][] {
  const groups = new Map<string, number[]>();
  for (const chapter of chapters) {
    const opening = normalizedOpening(chapter);
    if (!opening) continue;
    groups.set(opening, [...(groups.get(opening) || []), chapter.chapterNumber]);
  }
  return [...groups.values()].filter((numbers) => numbers.length > 1);
}

export function analyzeChapterQuality(chapter: Chapter, allChapters: Chapter[] = []): { content: string; flags: string[]; score: number } {
  const content = normalizeParagraphCasing(chapter.content);
  const blocks = content.split(/\n{2,}/).filter(Boolean);
  const flags: string[] = [];
  const normalizedBlocks = blocks.map((block) => block.toLowerCase().replace(/\s+/g, " "));
  if (!content.trim()) flags.push("empty_section");
  if (countWords(content) < chapter.targetWordCount * CHAPTER_GENERATION_THRESHOLD) flags.push("underdeveloped");
  if (new Set(normalizedBlocks).size !== normalizedBlocks.length) flags.push("duplicate_paragraph");
  if (/^#{1,6}[^\s#]/m.test(chapter.content)) flags.push("broken_markdown");
  if (blocks.some((block, index) => HEADING.test(block) && (!blocks[index + 1] || HEADING.test(blocks[index + 1])))) flags.push("orphan_heading");
  const duplicateGroup = findDuplicateOpenings(allChapters).find((group) => group.includes(chapter.chapterNumber));
  if (duplicateGroup) flags.push("duplicate_opening");
  const score = Math.max(0, 100 - flags.length * 15);
  return { content, flags, score };
}

export function analyzeBookQuality(book: Book): { chapters: Chapter[]; score: number; duplicateOpenings: number[][] } {
  const normalized = book.chapters.map((chapter) => ({ ...chapter, content: normalizeParagraphCasing(chapter.content) }));
  const chapters = normalized.map((chapter) => {
    const analysis = analyzeChapterQuality(chapter, normalized);
    return { ...chapter, content: analysis.content, qualityFlags: analysis.flags, qualityScore: analysis.score };
  });
  const score = chapters.length ? Math.round(chapters.reduce((sum, chapter) => sum + (chapter.qualityScore || 0), 0) / chapters.length) : 0;
  return { chapters, score, duplicateOpenings: findDuplicateOpenings(chapters) };
}
