import type { Book, MarketIntelligencePlan } from "./types";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const freshness = ["daily", "weekly", "monthly", "quarterly", "yearly"] as const;

export const MARKET_INTELLIGENCE_DISCLAIMER = "Market intelligence uses verified uploads when available and clearly labels public-signal estimates; it must not be represented as exact sales unless backed by seller, distributor, publisher, or licensed data.";

export function generateMarketIntelligencePlan(book: Book): MarketIntelligencePlan {
  const completeness = [book.title, book.authorName, book.publisherCredit, book.genre, book.targetAudience].filter(Boolean).length;
  const manuscriptSignal = book.actualWords > 0 ? 12 : 4;
  const confidence = clamp(42 + completeness * 7 + manuscriptSignal + (book.exportHistory?.length ? 8 : 0));
  const marketScore = clamp((book.marketabilityScore ?? 66) * 0.34 + (book.launchReadinessScore ?? 61) * 0.26 + confidence * 0.24 + Math.min(book.chapters.length * 2, 16));
  const categoryMomentum = clamp(48 + (book.genre.length % 19) + Math.min(book.chapters.length * 3, 21));
  const reviewVelocity = clamp(36 + Math.min(book.actualWords / 900, 24) + (book.qualityScore ?? 0) * 0.18);
  const campaignLift = clamp(35 + (book.authorSuccessAssets?.length ?? 0) * 6 + (book.exportHistory?.length ?? 0) * 7);
  const publisherLift = clamp(38 + (book.publisherCredit ? 24 : 7) + categoryMomentum * 0.28);
  const marketerLift = clamp(34 + campaignLift * 0.45 + reviewVelocity * 0.2);
  const confidenceLevel = confidence >= 82 ? "high_confidence" : confidence >= 62 ? "estimated" : "low_confidence";
  const publisher = book.publisherCredit || "Publisher not assigned";

  return {
    marketScore,
    confidenceLevel,
    salesConfidenceScore: confidence,
    formulaSummary: "MarketScore blends verified sales uploads, rank movement, review velocity, category momentum, campaign lift, and source confidence.",
    disclaimer: MARKET_INTELLIGENCE_DISCLAIMER,
    timeWindows: freshness.map((window, index) => ({ window, rankVelocity: clamp(marketScore - index * 4 + 5), reviewVelocity: clamp(reviewVelocity - index * 3), categoryMomentum: clamp(categoryMomentum - index * 2), campaignLift: clamp(campaignLift + index * 2), confidenceScore: clamp(confidence - index * 3) })),
    metrics: { rankVelocity: clamp(marketScore + 3), reviewVelocity, categoryMomentum, priceElasticitySignal: clamp(46 + (book.targetPageCount % 21)), campaignLift, publisherLiftScore: publisherLift, marketerLiftScore: marketerLift, salesConfidenceScore: confidence, engagementRecommendationScore: clamp((publisherLift + marketerLift + confidence) / 3) },
    sourceArchitecture: [
      { name: "Google Books API", sourceType: "official_api", permission: "permitted", auditRequirement: "Store endpoint URL, request timestamp, ISBN/title query, and response attribution." },
      { name: "Open Library", sourceType: "official_api", permission: "permitted", auditRequirement: "Store work/edition URLs, timestamp, and license/attribution notes." },
      { name: "Author sales CSV uploads", sourceType: "user_upload", permission: "verified", auditRequirement: "Store uploader, filename hash, import timestamp, mapped columns, and user consent." },
      { name: "Retail/public bestseller pages", sourceType: "public_page", permission: "terms_review_required", auditRequirement: "Check robots.txt, source terms, crawl logs, rate limits, and captured URL timestamps before monitoring." }
    ],
    dashboardModules: ["Market Intelligence Dashboard", "Book Rank Timeline", "Publisher Comparison Table", "Marketing Partner Leaderboard", "Genre Heatmap", "Campaign Lift Report", "Verified vs Estimated Sales Toggle", "Author Decision Brief"],
    publisherScorecard: { name: publisher, score: publisherLift, evidence: ["Category momentum from permitted rank snapshots", "Visibility consistency across selected time windows", "Title metadata completeness and genre fit"], confidence: confidenceLevel },
    marketingPartnerScorecard: { name: "Campaign partner pending upload", score: marketerLift, evidence: ["Campaign lift requires campaign dates and ad/report CSVs", "Review velocity and rank movement are treated as signals, not exact sales", "Uploaded KDP, IngramSpark, Shopify, Stripe, and ads reports raise confidence"], confidence: confidenceLevel },
    recommendations: [
      "Start with metadata APIs and manual verified sales uploads before public monitoring.",
      "Label every card as Verified, High confidence, Estimated, or Low confidence.",
      "Do not recommend a publisher or marketer without showing source URLs, timestamps, and confidence badges.",
      `For ${book.title}, prioritize ${book.genre} category history and campaign-date attribution before spend decisions.`
    ]
  };
}
