import { NextResponse } from "next/server";
import { generateClarityLaunchPlan } from "@/lib/clarity-launch-engine";
import type { Book } from "@/lib/types";

export async function POST(request: Request) {
  const book = (await request.json()) as Book;

  if (!book?.title?.trim() || !book?.idea?.trim()) {
    return NextResponse.json({ error: "Book title and idea are required." }, { status: 400 });
  }

  return NextResponse.json({ result: generateClarityLaunchPlan(book) });
}
