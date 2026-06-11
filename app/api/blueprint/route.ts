import { NextResponse } from "next/server";
import { buildBlueprint, buildBlueprintPrompt, validateBlueprintGenreAlignment } from "@/lib/ai";
import { buildBookDna } from "@/lib/book-dna";
import { generateBookIdentityReport } from "@/lib/creative-intent-diagnostic";
import { calculateBookBudget } from "@/lib/book-budget";
import type { BookForm } from "@/lib/types";

export async function POST(request: Request) {
  const form = (await request.json()) as BookForm;
  if (!form.title?.trim() || !form.authorName?.trim() || !form.idea?.trim() || !form.targetAudience?.trim()) {
    return NextResponse.json({ error: "Please add a title, author name, book idea, and audience first." }, { status: 400 });
  }
  const budget = calculateBookBudget(form);
  const bookDna = buildBookDna(form, form.confirmedCreativeIntent);
  const chapters = buildBlueprint(form, bookDna);
  const alignment = validateBlueprintGenreAlignment(chapters, bookDna);
  const creativeIntentReport = generateBookIdentityReport(form, bookDna);
  return NextResponse.json({ chapters, budget, bookDna, creativeIntentReport, genreAlignmentScore: alignment.score, genreWarnings: alignment.warnings, generationPrompt: buildBlueprintPrompt(form, bookDna), source: process.env.OPENAI_API_KEY ? "ai-ready-fallback" : "studio-sample" });
}
