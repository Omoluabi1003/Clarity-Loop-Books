import { NextResponse } from "next/server";
import { buildLeaderboardScores, MARKET_INTELLIGENCE_DISCLAIMER, MARKET_INTELLIGENCE_TABLES, VERIFICATION_BADGES } from "@/lib/market-intelligence";
import type { LeaderboardFilters } from "@/lib/types";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const filters: Partial<LeaderboardFilters> = { window: (params.get("window") as LeaderboardFilters["window"]) || "monthly", genre: params.get("genre") || undefined, category: params.get("category") || undefined, language: params.get("language") || undefined, country: params.get("country") || undefined, entityType: (params.get("entityType") as LeaderboardFilters["entityType"]) || undefined, includeLowConfidence: params.get("includeLowConfidence") === "true", verifiedOnly: params.get("verifiedOnly") === "true" };
  return NextResponse.json({ disclaimer: MARKET_INTELLIGENCE_DISCLAIMER, filters, badges: VERIFICATION_BADGES, schemaTables: MARKET_INTELLIGENCE_TABLES, leaderboard: buildLeaderboardScores(undefined, filters) });
}
