import { NextResponse } from "next/server";
import { getPublishingReadiness } from "@/lib/book-budget";
import { MIME, renderDocx, renderPdf, safeFilename } from "@/lib/export-renderers";
import type { Book } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { book, format, allowIncomplete = false } = await request.json() as { book: Book; format: "pdf" | "docx"; allowIncomplete?: boolean };
    if (!book?.id || !["pdf", "docx"].includes(format)) return NextResponse.json({ error: "A valid book and export format are required." }, { status: 400 });
    const readiness = getPublishingReadiness(book);
    if (readiness.exportReadinessStatus === "blocked" && !allowIncomplete) return NextResponse.json({ error: "Export blocked until manuscript readiness issues are resolved.", readiness }, { status: 409 });
    const file = format === "pdf" ? await renderPdf(book) : await renderDocx(book);
    return new NextResponse(new Uint8Array(file), { headers: { "Content-Type": MIME[format], "Content-Disposition": `attachment; filename="${safeFilename(book.title, format)}"`, "Content-Length": String(file.length), "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Export failed", error);
    return NextResponse.json({ error: "The export could not be generated. Your project is safe; please retry." }, { status: 500 });
  }
}
