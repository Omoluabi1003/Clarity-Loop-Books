import { NextResponse } from "next/server";
import { buildLeaderboardScores, sampleSalesRows } from "@/lib/market-intelligence";
import type { LeaderboardFilters, SalesReportRow } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { rows?: SalesReportRow[]; filters?: Partial<LeaderboardFilters> };
  return NextResponse.json({ scores: buildLeaderboardScores(body.rows?.length ? body.rows : sampleSalesRows, body.filters ?? {}) });
}
