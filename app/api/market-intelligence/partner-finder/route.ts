import { NextResponse } from "next/server";
import { buildAuthorPartnerFinder, MARKET_INTELLIGENCE_DISCLAIMER } from "@/lib/market-intelligence";
import type { LeaderboardFilters } from "@/lib/types";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const filters: Partial<LeaderboardFilters> = {
    window: (params.get("window") as LeaderboardFilters["window"]) || "monthly",
    genre: params.get("genre") || undefined,
    category: params.get("category") || undefined,
    language: params.get("language") || undefined,
    country: params.get("country") || undefined,
    verifiedOnly: params.get("verifiedOnly") === "true",
    includeLowConfidence: params.get("includeLowConfidence") !== "false",
  };

  return NextResponse.json({
    disclaimer: MARKET_INTELLIGENCE_DISCLAIMER,
    filters,
    partnerFinder: buildAuthorPartnerFinder(filters),
  });
}
