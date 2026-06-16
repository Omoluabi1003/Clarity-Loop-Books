import assert from "node:assert/strict";
import test from "node:test";
import { buildAuthorPartnerFinder, buildLeaderboardScores, generateMarketIntelligencePlan, parseSalesCsv, VERIFICATION_BADGES } from "../lib/market-intelligence";
import type { Book } from "../lib/types";

const book: Book = { id: "market-test", projectType: "nonfiction", title: "Measured Launch", subtitle: "", authorName: "A. Author", authorBio: "", publisherCredit: "Practical Press", idea: "book launch measurement", genre: "Business", targetAudience: "independent authors", tone: "Practical", writingStyle: "Clear", chapterCount: 2, targetPageCount: 100, wordsPerPage: 275, targetWords: 27500, averageWordsPerChapter: 13750, actualWords: 4000, actualEstimatedPages: 15, chapterSizePreference: "medium", aiAssistanceLevel: "guided", bookDna: { promise: "measure traction", tone: "Practical", audience: "authors", readingLevel: "General", voice: "Advisor", themes: ["publishing"], styleRules: [] }, coverPrompt: "", qualityScore: 80, status: "drafting", progress: 50, updatedAt: new Date(0).toISOString(), color: "gold", chapters: [1, 2].map((chapterNumber) => ({ id: `c${chapterNumber}`, chapterNumber, title: `Chapter ${chapterNumber}`, summary: "", outline: [], openingStyle: "direct_claim", content: "content", targetWordCount: 2000, actualWordCount: 2000, estimatedPages: 8, qualityFlags: [], status: "reviewed", locked: false })) };

test("market intelligence plan separates estimates, compliance, and auditability", () => {
  const plan = generateMarketIntelligencePlan(book);
  assert.equal(plan.timeWindows.length, 5);
  assert.ok(plan.marketScore >= 0 && plan.marketScore <= 100);
  assert.match(plan.disclaimer, /exact sales/i);
  assert.ok(plan.sourceArchitecture.some((source) => source.name === "Google Books API" && source.sourceType === "official_api"));
  assert.ok(plan.sourceArchitecture.some((source) => /robots\.txt|crawl logs|rate limits/i.test(source.auditRequirement)));
  assert.ok(plan.dashboardModules.includes("Verified vs Estimated Sales Toggle"));
  assert.ok(plan.recommendations.some((item) => /confidence badges/i.test(item)));
});

test("sales leaderboard keeps verified and estimated metrics separate", () => {
const rows = parseSalesCsv("bookTitle,authorName,entityName,entityType,unitsSold,revenue,sourceType\nVerified Book,A,Proof Press,publisher,1000,10000,verified\nSignal Book,B,Proof Press,publisher,500,3000,public_signal");
  const [score] = buildLeaderboardScores(rows, { includeLowConfidence: true });
  assert.equal(score.verifiedUnitsSold, 1000);
  assert.equal(score.estimatedUnitsSold, 500);
  assert.equal(score.verificationStatus, "verified");
  assert.ok(score.claritySalesRankScore >= 0 && score.claritySalesRankScore <= 100);
  assert.ok(VERIFICATION_BADGES.some((badge) => badge.badge === "diamond"));
});


test("author partner finder highlights top publisher and marketer before selection", () => {
  const finder = buildAuthorPartnerFinder();
  assert.equal(finder.topPublisher?.entityType, "publisher");
  assert.equal(finder.topMarketer?.entityType, "marketing_partner");
  assert.ok(finder.topPublisher.verifiedUnitsSold > 0);
  assert.ok(finder.topMarketer.verifiedUnitsSold > 0);
  assert.ok(finder.decisionNotes.some((note) => /most verified sales/i.test(note)));
  assert.ok(finder.decisionNotes.some((note) => /verified units/i.test(note)));
});
