import type { Book, BookPositioning, LaunchPackage, MarketabilityReport, ReviewAcquisitionPlan } from "./types";

export function generateReviewPlan(book: Book): ReviewAcquisitionPlan {
  const honest = "An honest review is always welcome; there is no expectation of a positive rating.";
  return {
    arcInvitationMessage: `I’m inviting a small group of advance readers for ${book.title}. You would receive a review copy and may share candid feedback or an honest review if you choose. ${honest}`,
    reviewRequestEmail: `Thank you for reading ${book.title}. If the book was useful or meaningful to you, would you consider leaving an honest review in your own words? ${honest}`,
    reviewFollowUpEmail: `A gentle follow-up in case you intended to review ${book.title}. Please feel no pressure—your time and honest perspective matter most.`,
    launchTeamMessage: `Launch team members may share the book with relevant readers and post honest reactions. Please disclose receipt of an advance copy where required and never coordinate ratings or scripted reviews.`,
    readerThankYouMessage: `Thank you for spending time with ${book.title}. Your thoughtful, independent response helps other readers decide whether the book fits them.`,
    reviewTrackingChecklist: ["Record ARC delivery with consent", "Track follow-up date—not desired rating", "Keep disclosure language visible", "Never reward positive sentiment", "Thank every reviewer without debating feedback"],
  };
}

export function generateLaunchPackage(book: Book, marketability: MarketabilityReport, positioning: BookPositioning): LaunchPackage {
  const checks = ["Audience defined", "Positioning clear", "Cover ready", "Description ready", "Keywords ready", "Review plan ready", "Launch posts ready", "Email sequence ready", "Reader magnet ready"];
  return {
    launchReadinessScore: marketability.salesReadinessScore,
    launchChecklist: checks.map((item, index) => `${index < Math.round(marketability.salesReadinessScore / 12) ? "Ready" : "Action needed"}: ${item}`),
    thirtyDayLaunchPlan: ["Finalize storefront copy and metadata", "Recruit a small, audience-fit ARC group", "Prepare a reader magnet and landing page", "Draft the first ten platform-specific posts"],
    sixtyDayLaunchPlan: ["Begin weekly audience education or story excerpts", "Pitch aligned podcasts, newsletters, and communities", "Collect ethical advance reactions", "Test the one-sentence pitch in author conversations"],
    ninetyDayLaunchPlan: ["Publish the full launch calendar", "Confirm retailer and website links", "Schedule launch-week email sequence", "Prepare post-launch review and reader follow-up"],
    arcReaderStrategy: `Recruit 15–30 readers who match ${book.targetAudience}, provide clear timing and disclosure guidance, and request candid feedback without conditioning access on a positive review.`,
    reviewRequestPlan: ["Ask after readers have had reasonable completion time", "Use one direct request and one gentle follow-up", "Invite honest reviews in the reader's own words"],
    influencerOutreachPlan: [`Prioritize creators already serving ${book.targetAudience}`, `Lead with the audience fit: ${positioning.oneSentencePitch}`, "Offer a review copy or interview angle without requesting favorable coverage"],
    launchEmailSequence: ["Email 1: why this book and why now", "Email 2: the reader problem or story tension", "Email 3: useful excerpt or lesson", "Email 4: release-day invitation", "Email 5: post-launch reader thank-you"],
    launchDayChecklist: ["Verify every purchase link", "Send the release email", "Publish platform-native launch posts", "Thank launch partners", "Monitor questions and access issues", "Do not manufacture urgency, sales claims, or reviews"],
  };
}
