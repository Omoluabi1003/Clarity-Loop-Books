import { NextResponse } from "next/server";
import { buildBlueprint, buildBlueprintPrompt } from "@/lib/ai";
import { calculateBookBudget } from "@/lib/book-budget";
import type { BookForm } from "@/lib/types";

export async function POST(request: Request) {
  const form = (await request.json()) as BookForm;
  if (!form.title?.trim() || !form.authorName?.trim() || !form.idea?.trim() || !form.targetAudience?.trim()) {
    return NextResponse.json({ error: "Please add a title, author name, book idea, and audience first." }, { status: 400 });
  }
  const budget = calculateBookBudget(form);
  return NextResponse.json({ chapters: buildBlueprint(form), budget, generationPrompt: buildBlueprintPrompt(form), source: process.env.OPENAI_API_KEY ? "ai-ready-fallback" : "studio-sample" });
}
