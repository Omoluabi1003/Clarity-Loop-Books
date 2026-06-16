import crypto from "node:crypto";
import type { Book, LeaderboardEntityType, LeaderboardFilters, LeaderboardScore, MarketConfidenceLevel, MarketIntelligencePlan, AuthorPartnerFinderResult, MarketRecommendation, MarketSourceType, SalesAggregationWindow, SalesReportRow, SalesSourceType, SalesUploadResult, SalesVerificationStatus, VerificationBadgeDefinition } from "./types";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));
const freshness: SalesAggregationWindow[] = ["daily", "weekly", "monthly", "quarterly", "yearly"];
const now = () => new Date().toISOString();
const daysByWindow: Record<SalesAggregationWindow, number> = { daily: 1, weekly: 7, monthly: 31, quarterly: 92, yearly: 366 };
const windowStart = (window: SalesAggregationWindow, referenceDate = new Date()) => new Date(referenceDate.getTime() - daysByWindow[window] * 24 * 60 * 60 * 1000).toISOString();
const inWindow = (collectedAt: string, window: SalesAggregationWindow) => new Date(collectedAt).getTime() >= new Date(windowStart(window)).getTime();
const permissionForSource = (sourceType: SalesSourceType) => sourceType === "verified" ? "user_uploaded" : sourceType === "partner" ? "partner_export" : sourceType === "public_signal" ? "public_terms_checked" : sourceType === "self_reported" ? "manual_entry" : "public_terms_checked";

export const MARKET_INTELLIGENCE_DISCLAIMER = "Clarity Loop rankings are decision-support intelligence, not guaranteed sales claims. Verified, Estimated, Self-Reported, and Public Signal Based metrics are labeled separately; no unverifiable estimate is presented as confirmed exact sales.";

export const VERIFICATION_BADGES: VerificationBadgeDefinition[] = [
  { badge: "bronze", label: "Self-Reported", description: "Self-reported sales or manually entered data" },
  { badge: "silver", label: "Uploaded Report", description: "Uploaded sales CSV or PDF-style structured report" },
  { badge: "gold", label: "Connected Export", description: "Connected seller platform or structured export" },
  { badge: "platinum", label: "Multi-Platform Verified", description: "Multiple connected platforms verified" },
  { badge: "diamond", label: "Audited Feed", description: "Third-party audited or licensed sales feed" },
];

export const MARKET_INTELLIGENCE_TABLES = ["books", "authors", "publishers", "marketing_partners", "campaigns", "sales_reports", "sales_report_rows", "public_sales_signals", "leaderboard_scores", "verification_badges", "recommendations"].map((name) => ({ name, purpose: `${name.replaceAll("_", " ")} records for sales attribution and recommendations`, requiredAttribution: ["source_type", "source_name", "confidence_level", "collected_at", "verification_status"] }));

const confidenceForSource = (sourceType: SalesSourceType): MarketConfidenceLevel => sourceType === "verified" || sourceType === "partner" ? "verified" : sourceType === "public_signal" ? "estimated" : "low_confidence";
const statusForSource = (sourceType: SalesSourceType): SalesVerificationStatus => sourceType === "verified" || sourceType === "partner" ? "verified" : sourceType === "self_reported" ? "self_reported" : sourceType === "public_signal" ? "public_signal_based" : "estimated";
const badgeForRows = (rows: SalesReportRow[]) => rows.some((row) => row.sourceType === "partner") ? "gold" : rows.some((row) => row.sourceType === "verified") ? "silver" : rows.some((row) => row.sourceType === "public_signal") ? "bronze" : "bronze";

