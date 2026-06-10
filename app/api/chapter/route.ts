import { NextResponse } from "next/server";
import { buildChapterGenerationContext, writeSampleChapter } from "@/lib/ai";
import { countWords, CHAPTER_GENERATION_THRESHOLD } from "@/lib/book-budget";
import { analyzeChapterQuality, containsPromptLeakage, normalizeParagraphCasing } from "@/lib/quality";
import type { Book, Chapter } from "@/lib/types";

interface ChapterRequest { book: Book; chapter: Chapter; action?: "write" | "rewrite" | "expand" | "shorten" }

function removeFailedBlocks(content: string, chapter: Chapter, book: Book): string {
  const seen = new Set<string>();
  const otherParagraphs = new Set(book.chapters.filter((item) => item.id !== chapter.id).flatMap((item) => item.content.split(/\n{2,}/)).map((block) => block.toLowerCase().replace(/\s+/g, " ").trim()));
  return normalizeParagraphCasing(content).split(/\n{2,}/).filter((block) => {
    const normalized = block.toLowerCase().replace(/\s+/g, " ").trim();
    if (!normalized) return false;
    if (containsPromptLeakage(block) || otherParagraphs.has(normalized) || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  }).join("\n\n");
}

export async function POST(request: Request) {
  const body = (await request.json()) as ChapterRequest;
  if (!body.chapter || !body.book?.title) return NextResponse.json({ error: "Book and chapter details are required." }, { status: 400 });
  const generationContext = buildChapterGenerationContext(body.book, body.chapter);
  const existing = body.action === "expand" ? body.chapter.content : "";
  let content = writeSampleChapter(body.book, body.chapter, existing);
  if (body.action === "shorten") content = content.split("\n\n").slice(0, Math.max(4, Math.floor(content.split("\n\n").length * 0.65))).join("\n\n");
  if (body.action === "rewrite") content = writeSampleChapter(body.book, { ...body.chapter, content: "" });

  let quality = analyzeChapterQuality({ ...body.chapter, content }, body.book.chapters.map((chapter) => chapter.id === body.chapter.id ? { ...chapter, content } : chapter));
  for (let attempt = 0; attempt < 2 && quality.flags.some((flag) => flag === "prompt_leakage" || flag.startsWith("duplicate_") || flag === "repeated_phrase"); attempt += 1) {
    content = removeFailedBlocks(quality.content, body.chapter, body.book);
    if (quality.flags.includes("duplicate_opening")) {
      const blocks = content.split(/\n{2,}/);
      const firstProse = blocks.findIndex((block) => !block.startsWith("#"));
      if (firstProse >= 0) blocks[firstProse] = `A chapter-specific turning point changes how this problem can be seen: ${blocks[firstProse]}`;
      content = blocks.join("\n\n");
    }
    quality = analyzeChapterQuality({ ...body.chapter, content }, body.book.chapters.map((chapter) => chapter.id === body.chapter.id ? { ...chapter, content } : chapter));
  }

  const actualWordCount = countWords(quality.content);
  const completionRatio = body.chapter.targetWordCount ? actualWordCount / body.chapter.targetWordCount : 0;
  const blockingQualityIssue = quality.flags.some((flag) => flag === "prompt_leakage" || flag.startsWith("duplicate_") || flag === "repeated_phrase");
  return NextResponse.json({
    manuscriptContent: quality.content,
    content: quality.content,
    generationContext,
    actualWordCount,
    estimatedPages: Math.ceil(actualWordCount / body.book.wordsPerPage),
    qualityFlags: quality.flags,
    qualityScore: quality.score,
    qualityStatus: quality.status,
    leakageDetected: quality.flags.includes("prompt_leakage"),
    duplicateDetected: quality.flags.some((flag) => flag.startsWith("duplicate_") || flag === "repeated_phrase"),
    status: completionRatio < CHAPTER_GENERATION_THRESHOLD ? "underdeveloped" : blockingQualityIssue || quality.score < 75 ? "needs_review" : body.action === "expand" ? "expanded" : "drafted",
    source: process.env.OPENAI_API_KEY ? "ai-ready-fallback" : "studio-sample",
  });
}
