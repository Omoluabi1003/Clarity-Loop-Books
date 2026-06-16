import { NextResponse } from "next/server";
import { buildLeaderboardScores, MARKET_INTELLIGENCE_DISCLAIMER } from "@/lib/market-intelligence";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entity = buildLeaderboardScores(undefined, { includeLowConfidence: true }).find((score) => score.entityId === id || score.entityName.toLowerCase().replaceAll(" ", "-") === id);
  if (!entity) return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  return NextResponse.json({ disclaimer: MARKET_INTELLIGENCE_DISCLAIMER, entity });
}