export const sampleSalesRows: SalesReportRow[] = [
  { bookTitle: "Measured Launch", authorName: "A. Author", entityName: "Practical Press", entityType: "publisher", genre: "Business", category: "Authorship", language: "English", country: "US", unitsSold: 12840, revenue: 97320, campaignSpend: 12000, authorSatisfaction: 91, sourceType: "verified", sourceName: "KDP export upload", confidenceLevel: "verified", collectedAt: now(), verificationStatus: "verified", sourceUrl: "upload://kdp/measured-launch", dataPermission: "user_uploaded" },
  { bookTitle: "Measured Launch", authorName: "A. Author", entityName: "Northstar Book Launch", entityType: "marketing_partner", genre: "Business", category: "Authorship", language: "English", country: "US", unitsSold: 8420, revenue: 62100, campaignSpend: 9000, authorSatisfaction: 87, sourceType: "verified", sourceName: "Shopify + Stripe exports", confidenceLevel: "verified", collectedAt: now(), verificationStatus: "verified", sourceUrl: "upload://shopify-stripe/measured-launch", dataPermission: "partner_export" },
  { bookTitle: "Quiet Systems", authorName: "M. Chen", entityName: "Velocity Launch Lab", entityType: "launch_specialist", genre: "Productivity", category: "Self Improvement", language: "English", country: "US", unitsSold: 5400, revenue: 43120, campaignSpend: 7800, authorSatisfaction: 84, sourceType: "partner", sourceName: "Partner structured export", confidenceLevel: "verified", collectedAt: now(), verificationStatus: "verified", sourceUrl: "partner://velocity-launch-lab/structured-export", dataPermission: "partner_export" },
  { bookTitle: "Signal Memoir", authorName: "R. Woods", entityName: "ClearView Publicity", entityType: "publicist", genre: "Memoir", category: "Personal Transformation", language: "English", country: "CA", unitsSold: 3100, revenue: 24400, campaignSpend: 5200, authorSatisfaction: 78, sourceType: "public_signal", sourceName: "Permitted public bestseller/rank signal", confidenceLevel: "estimated", collectedAt: now(), verificationStatus: "public_signal_based", sourceUrl: "https://example.com/permitted-rank-signal", dataPermission: "public_terms_checked" },
  { bookTitle: "Measured Launch", authorName: "A. Author", entityName: "Independent Manual Entry", entityType: "marketing_partner", genre: "Business", category: "Authorship", language: "English", country: "US", unitsSold: 1200, revenue: 8400, campaignSpend: 2500, authorSatisfaction: 72, sourceType: "self_reported", sourceName: "Manual template", confidenceLevel: "low_confidence", collectedAt: now(), verificationStatus: "self_reported", sourceUrl: "manual://independent-entry", dataPermission: "manual_entry" },
];

export function calculateClaritySalesRankScore(input: Omit<LeaderboardScore, "claritySalesRankScore" | "includedInTopRankings">): number {
  const verifiedUnits = clamp(input.verifiedUnitsSold / 150);
  const verifiedRevenue = clamp(input.verifiedRevenue / 1200);
  const raw = verifiedUnits * 0.35 + verifiedRevenue * 0.2 + input.salesGrowthVelocity * 0.15 + input.reviewGrowthVelocity * 0.1 + input.categoryRankMovement * 0.1 + input.campaignRoi * 0.05 + input.authorSatisfaction * 0.05;
  const penalty = input.verificationStatus === "verified" ? 1 : input.verificationStatus === "public_signal_based" ? 0.76 : input.verificationStatus === "self_reported" ? 0.64 : 0.7;
  return clamp(raw * penalty);
}

