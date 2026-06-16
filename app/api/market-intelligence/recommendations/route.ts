import { NextResponse } from "next/server";
import { buildMarketRecommendations, MARKET_INTELLIGENCE_DISCLAIMER } from "@/lib/market-intelligence";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  return NextResponse.json({ disclaimer: MARKET_INTELLIGENCE_DISCLAIMER, recommendations: buildMarketRecommendations({ genre: params.get("genre") || undefined, country: params.get("country") || undefined }) });
}
