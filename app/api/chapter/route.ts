import { NextResponse } from "next/server";
import { buildChapterPrompt, writeSampleChapter } from "@/lib/ai";
import { countWords, CHAPTER_GENERATION_THRESHOLD } from "@/lib/book-budget";
import type { Book, Chapter } from "@/lib/types";

interface ChapterRequest { book: Book; chapter: Chapter; action?: "write" | "rewrite" | "expand" | "shorten" }

export async function POST(request: Request) {
  const body = (await request.json()) as ChapterRequest;
  if (!body.chapter || !body.book?.title) return NextResponse.json({ error: "Book and chapter details are required." }, { status: 400 });
  const existing = body.action === "expand" ? body.chapter.content : "";
  let content = writeSampleChapter(body.book, body.chapter, existing);
  if (body.action === "shorten") content = content.split("\n\n").slice(0, Math.max(4, Math.floor(content.split("\n\n").length * 0.65))).join("\n\n");
  if (body.action === "rewrite") content = content.replace("A useful idea", "A lasting change").replace("Put the principle to work", "Try the principle in practice");
  let actualWordCount = countWords(content);
  if (body.action !== "shorten" && actualWordCount < body.chapter.targetWordCount * CHAPTER_GENERATION_THRESHOLD) {
    content = writeSampleChapter(body.book, body.chapter, content);
    actualWordCount = countWords(content);
  }
  const completionRatio = body.chapter.targetWordCount ? actualWordCount / body.chapter.targetWordCount : 0;
  return NextResponse.json({
    content,
    actualWordCount,
    estimatedPages: Math.ceil(actualWordCount / body.book.wordsPerPage),
    status: completionRatio < CHAPTER_GENERATION_THRESHOLD ? "underdeveloped" : body.action === "expand" ? "expanded" : "drafted",
    generationPrompt: buildChapterPrompt(body.book, body.chapter),
    source: process.env.OPENAI_API_KEY ? "ai-ready-fallback" : "studio-sample",
  });
}