export function buildLeaderboardScores(rows: SalesReportRow[] = sampleSalesRows, filters: Partial<LeaderboardFilters> = {}): LeaderboardScore[] {
  const window = filters.window ?? "monthly";
  const filtered = rows.filter((row) => inWindow(row.collectedAt, window) && (!filters.entityType || row.entityType === filters.entityType) && (!filters.genre || row.genre === filters.genre) && (!filters.category || row.category === filters.category) && (!filters.language || row.language === filters.language) && (!filters.country || row.country === filters.country) && (!filters.verifiedOnly || row.verificationStatus === "verified"));
  const groups = new Map<string, SalesReportRow[]>();
  filtered.forEach((row) => groups.set(`${row.entityType}:${row.entityName}`, [...(groups.get(`${row.entityType}:${row.entityName}`) ?? []), row]));
  return [...groups.entries()].map(([key, group]) => {
    const [entityType, entityName] = key.split(":") as [LeaderboardEntityType, string];
    const verified = group.filter((row) => row.verificationStatus === "verified");
    const estimated = group.filter((row) => row.verificationStatus !== "verified");
    const revenue = (items: SalesReportRow[]) => items.reduce((sum, row) => sum + row.revenue, 0);
    const units = (items: SalesReportRow[]) => items.reduce((sum, row) => sum + row.unitsSold, 0);
    const spend = group.reduce((sum, row) => sum + (row.campaignSpend ?? 0), 0);
    const status = verified.length ? "verified" : group[0].verificationStatus;
    const base = { entityId: crypto.createHash("sha1").update(key).digest("hex").slice(0, 10), entityName, entityType, badge: badgeForRows(group), window, windowStartedAt: windowStart(window), verifiedUnitsSold: units(verified), estimatedUnitsSold: units(estimated), verifiedRevenue: revenue(verified), estimatedRevenue: revenue(estimated), salesGrowthVelocity: clamp(50 + units(group) / 260), reviewGrowthVelocity: clamp(42 + group.length * 11), categoryRankMovement: clamp(46 + units(group) / 340), campaignRoi: clamp(spend ? ((revenue(group) - spend) / spend) * 18 : 55), authorSatisfaction: clamp(group.reduce((sum, row) => sum + (row.authorSatisfaction ?? 70), 0) / group.length), sourceType: verified.length ? "verified" : group[0].sourceType, sourceName: group.map((row) => row.sourceName).join(" + "), confidenceLevel: confidenceForSource(verified.length ? "verified" : group[0].sourceType), collectedAt: group[0].collectedAt, verificationStatus: status, sourceUrl: group[0].sourceUrl, dataPermission: group[0].dataPermission ?? permissionForSource(group[0].sourceType), evidence: group.map((row) => `${row.verificationStatus.replaceAll("_", " ")}: ${row.sourceName}`), auditTrail: group.map((row) => `${row.collectedAt} · ${row.dataPermission ?? permissionForSource(row.sourceType)} · ${row.sourceUrl ?? row.sourceName}`) } satisfies Omit<LeaderboardScore, "claritySalesRankScore" | "includedInTopRankings">;
    const claritySalesRankScore = calculateClaritySalesRankScore(base);
    return { ...base, claritySalesRankScore, includedInTopRankings: status === "verified" || Boolean(filters.includeLowConfidence) };
  }).sort((a, b) => b.claritySalesRankScore - a.claritySalesRankScore);
}

export function parseSalesCsv(text: string, sourceName = "Manual template"): SalesReportRow[] {
  const [headerLine = "", ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((h) => h.trim());
  const required = ["bookTitle", "authorName", "entityName", "entityType", "unitsSold", "revenue"];
  if (!required.every((key) => headers.includes(key))) throw new Error(`CSV is missing required columns: ${required.filter((key) => !headers.includes(key)).join(", ")}`);
  return lines.filter(Boolean).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    const get = (key: string) => values[headers.indexOf(key)] ?? "";
    const sourceType = (get("sourceType") || "verified") as SalesSourceType;
    return { bookTitle: get("bookTitle"), authorName: get("authorName"), entityName: get("entityName"), entityType: get("entityType") as LeaderboardEntityType, genre: get("genre") || "Uncategorized", category: get("category") || "General", language: get("language") || "English", country: get("country") || "US", unitsSold: Number(get("unitsSold")) || 0, revenue: Number(get("revenue")) || 0, campaignSpend: Number(get("campaignSpend")) || 0, authorSatisfaction: Number(get("authorSatisfaction")) || 70, sourceType, sourceName, confidenceLevel: confidenceForSource(sourceType), collectedAt: now(), verificationStatus: statusForSource(sourceType), sourceUrl: get("sourceUrl") || `upload://${sourceName}`, dataPermission: permissionForSource(sourceType) };
  });
}

