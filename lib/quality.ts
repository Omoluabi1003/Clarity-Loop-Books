import { CHAPTER_GENERATION_THRESHOLD, countWords } from "./book-budget";
import type { Book, Chapter, QualityStatus } from "./types";

const HEADING = /^#{1,6}\s+|^[A-Z][^.!?]{2,70}$/;
export const FORBIDDEN_MANUSCRIPT_PATTERNS = [
  /guide a professional/i,
  /my ideal reader is/i,
  /the ideal reader is/i,
  /they want to improve decision-making/i,
  /after reading this book/i,
  /\bbook dna\b/i,
  /\btone\s*:/i,
  /writing style\s*:/i,
  /target audience\s*:/i,
  /chapter intention/i,
  /this chapter should/i,
  /the reader should/i,
  /use the following/i,
];

function normalizeForComparison(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function proseBlocks(content: string): string[] {
  return normalizeParagraphCasing(content).split(/\n{2,}/).filter((block) => block && !HEADING.test(block));
}

export function normalizeParagraphCasing(content: string): string {
  return content.replace(/\r\n/g, "\n").split(/\n{2,}/).map((block) => {
    const trimmed = block.trim().replace(/^[-*]\s*$/, "");
    if (!trimmed) return "";
    if (trimmed.startsWith("#")) return trimmed.replace(/^(#+)([^\s#])/, "$1 $2");
    return trimmed.replace(/^(["'“‘(]*)([a-z])/, (_, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);
  }).filter(Boolean).join("\n\n");
}

function normalizedOpening(chapter: Chapter): string {
  return normalizeForComparison(proseBlocks(chapter.content)[0] || "").split(/\s+/).slice(0, 12).join(" ");
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

export function containsPromptLeakage(content: string): boolean {
  return FORBIDDEN_MANUSCRIPT_PATTERNS.some((pattern) => pattern.test(content));
}

function hasCrossChapterParagraph(chapter: Chapter, allChapters: Chapter[]): boolean {
  const current = new Set(proseBlocks(chapter.content).map(normalizeForComparison).filter((block) => block.split(" ").length >= 8));
  return allChapters.some((candidate) => candidate.id !== chapter.id && proseBlocks(candidate.content).some((block) => current.has(normalizeForComparison(block))));
}

function hasRepeatedPhrase(content: string): boolean {
  const blocks = proseBlocks(content).map((block) => normalizeForComparison(block).split(" ").filter(Boolean));
  for (let blockIndex = 1; blockIndex < blocks.length; blockIndex += 1) {
    const previous = new Set<string>();
    for (let index = 0; index <= blocks[blockIndex - 1].length - 10; index += 1) previous.add(blocks[blockIndex - 1].slice(index, index + 10).join(" "));
    for (let index = 0; index <= blocks[blockIndex].length - 10; index += 1) {
      if (previous.has(blocks[blockIndex].slice(index, index + 10).join(" "))) return true;
    }
  }
  return false;
}

export function qualityStatusFor(flags: string[]): QualityStatus {
  if (flags.includes("prompt_leakage")) return "prompt_leak_detected";
  if (flags.some((flag) => flag.startsWith("duplicate_") || flag === "repeated_phrase")) return "duplicate_content_detected";
  if (flags.includes("underdeveloped")) return "underdeveloped";
  return flags.length ? "needs_review" : "ready";
}

export function analyzeChapterQuality(chapter: Chapter, allChapters: Chapter[] = []): { content: string; flags: string[]; score: number; status: QualityStatus } {
  const content = normalizeParagraphCasing(chapter.content);
  const blocks = content.split(/\n{2,}/).filter(Boolean);
  const flags: string[] = [];
  const normalizedBlocks = blocks.map(normalizeForComparison);
  if (!content.trim()) flags.push("empty_section");
  if (countWords(content) < chapter.targetWordCount * CHAPTER_GENERATION_THRESHOLD) flags.push("underdeveloped");
  if (new Set(normalizedBlocks).size !== normalizedBlocks.length || hasCrossChapterParagraph({ ...chapter, content }, allChapters)) flags.push("duplicate_paragraph");
  if (hasRepeatedPhrase(content)) flags.push("repeated_phrase");
  if (containsPromptLeakage(content)) flags.push("prompt_leakage");
  if ((proseBlocks(content).join(" ").match(new RegExp(`\\b${chapter.title.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "gi")) || []).length > 1) flags.push("chapter_title_recycled");
  if (/^#{1,6}[^\s#]/m.test(chapter.content)) flags.push("broken_markdown");
  if (blocks.some((block, index) => HEADING.test(block) && (!blocks[index + 1] || HEADING.test(blocks[index + 1])))) flags.push("orphan_heading");
  const duplicateGroup = findDuplicateOpenings(allChapters).find((group) => group.includes(chapter.chapterNumber));
  if (duplicateGroup) flags.push("duplicate_opening");
  const uniqueFlags = [...new Set(flags)];
  const score = Math.max(0, 100 - uniqueFlags.reduce((total, flag) => total + (flag === "prompt_leakage" ? 30 : flag.startsWith("duplicate_") ? 20 : 12), 0));
  return { content, flags: uniqueFlags, score, status: qualityStatusFor(uniqueFlags) };
}

export function analyzeBookQuality(book: Book): { chapters: Chapter[]; score: number; duplicateOpenings: number[][] } {
  const normalized = book.chapters.map((chapter) => ({ ...chapter, content: normalizeParagraphCasing(chapter.content) }));
  const chapters = normalized.map((chapter) => {
    const analysis = analyzeChapterQuality(chapter, normalized);
    return { ...chapter, content: analysis.content, qualityFlags: analysis.flags, qualityScore: analysis.score, qualityStatus: analysis.status, leakageDetected: analysis.flags.includes("prompt_leakage"), duplicateDetected: analysis.flags.some((flag) => flag.startsWith("duplicate_") || flag === "repeated_phrase") };
  });
  const score = chapters.length ? Math.round(chapters.reduce((sum, chapter) => sum + (chapter.qualityScore || 0), 0) / chapters.length) : 0;
  return { chapters, score, duplicateOpenings: findDuplicateOpenings(chapters) };
}
