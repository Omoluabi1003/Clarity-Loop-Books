const CHAPTER_GENERATION_THRESHOLD = 0.85;
function countWords(content: string): number { return content.trim() ? content.trim().split(/\s+/).length : 0; }
import type { Book, Chapter, QualityStatus } from "./types";

const HEADING = /^#{1,6}\s+|^[A-Z][^.!?]{2,70}$/;
const MIN_DUPLICATE_WORDS = 8;
export const MAX_DUPLICATE_PARAGRAPH_RATE = 0.08;

export const FATAL_MANUSCRIPT_PATTERNS: RegExp[] = [
  /Application\s+\d+\s+of\s+chapter/i,
  /Evidence\s+\d+\s+frames/i,
  /Decision\s+\d+\s+names/i,
  /Pattern\s+\d+\s+records/i,
  /Trial\s+\d+\s+produces/i,
  /Reflection\s+\d+\s+chooses/i,
  /tests this section[’']s principle/i,
  /Open with a distinct/i,
  /Develop the central insight/i,
  /Add an example or case study/i,
  /Offer practical implementation/i,
  /Close with a chapter summary/i,
  /Practice\s+[6-9]\b/i,
  /Practice\s+\d{2,}\b/i,
  /Cover direction/i,
];

export const SCAFFOLD_MANUSCRIPT_PATTERNS: RegExp[] = [
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
  /generation_context/i,
  /manuscript_requirements/i,
];
export const FORBIDDEN_MANUSCRIPT_PATTERNS = [...FATAL_MANUSCRIPT_PATTERNS, ...SCAFFOLD_MANUSCRIPT_PATTERNS];

export function normalizeForComparison(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function isHeading(block: string): boolean {
  return HEADING.test(block.trim());
}

export function normalizeParagraphCasing(content: string): string {
  return content.replace(/\r\n/g, "\n").split(/\n{2,}/).map((block) => {
    const trimmed = block.trim().replace(/^[-*]\s*$/, "");
    if (!trimmed) return "";
    if (trimmed.startsWith("#")) return trimmed.replace(/^(#+)([^\s#])/, "$1 $2");
    return trimmed.replace(/^(\s*["'“‘(]*)([a-z])/, (_, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);
  }).filter(Boolean).join("\n\n");
}

function proseBlocks(content: string): string[] {
  return normalizeParagraphCasing(content).split(/\n{2,}/).filter((block) => block && !isHeading(block));
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
  return SCAFFOLD_MANUSCRIPT_PATTERNS.some((pattern) => pattern.test(content));
}

export function containsFatalFiller(content: string): boolean {
  return FATAL_MANUSCRIPT_PATTERNS.some((pattern) => pattern.test(content));
}

function sentenceTemplate(sentence: string): string {
  return normalizeForComparison(sentence)
    .replace(/\b\d+\b/g, "#")
    .split(" ")
    .map((word) => word.length > 8 ? word.slice(0, 6) : word)
    .join(" ");
}

function hasRepeatedSentenceTemplate(content: string): boolean {
  const counts = new Map<string, number>();
  const sentences = content.split(/(?<=[.!?])\s+/).map(sentenceTemplate).filter((value) => value.split(" ").length >= 8);
  for (const sentence of sentences) {
    const count = (counts.get(sentence) || 0) + 1;
    if (count >= 3) return true;
    counts.set(sentence, count);
  }
  return false;
}

function duplicateParagraphKeys(chapters: Chapter[]): Set<string> {
  const counts = new Map<string, number>();
  for (const chapter of chapters) {
    for (const block of proseBlocks(chapter.content)) {
      const key = normalizeForComparison(block);
      if (key.split(" ").length < MIN_DUPLICATE_WORDS) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return new Set([...counts].filter(([, count]) => count > 1).map(([key]) => key));
}

export function cleanManuscriptContent(content: string, duplicateKeys: Set<string> = new Set()): string {
  const seen = new Set<string>();
  return normalizeParagraphCasing(content).split(/\n{2,}/).filter((block) => {
    if (FORBIDDEN_MANUSCRIPT_PATTERNS.some((pattern) => pattern.test(block))) return false;
    if (isHeading(block)) return true;
    const key = normalizeForComparison(block);
    if (!key || seen.has(key) || duplicateKeys.has(key)) return false;
    seen.add(key);
    return true;
  }).join("\n\n");
}

export interface BookQualityAnalysis {
  chapters: Chapter[];
  score: number;
  duplicateOpenings: number[][];
  rawWordCount: number;
  cleanWordCount: number;
  duplicateParagraphRate: number;
  promptLeakageDetected: boolean;
  scaffoldLeakageDetected: boolean;
  fatalFillerDetected: boolean;
}

export function qualityStatusFor(flags: string[]): QualityStatus {
  if (flags.includes("prompt_leakage") || flags.includes("scaffold_leakage")) return "prompt_leak_detected";
  if (flags.some((flag) => flag.startsWith("duplicate_") || flag === "repeated_phrase" || flag === "repeated_sentence_template" || flag === "numbered_placeholder_sequence" || flag === "padding_filler")) return "failed_quality_review";
  if (flags.includes("underdeveloped")) return "underdeveloped";
  return flags.length ? "needs_review" : "ready";
}

export function analyzeChapterQuality(chapter: Chapter, allChapters: Chapter[] = []): { content: string; cleanContent: string; cleanWordCount: number; flags: string[]; score: number; status: QualityStatus } {
  const content = normalizeParagraphCasing(chapter.content);
  const comparisonChapters = allChapters.length ? allChapters : [{ ...chapter, content }];
  const duplicateKeys = duplicateParagraphKeys(comparisonChapters.map((item) => item.id === chapter.id ? { ...item, content } : item));
  const ownProse = proseBlocks(content);
  const flags: string[] = [];
  if (!content.trim()) flags.push("empty_section");
  if (containsPromptLeakage(content)) flags.push("prompt_leakage", "scaffold_leakage");
  if (containsFatalFiller(content)) flags.push("padding_filler");
  if (/\b(?:Application|Evidence|Decision|Pattern|Trial|Reflection|Practice)\s+\d+\b/i.test(content)) flags.push("numbered_placeholder_sequence");
  if (duplicateKeys.size || new Set(ownProse.map(normalizeForComparison)).size !== ownProse.length) flags.push("duplicate_paragraph");
  if (hasRepeatedSentenceTemplate(content)) flags.push("repeated_sentence_template");
  const cleanContent = cleanManuscriptContent(content, duplicateKeys);
  const cleanWordCount = countWords(cleanContent);
  if (cleanWordCount < chapter.targetWordCount * CHAPTER_GENERATION_THRESHOLD) flags.push("underdeveloped");
  if (/^#{1,6}[^\s#]/m.test(chapter.content)) flags.push("broken_markdown");
  const blocks = content.split(/\n{2,}/).filter(Boolean);
  if (blocks.some((block, index) => isHeading(block) && (!blocks[index + 1] || isHeading(blocks[index + 1])))) flags.push("orphan_heading");
  const duplicateGroup = findDuplicateOpenings(comparisonChapters).find((group) => group.includes(chapter.chapterNumber));
  if (duplicateGroup) flags.push("duplicate_opening");
  const uniqueFlags = [...new Set(flags)];
  const score = Math.max(0, 100 - uniqueFlags.reduce((total, flag) => total + (["padding_filler", "prompt_leakage", "scaffold_leakage"].includes(flag) ? 30 : flag.startsWith("duplicate_") || flag.startsWith("repeated_") ? 20 : 12), 0));
  return { content, cleanContent, cleanWordCount, flags: uniqueFlags, score, status: qualityStatusFor(uniqueFlags) };
}

export function analyzeBookQuality(book: Book): BookQualityAnalysis {
  const normalized = book.chapters.map((chapter) => ({ ...chapter, content: normalizeParagraphCasing(chapter.content) }));
  const duplicateKeys = duplicateParagraphKeys(normalized);
  const chapters = normalized.map((chapter) => {
    const analysis = analyzeChapterQuality(chapter, normalized);
    return { ...chapter, content: analysis.content, cleanWordCount: analysis.cleanWordCount, qualityFlags: analysis.flags, qualityScore: analysis.score, qualityStatus: analysis.status, leakageDetected: analysis.flags.some((flag) => flag.includes("leakage")), duplicateDetected: analysis.flags.some((flag) => flag.startsWith("duplicate_") || flag.startsWith("repeated_")), status: analysis.status === "failed_quality_review" || analysis.status === "prompt_leak_detected" ? "failed_quality_review" as const : chapter.status };
  });
  const rawWordCount = normalized.reduce((sum, chapter) => sum + countWords(chapter.content), 0);
  const cleanWordCount = normalized.reduce((sum, chapter) => sum + countWords(cleanManuscriptContent(chapter.content, duplicateKeys)), 0);
  const proseCount = normalized.reduce((sum, chapter) => sum + proseBlocks(chapter.content).length, 0);
  const duplicateParagraphCount = normalized.reduce((sum, chapter) => sum + proseBlocks(chapter.content).filter((block) => duplicateKeys.has(normalizeForComparison(block))).length, 0);
  const duplicateParagraphRate = proseCount ? duplicateParagraphCount / proseCount : 0;
  const score = chapters.length ? Math.round(chapters.reduce((sum, chapter) => sum + (chapter.qualityScore || 0), 0) / chapters.length) : 0;
  return {
    chapters,
    score,
    duplicateOpenings: findDuplicateOpenings(chapters),
    rawWordCount,
    cleanWordCount,
    duplicateParagraphRate,
    promptLeakageDetected: normalized.some((chapter) => containsPromptLeakage(chapter.content)),
    scaffoldLeakageDetected: normalized.some((chapter) => SCAFFOLD_MANUSCRIPT_PATTERNS.some((pattern) => pattern.test(chapter.content))),
    fatalFillerDetected: normalized.some((chapter) => containsFatalFiller(chapter.content)),
  };
}