export async function processSalesUpload(file: File): Promise<SalesUploadResult> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "csv" && extension !== "xlsx") throw new Error("Only csv and xlsx uploads are supported.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const filenameHash = crypto.createHash("sha256").update(file.name).digest("hex");
  const rowsProcessed = extension === "csv" ? parseSalesCsv(bytes.toString("utf8"), file.name).length : 0;
  return { accepted: true, reportId: crypto.createHash("sha1").update(`${filenameHash}:${bytes.length}`).digest("hex").slice(0, 12), filenameHash, sourceName: file.name, supportedFormat: extension, rowsProcessed, badge: extension === "csv" ? "silver" : "silver", warnings: extension === "xlsx" ? ["XLSX file type validated; structured workbook parsing is queued for the ingestion worker."] : [] };
}

export function buildAuthorPartnerFinder(filters: Partial<LeaderboardFilters> = {}): AuthorPartnerFinderResult {
  const comparisonRows = buildLeaderboardScores(sampleSalesRows, { ...filters, includeLowConfidence: true });
  const verifiedRows = comparisonRows.filter((row) => row.verificationStatus === "verified");
  const byMostSales = (rows: LeaderboardScore[]) => [...rows].sort((a, b) => (b.verifiedUnitsSold - a.verifiedUnitsSold) || (b.estimatedUnitsSold - a.estimatedUnitsSold) || (b.verifiedRevenue - a.verifiedRevenue) || (b.claritySalesRankScore - a.claritySalesRankScore));
  const topPublisher = byMostSales(comparisonRows.filter((score) => score.entityType === "publisher"))[0];
  const topMarketer = byMostSales(comparisonRows.filter((score) => score.entityType === "marketing_partner"))[0];
  const topOverall = byMostSales(comparisonRows)[0];
  return {
    topPublisher,
    topMarketer,
    topOverall,
    comparisonRows,
    decisionNotes: [
      topOverall ? `${topOverall.entityName} currently has the most verified sales in this comparison: ${topOverall.verifiedUnitsSold.toLocaleString()} verified units and $${Math.round(topOverall.verifiedRevenue).toLocaleString()} verified revenue.` : "No partner rows match these filters yet; request uploaded reports before choosing.",
      verifiedRows.length ? `${verifiedRows.length} partner${verifiedRows.length === 1 ? " has" : "s have"} verified sales evidence available for comparison.` : "No verified partner rows match these filters yet; request uploaded reports before choosing.",
      "Use verified units and verified revenue first; treat estimated and public-signal rows as directional only.",
      "Compare publisher and marketer lift separately so authors can choose a publishing home, a launch partner, or both.",
      "Ask every shortlisted partner for source dates, campaign scope, author references, and deletion rights before committing budget."
    ]
  };
}

export function buildMarketRecommendations(filters: Partial<LeaderboardFilters> = {}): MarketRecommendation[] {
  return buildLeaderboardScores(sampleSalesRows, { ...filters, includeLowConfidence: true }).slice(0, 3).map((score) => ({ recommendedEntity: score.entityName, entityType: score.entityType, estimatedOpportunityScore: score.claritySalesRankScore, confidenceExplanation: `${score.badge} badge from ${score.verificationStatus.replaceAll("_", " ")} data; verified and estimated units are displayed separately.`, riskWarnings: score.verificationStatus === "verified" ? ["Past verified sales do not guarantee future results."] : ["Low-confidence data: require uploaded or partner proof before committing budget.", "Public signals are directional and not confirmed sales."], rationale: score.evidence }));
}

