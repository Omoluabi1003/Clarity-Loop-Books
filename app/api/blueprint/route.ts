import { NextResponse } from "next/server";
import { buildBlueprint } from "@/lib/ai";
import type { BookForm } from "@/lib/types";

export async function POST(request: Request) {
  const form = (await request.json()) as BookForm;
  if (!form.title?.trim() || !form.idea?.trim() || !form.targetAudience?.trim()) {
    return NextResponse.json({ error: "Please add a title, book idea, and audience first." }, { status: 400 });
  }
  return NextResponse.json({ chapters: buildBlueprint(form), source: process.env.OPENAI_API_KEY ? "ai-ready-fallback" : "studio-sample" });
}
