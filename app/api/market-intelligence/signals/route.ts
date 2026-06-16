import { NextResponse } from "next/server";
import { MARKET_INTELLIGENCE_DISCLAIMER, sampleSalesRows } from "@/lib/market-intelligence";

export async function GET() {
  return NextResponse.json({ disclaimer: MARKET_INTELLIGENCE_DISCLAIMER, compliance: ["Do not scrape private dashboards.", "Do not bypass paywalls, CAPTCHAs, login walls, rate limits, or robots.txt.", "Use public APIs or user-provided reports first.", "Clearly separate verified data from estimated public signals."], signals: sampleSalesRows.filter((row) => row.sourceType === "public_signal") });
}
