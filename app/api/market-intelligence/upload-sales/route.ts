import { NextResponse } from "next/server";
import { processSalesUpload } from "@/lib/market-intelligence";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Upload a csv or xlsx file in the file field." }, { status: 400 });
    return NextResponse.json(await processSalesUpload(file));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sales upload failed." }, { status: 400 });
  }
}
