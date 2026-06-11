import assert from "node:assert/strict";
import test from "node:test";
import { generateAuthorSuccessPlan } from "../lib/author-success";
import type { Book } from "../lib/types";

function book(genre: string, idea: string): Book {
  return { id: `test-${genre}`, projectType: "nonfiction", title: "The Clear Next Step", subtitle: "A practical path from uncertainty to focused action", authorName: "Test Author", authorBio: "Test Author writes practical, audience-aware books.", idea, genre, targetAudience: "first-time managers leading public-sector modernization teams", tone: "Practical", writingStyle: "Clear and evidence-led", chapterCount: 3, targetPageCount: 120, wordsPerPage: 275, targetWords: 33000, averageWordsPerChapter: 11000, actualWords: 6000, actualEstimatedPages: 22, chapterSizePreference: "medium", aiAssistanceLevel: "guided", bookDna: { promise: "lead change with confidence and a repeatable plan", tone: "Practical", audience: "first-time managers", readingLevel: "General", voice: "Trusted guide", themes: ["leadership", "change", "communication"], styleRules: [] }, coverDirection: "Premium navy leadership cover", coverPrompt: "Professional cover", qualityScore: 82, status: "drafting", progress: 60, updatedAt: new Date(0).toISOString(), color: "#123", chapters: [1,2,3].map((chapterNumber) => ({ id: `c${chapterNumber}`, chapterNumber, title: `Chapter ${chapterNumber}`, summary: `A focused chapter about ${idea}`, outline: [], openingStyle: "direct_claim", content: "A complete manuscript excerpt with a practical example and a reader action.", targetWordCount: 2000, actualWordCount: 2000, estimatedPages: 8, qualityFlags: [], status: "reviewed", locked: true })) };
}

test("author success plan creates scored positioning, launch, publishing, marketing, and ethical review assets", () => {
  const plan = generateAuthorSuccessPlan(book("Business & Professional Development", "leading complex change without losing team trust"));
  assert.ok(plan.marketability.marketabilityScore >= 0 && plan.marketability.marketabilityScore <= 100);
  assert.equal(plan.marketing.linkedInPosts.length, 30);
  assert.equal(plan.marketing.tikTokVideoIdeas.length, 15);
  assert.match(plan.reviews.reviewRequestEmail, /honest review/i);
  assert.match(plan.disclaimer, /do not guarantee sales/i);
  assert.match(plan.positioning.positioningStatement, /first-time managers/i);
});

test("fiction receives reader-community and adaptation paths instead of forced consulting", () => {
  const plan = generateAuthorSuccessPlan(book("Historical Fiction", "a family protecting its history during a changing era"));
  assert.match(plan.monetization.consultingOffer, /not recommended/i);
  assert.ok(plan.monetization.leadMagnetIdeas.some((item) => /scene|character|story/i.test(item)));
});

test("faith books receive respectful ministry-aware paths", () => {
  const plan = generateAuthorSuccessPlan(book("Faith & Spiritual Growth", "finding grounded hope during seasons of uncertainty"));
  assert.match(plan.monetization.consultingOffer, /ministry|study/i);
  assert.ok(plan.monetization.leadMagnetIdeas.some((item) => /small-group/i.test(item)));
});