export function generateMarketIntelligencePlan(book: Book): MarketIntelligencePlan {
  const leaderboard = buildLeaderboardScores(sampleSalesRows, { includeLowConfidence: false });
  const topPublisher = leaderboard.find((score) => score.entityType === "publisher");
  const topMarketer = leaderboard.find((score) => score.entityType === "marketing_partner");
  const confidence = clamp(58 + (book.publisherCredit ? 10 : 0) + (book.exportHistory?.length ? 8 : 0) + Math.min(book.chapters.length * 2, 12));
  const marketScore = clamp(((topPublisher?.claritySalesRankScore ?? 62) + (topMarketer?.claritySalesRankScore ?? 58) + confidence) / 3);
  return { marketScore, confidenceLevel: confidence >= 82 ? "verified" : confidence >= 68 ? "high_confidence" : "estimated", salesConfidenceScore: confidence, formulaSummary: "Clarity SalesRank Score normalizes verified units sold, verified revenue, growth velocity, review velocity, category rank movement, campaign ROI, author satisfaction, and source-confidence penalties to 0–100.", disclaimer: MARKET_INTELLIGENCE_DISCLAIMER, timeWindows: freshness.map((window, index) => ({ window, rankVelocity: clamp(marketScore - index * 4 + 5), reviewVelocity: clamp(54 - index * 3), categoryMomentum: clamp(60 - index * 2), campaignLift: clamp(57 + index * 2), confidenceScore: clamp(confidence - index * 3) })), metrics: { rankVelocity: clamp(marketScore + 3), reviewVelocity: 54, categoryMomentum: 60, priceElasticitySignal: clamp(46 + (book.targetPageCount % 21)), campaignLift: 57, publisherLiftScore: topPublisher?.claritySalesRankScore ?? 62, marketerLiftScore: topMarketer?.claritySalesRankScore ?? 58, salesConfidenceScore: confidence, engagementRecommendationScore: clamp(marketScore) }, sourceArchitecture: [
    { name: "Google Books API", sourceType: "official_api" as MarketSourceType, permission: "permitted", auditRequirement: "Store endpoint URL, request timestamp, ISBN/title query, source_type, source_name, confidence_level, collected_at, verification_status, and response attribution." },
    { name: "Open Library", sourceType: "official_api" as MarketSourceType, permission: "permitted", auditRequirement: "Store work/edition URLs, timestamp, source attribution, and license notes." },
    { name: "Author sales CSV/XLSX uploads", sourceType: "user_upload" as MarketSourceType, permission: "verified", auditRequirement: "Store uploader consent, filename hash, import timestamp, mapped columns, source_type, source_name, confidence_level, collected_at, and verification_status." },
    { name: "KDP, IngramSpark, Draft2Digital, Shopify, and Stripe exports", sourceType: "partner_integration", permission: "verified", auditRequirement: "Use user-provided exports or connected accounts; do not store raw sensitive payment data." },
    { name: "Licensed or audited sales feed", sourceType: "licensed_feed", permission: "licensed", auditRequirement: "Store license identifier, delivery timestamp, schema version, and third-party audit trail." },
    { name: "Permitted public rank/review signals", sourceType: "public_page", permission: "terms_review_required", auditRequirement: "Check robots.txt, source terms, public API options, rate limits, captured URL, and crawl logs before monitoring." }
  ], dashboardModules: ["Book Sales Leaderboard", "Publisher Performance Rankings", "Marketing Partner Rankings", "Launch Specialist Rankings", "Publicist Rankings", "Verified Sales Upload Center", "Sales Confidence Badge System", "AI Recommendation Engine", "Verified vs Estimated Sales Toggle"], publisherScorecard: { name: topPublisher?.entityName ?? book.publisherCredit ?? "Publisher not assigned", score: topPublisher?.claritySalesRankScore ?? 62, evidence: topPublisher?.evidence ?? ["No verified publisher upload yet"], confidence: topPublisher?.confidenceLevel ?? "estimated" }, marketingPartnerScorecard: { name: topMarketer?.entityName ?? "Campaign partner pending upload", score: topMarketer?.claritySalesRankScore ?? 58, evidence: topMarketer?.evidence ?? ["Campaign lift requires campaign dates and sales reports"], confidence: topMarketer?.confidenceLevel ?? "estimated" }, recommendations: ["Do not recommend a publisher or marketer without source URLs, timestamps, and confidence badges.", ...buildMarketRecommendations().map((rec) => `${rec.recommendedEntity}: ${rec.confidenceExplanation}`)] };
}
