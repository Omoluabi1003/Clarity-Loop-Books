import { MarketIntelligenceView } from "@/components/MarketIntelligenceView";
import { generateMarketIntelligencePlan } from "@/lib/market-intelligence";
import type { Book } from "@/lib/types";

const demoBook: Book = { id: "market-intelligence-demo", projectType: "nonfiction", title: "Measured Launch", subtitle: "", authorName: "A. Author", authorBio: "", publisherCredit: "Practical Press", idea: "book launch measurement", genre: "Business", targetAudience: "independent authors", tone: "Practical", writingStyle: "Clear", chapterCount: 1, targetPageCount: 180, wordsPerPage: 275, targetWords: 49500, averageWordsPerChapter: 49500, actualWords: 12000, actualEstimatedPages: 44, chapterSizePreference: "medium", aiAssistanceLevel: "guided", bookDna: { promise: "measure traction", tone: "Practical", audience: "authors", readingLevel: "General", voice: "Advisor", themes: ["publishing"], styleRules: [] }, coverPrompt: "", qualityScore: 82, status: "drafting", progress: 55, updatedAt: new Date(0).toISOString(), color: "gold", chapters: [] };

export default function MarketIntelligencePage() {
  return <main className="success-main standalone-market"><MarketIntelligenceView plan={generateMarketIntelligencePlan(demoBook)} /></main>;
}
