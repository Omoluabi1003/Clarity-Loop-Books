import type { Book, ReaderDNA } from "./types";

export function buildReaderDNA(book: Book): ReaderDNA {
  const audience = book.targetAudience || "readers seeking a meaningful next step";
  const promise = book.bookDna.promise || book.bookDna.corePromise || book.idea;
  const fiction = /fiction|romance|thriller|mystery|fantasy|drama|sci-fi|novel/i.test(`${book.genre} ${book.bookDna.bookType}`);
  const faith = /faith|christian|spiritual|devotional|ministry/i.test(book.genre);
  const platform = fiction ? "Instagram, TikTok, Goodreads, and reader communities" : faith ? "Facebook, YouTube, podcasts, churches, and ministry communities" : "LinkedIn, podcasts, newsletters, YouTube, and professional communities";
  return {
    primaryReaderAvatar: { name: "The Ready Reader", ageRange: fiction ? "18–54" : "30–55", professionOrLifeStage: audience, currentProblem: fiction ? `They want an immersive ${book.genre.toLowerCase()} experience that feels emotionally worthwhile.` : `They need a credible path through ${book.idea.toLowerCase()}.`, desiredOutcome: promise, emotionalState: fiction ? "Curious, selective, and ready to feel transported" : "Motivated but wary of vague advice", buyingTrigger: `A specific promise, trusted recommendation, or excerpt that reflects their experience`, objection: "Will this book truly understand me and reward my time?", preferredPlatform: platform },
    secondaryReaderAvatar: { name: "The Trusted Recommender", ageRange: "35–65", professionOrLifeStage: fiction ? "Book club host, reviewer, librarian, or avid genre reader" : "Leader, coach, educator, colleague, friend, or community guide", currentProblem: `They need a credible book to recommend to someone navigating the book's central theme.`, desiredOutcome: "Make a useful, confident recommendation", emotionalState: "Helpful, discerning, and reputation-conscious", buyingTrigger: "Clear positioning, social proof, and a strong sample", objection: "Is this relevant and responsible enough to recommend?", preferredPlatform: platform },
    readerPainPoints: fiction ? ["Difficulty finding fresh stories in a familiar genre", "Limited reading time", "Concern that the emotional payoff will not match the premise"] : [`Uncertainty about how to act on ${book.idea.toLowerCase()}`, "Too much generic or conflicting guidance", "Limited time to turn insight into action"],
    readerGoals: fiction ? ["Feel immersed", "Connect with memorable characters", "Discover a story worth discussing"] : [promise, "Gain a practical next step", "Feel understood and capable of progress"],
    readerBuyingTriggers: ["A title and subtitle that name the experience", "A recommendation from a trusted peer", "A sample chapter or story moment with immediate relevance"],
    readerObjections: ["This may be too broad or generic", "I may not have time to apply or finish it", "I need proof that the author understands this subject or audience"],
    readerTransformationPromise: fiction ? `Readers move from everyday distraction into a resonant ${book.genre.toLowerCase()} experience shaped by ${book.bookDna.themes.slice(0, 3).join(", ") || "the book's central themes"}.` : `Readers move from uncertainty to ${promise.toLowerCase()}, with language and steps they can use beyond the final page.`,
    whereReadersCanBeFound: platform.split(", ").map((item) => item.replace(/^and /, "")),
    languageReadersUse: ["I need something practical, not generic.", "I want a book that understands where I am.", fiction ? "I want a story I cannot stop thinking about." : "Show me what to do next."],
  };
}
