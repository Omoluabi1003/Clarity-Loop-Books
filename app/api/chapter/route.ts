import { NextResponse } from "next/server";
import { buildChapterPrompt, writeSampleChapter } from "@/lib/ai";
import { countWords, CHAPTER_GENERATION_THRESHOLD } from "@/lib/book-budget";
import { analyzeChapterQuality } from "@/lib/quality";
import type { Book, Chapter } from "@/lib/types";

interface ChapterRequest { book: Book; chapter: Chapter; action?: "write" | "rewrite" | "expand" | "shorten" }

export async function POST(request: Request) {
  const body = (await request.json()) as ChapterRequest;
  if (!body.chapter || !body.book?.title) return NextResponse.json({ error: "Book and chapter details are required." }, { status: 400 });
  const existing = body.action === "expand" ? body.chapter.content : "";
  let content = writeSampleChapter(body.book, body.chapter, existing);
  if (body.action === "shorten") content = content.split("\n\n").slice(0, Math.max(4, Math.floor(content.split("\n\n").length * 0.65))).join("\n\n");
  if (body.action === "rewrite") content = writeSampleChapter(body.book, { ...body.chapter, content: "" });
  let actualWordCount = countWords(content);
  if (body.action !== "shorten" && actualWordCount < body.chapter.targetWordCount * CHAPTER_GENERATION_THRESHOLD) {
    content = writeSampleChapter(body.book, body.chapter, content);
    actualWordCount = countWords(content);
  }
  const quality = analyzeChapterQuality({ ...body.chapter, content }, body.book.chapters.map((chapter) => chapter.id === body.chapter.id ? { ...chapter, content } : chapter));
  actualWordCount = countWords(quality.content);
  const completionRatio = body.chapter.targetWordCount ? actualWordCount / body.chapter.targetWordCount : 0;
  return NextResponse.json({
    content: quality.content,
    actualWordCount,
    estimatedPages: Math.ceil(actualWordCount / body.book.wordsPerPage),
    qualityFlags: quality.flags,
    qualityScore: quality.score,
    status: completionRatio < CHAPTER_GENERATION_THRESHOLD ? "underdeveloped" : body.action === "expand" ? "expanded" : "drafted",
    generationPrompt: buildChapterPrompt(body.book, body.chapter),
    source: process.env.OPENAI_API_KEY ? "ai-ready-fallback" : "studio-sample",
  });
}
