import type { AuthorSuccessPlan, Book } from "./types";
import { CLARITY_LAUNCH_NOTE } from "./launch-copy";

export function getLaunchContext(book: Book) {
  return {
    title: book.title || "Untitled Book",
    genre: book.genre || "General Nonfiction",
    audience: book.targetAudience || book.bookDna?.audience || "motivated readers",
    promise: book.bookDna?.promise || book.idea || "A clear reader transformation.",
    author: book.authorName || "The author"
  };
}

export function generateClarityLaunchPlan(book: Book): AuthorSuccessPlan {
  const context = getLaunchContext(book);

  return {
    marketability: {
      marketabilityScore: 78,
      audienceClarityScore: 82,
      titleStrengthScore: 80,
      subtitleStrengthScore: book.subtitle ? 76 : 48,
      coverStrengthScore: book.coverPrompt ? 72 : 45,
      positioningScore: 78,
      readerPromiseScore: 82,
      categoryFitScore: 74,
      salesReadinessScore: 70,
      topWeaknesses: ["Audience proof and reader feedback still need to be collected."],
      topRecommendations: ["Clarify the reader promise in one strong sentence."]
    },
    readerDNA: {
      primaryReaderAvatar: {
        name: "Focused Reader",
        ageRange: "28-55",
        professionOrLifeStage: "Working adult seeking practical clarity",
        currentProblem: "They need a trusted guide.",
        desiredOutcome: "They want a clear and useful reading experience.",
        emotionalState: "Curious and ready for direction",
        buyingTrigger: "A specific and credible promise.",
        objection: "They are unsure whether this book is different.",
        preferredPlatform: "Search, Amazon, social platforms, and email"
      },
      secondaryReaderAvatar: {
        name: "Recommendation Reader",
        ageRange: "35-65",
        professionOrLifeStage: "Community member, coach, leader, or lifelong learner",
        currentProblem: "They need material they can apply or recommend.",
        desiredOutcome: "They want a book with substance.",
        emotionalState: "Selective but open",
        buyingTrigger: "Strong positioning and a persuasive sample.",
        objection: "They need evidence that the book delivers practical value.",
        preferredPlatform: "Email, LinkedIn, groups, podcasts, and referrals"
      },
      readerPainPoints: ["Information overload", "Lack of trusted guidance", "Unclear next steps"],
      readerGoals: ["Gain clarity", "Make better decisions", "Experience meaningful transformation"],
      readerBuyingTriggers: ["Specific promise", "Strong hook", "Relevant sample chapter", "Trusted recommendation"],
      readerObjections: ["Too generic", "Not enough proof", "Unclear benefit"],
      readerTransformationPromise: context.promise,
      whereReadersCanBeFound: ["Amazon categories", "Facebook groups", "Instagram", "YouTube", "LinkedIn", "Email lists"],
      languageReadersUse: ["I need clarity", "I need a practical guide", "I want something that speaks to my situation"]
    },
    positioning: {
      positioningStatement: `${context.title} is positioned for ${context.audience}.`,
      uniqueSellingProposition: `A guided ${context.genre} reading experience shaped by clear Book DNA.`,
      readerPromise: context.promise,
      competitiveAngle: "Clarity-first positioning supported by practical launch assets.",
      categoryRecommendations: [context.genre, "Personal Growth", "Practical Nonfiction"],
      keywordThemes: [context.title, context.genre, "clarity", "transformation", "practical guide"],
      backCoverHook: `${context.title} offers a clear path for readers who need direction.`,
      oneSentencePitch: `${context.title} helps ${context.audience} move from confusion to clarity.`,
      thirtySecondPitch: `${context.title} is built for ${context.audience}. It creates a practical path they can follow without feeling overwhelmed.`
    },
    publishing: {
      amazonDescription: `${context.title} gives ${context.audience} a clear and practical path.`,
      barnesAndNobleDescription: `${context.title} is a reader-first book designed to help ${context.audience}.`,
      backCoverCopy: `${context.title} was built for readers who need clarity and direction.`,
      shortBookDescription: `${context.title} helps ${context.audience} gain clarity and take the next right step.`,
      longBookDescription: `${context.title} combines practical insight, focused structure, and a clear reader promise.`,
      authorBioShort: book.authorBio || `${context.author} writes with clarity, purpose, and practical insight.`,
      authorBioLong: book.authorBio || `${context.author} created this book to help readers move from uncertainty to clarity.`,
      keywords: [context.title, context.genre, context.audience, "clarity", "book launch", "reader transformation"],
      categories: [context.genre, "Personal Growth", "Practical Nonfiction"],
      bookMetadata: { title: context.title, subtitle: book.subtitle || "", author: context.author, genre: context.genre },
      disclaimerSuggestions: [CLARITY_LAUNCH_NOTE]
    },
    launch: {
      launchReadinessScore: 72,
      launchChecklist: ["Finalize manuscript", "Prepare cover", "Create launch page", "Prepare sample chapter"],
      thirtyDayLaunchPlan: ["Week 1: clarify positioning", "Week 2: prepare outreach", "Week 3: test hooks", "Week 4: launch and improve"],
      sixtyDayLaunchPlan: ["Refine messaging", "Publish reader proof", "Improve hooks", "Pitch newsletters"],
      ninetyDayLaunchPlan: ["Build author authority", "Create workshops", "Expand partnerships", "Prepare second campaign wave"],
      arcReaderStrategy: "Recruit a small group of aligned readers before launch for honest feedback.",
      reviewRequestPlan: ["Ask after value has been delivered", "Make the review link easy", "Follow up respectfully once"],
      influencerOutreachPlan: ["Identify niche voices", "Send a short pitch", "Offer a sample chapter"],
      launchEmailSequence: ["Announcement", "Problem and promise", "Sample chapter", "Launch day"],
      launchDayChecklist: ["Confirm book links", "Verify launch page", "Send launch email", "Post social assets"]
    },
    marketing: {
      linkedInPosts: [`${context.title} is a message built for ${context.audience}.`],
      facebookPosts: [`${context.title} was written for readers who need clarity.`],
      xPosts: [`A clear book promise matters: ${context.promise}`],
      threadsPosts: ["The best books speak clearly to the right reader."],
      instagramCaptions: ["This book was built for readers who need clarity and direction."],
      tikTokVideoIdeas: ["Start with the reader problem, show the book, explain the promise."],
      youtubeShortsIdeas: ["Explain who the book is for and what it helps them do."],
      podcastPitchEmail: `Subject: Guest idea connected to ${context.title}`,
      pressRelease: `${context.author} announces ${context.title}, a ${context.genre} book created for ${context.audience}.`,
      bookTrailerScript: `${context.title} is for ${context.audience} who are ready for clarity.`
    },
    reviews: {
      arcInvitationMessage: `I am inviting a small group of early readers to review ${context.title}.`,
      reviewRequestEmail: `Thank you for reading ${context.title}. Your honest review can help other readers discover it.`,
      reviewFollowUpEmail: `Just following up once with appreciation for your time with ${context.title}.`,
      launchTeamMessage: `Thank you for being part of the launch team for ${context.title}.`,
      readerThankYouMessage: `Thank you for reading ${context.title}. Your time and feedback matter.`,
      reviewTrackingChecklist: ["Track early readers", "Track review links", "Track follow-ups", "Track testimonials"]
    },
    monetization: {
      workshopOutline: ["Core promise", "Reader problem", "Practical framework", "Action steps"],
      courseOutline: ["Module 1: Foundation", "Module 2: Clarity", "Module 3: Application", "Module 4: Next steps"],
      webinarOutline: ["Hook", "Problem", "Framework", "Book offer", "Q&A"],
      keynoteTopics: [`The core message behind ${context.title}`, "From confusion to clarity"],
      speakerOneSheetCopy: `${context.author} speaks on the ideas behind ${context.title}.`,
      consultingOffer: `A focused advisory session built around the framework of ${context.title}.`,
      leadMagnetIdeas: ["Sample chapter", "Reader checklist", "Companion workbook", "Reflection guide"],
      emailNurtureSequence: ["Welcome", "Reader pain point", "Book promise", "Case example", "Offer"],
      coachingPackageIdeas: ["One-session clarity consult", "Four-week guided implementation"],
      corporateTrainingAngle: "Adapt the book framework into a practical training experience."
    },
    blueprint: {
      authorSuccessScore: 76,
      bookBusinessSummary: `${context.title} can be positioned as a reader-first book with supporting launch assets.`,
      recommendedAudience: context.audience,
      recommendedPositioning: `${context.title} should lead with the reader transformation, not only the topic.`,
      recommendedLaunchStrategy: "Use organic validation first, then expand the best-performing hooks after tracking is ready.",
      recommendedMarketingChannels: ["Email", "Facebook", "Instagram", "YouTube Shorts", "LinkedIn"],
      recommendedRevenuePaths: ["Ebook", "Paperback", "Workbook", "Workshop", "Speaking", "Consulting"],
      firstSevenDaysActionPlan: ["Finalize pitch", "Create launch page", "Prepare sample chapter", "Draft launch emails"],
      nextThirtyDaysActionPlan: ["Launch content cadence", "Recruit early readers", "Collect reviews", "Test hooks"],
      nextNinetyDaysActionPlan: ["Build authority", "Pitch interviews", "Create companion offer", "Improve campaign assets"]
    },
    disclaimer: CLARITY_LAUNCH_NOTE
  };
}
