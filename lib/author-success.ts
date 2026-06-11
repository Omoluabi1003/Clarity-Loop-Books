import type { AuthorSuccessPlan, Book, PublishingPackage } from "./types";
import { analyzeMarketability } from "./marketability";
import { buildReaderDNA } from "./reader-dna";
import { positionBook } from "./book-positioning";
import { generateLaunchPackage, generateReviewPlan } from "./launch-assets";
import { generateMarketingPackage } from "./marketing-assets";
import { generateMonetizationPackage } from "./monetization-assets";

export const AUTHOR_SUCCESS_DISCLAIMER = "Marketing assets improve preparation and positioning but do not guarantee sales.";

function publishingPackage(book: Book, pitch: ReturnType<typeof positionBook>): PublishingPackage {
  const author = book.authorBio || `${book.authorName} is the author of ${book.title}, writing for ${book.targetAudience}.`;
  const opening = pitch.backCoverHook;
  const description = `${opening}\n\n${pitch.thirtySecondPitch}\n\nInside, readers will explore ${book.bookDna.themes.slice(0, 4).join(", ") || book.idea} through a ${book.tone.toLowerCase()} voice. ${pitch.readerPromise}.`;
  return {
    amazonDescription: `${description}\n\nChoose ${book.title} if you are ready for a book built around a specific reader need rather than broad promises.`,
    barnesAndNobleDescription: description,
    backCoverCopy: `${opening}\n\n${pitch.oneSentencePitch}\n\n${book.chapters.slice(0, 3).map((chapter) => `• ${chapter.title}`).join("\n")}\n\n${AUTHOR_SUCCESS_DISCLAIMER}`,
    shortBookDescription: pitch.oneSentencePitch,
    longBookDescription: description,
    authorBioShort: author.split(/(?<=[.!?])\s/)[0],
    authorBioLong: author,
    keywords: pitch.keywordThemes.slice(0, 7),
    categories: pitch.categoryRecommendations,
    bookMetadata: { title: book.title, subtitle: book.subtitle, author: book.authorName, genre: book.genre, audience: book.targetAudience, tone: book.tone, language: "English" },
    disclaimerSuggestions: [AUTHOR_SUCCESS_DISCLAIMER, "Storefront categories, keywords, claims, and legal notices should be independently reviewed before publication."],
  };
}

export function generateAuthorSuccessPlan(book: Book): AuthorSuccessPlan {
  const marketability = analyzeMarketability(book);
  const readerDNA = buildReaderDNA(book);
  const positioning = positionBook(book, readerDNA);
  const publishing = publishingPackage(book, positioning);
  const launch = generateLaunchPackage(book, marketability, positioning);
  const marketing = generateMarketingPackage(book, positioning, readerDNA);
  const reviews = generateReviewPlan(book);
  const monetization = generateMonetizationPackage(book, positioning);
  const authorSuccessScore = Math.round((marketability.marketabilityScore + launch.launchReadinessScore + marketability.positioningScore) / 3);
  return { marketability, readerDNA, positioning, publishing, launch, marketing, reviews, monetization, blueprint: { authorSuccessScore, bookBusinessSummary: `${book.title} can operate as more than a manuscript: it can anchor a focused reader promise, an ethical launch campaign, reusable audience content, and genre-appropriate opportunities beyond direct book sales.`, recommendedAudience: book.targetAudience, recommendedPositioning: positioning.positioningStatement, recommendedLaunchStrategy: `Use a trust-led 90-day launch built around ${readerDNA.whereReadersCanBeFound.slice(0, 3).join(", ")}, a small ethical ARC team, and book-specific excerpts.`, recommendedMarketingChannels: readerDNA.whereReadersCanBeFound.slice(0, 4), recommendedRevenuePaths: monetization.leadMagnetIdeas.slice(0, 2).concat(monetization.keynoteTopics.slice(0, 2)), firstSevenDaysActionPlan: ["Review the three lowest marketability scores", "Approve the primary Reader DNA", "Refine the one-sentence pitch", "Confirm the book description and metadata"], nextThirtyDaysActionPlan: launch.thirtyDayLaunchPlan, nextNinetyDaysActionPlan: [...launch.sixtyDayLaunchPlan.slice(0, 2), ...launch.ninetyDayLaunchPlan.slice(0, 3)] }, disclaimer: AUTHOR_SUCCESS_DISCLAIMER };
}

export function authorSuccessText(book: Book, plan: AuthorSuccessPlan): string {
  const lines = [`AUTHOR SUCCESS BLUEPRINT — ${book.title}`, `Author: ${book.authorName}`, "", `Score: ${plan.blueprint.authorSuccessScore}/100`, plan.disclaimer, "", "POSITIONING", plan.positioning.positioningStatement, "", "READER PROMISE", plan.positioning.readerPromise, "", "FIRST 7 DAYS", ...plan.blueprint.firstSevenDaysActionPlan.map((item) => `- ${item}`), "", "NEXT 30 DAYS", ...plan.blueprint.nextThirtyDaysActionPlan.map((item) => `- ${item}`), "", "NEXT 90 DAYS", ...plan.blueprint.nextNinetyDaysActionPlan.map((item) => `- ${item}`)];
  return lines.join("\n");
}
