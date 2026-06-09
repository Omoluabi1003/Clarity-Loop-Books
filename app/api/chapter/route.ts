import { NextResponse } from "next/server";
import { writeSampleChapter } from "@/lib/ai";
import type { Chapter } from "@/lib/types";

interface ChapterRequest {
  bookTitle: string;
  tone: string;
  audience: string;
  chapter: Chapter;
  action?: "write" | "rewrite" | "expand" | "shorten";
}

export async function POST(request: Request) {
  const body = (await request.json()) as ChapterRequest;
  if (!body.chapter || !body.bookTitle) {
    return NextResponse.json({ error: "Book and chapter details are required." }, { status: 400 });
  }

  let content = writeSampleChapter(body.bookTitle, body.chapter, body.tone, body.audience);
  if (body.action === "expand") content += "\n\n### Try this in real life\n\nChoose one situation this week where you can practice the idea. Write down what you notice before, during, and after you act.";
  if (body.action === "shorten") content = content.split("\n\n").slice(0, 4).join("\n\n");
  if (body.action === "rewrite") content = content.replace("Every meaningful change", "A clearer life").replace("Start here:", "Here is a gentler place to begin:");

  return NextResponse.json({ content, source: process.env.OPENAI_API_KEY ? "ai-ready-fallback" : "studio-sample" });
}
