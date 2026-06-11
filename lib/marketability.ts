import type { Book, MarketabilityReport } from "./types";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const detailScore = (value: string, ideal: number, base = 42) => clamp(base + Math.min(value.trim().length, ideal) / ideal * (100 - base));

export function analyzeMarketability(book: Book): MarketabilityReport {
  const audienceClarityScore = detailScore(book.targetAudience, 55, 38);
  const titleStrengthScore = clamp(52 + (book.title.length >= 4 && book.title.length <= 62 ? 28 : 8) + (book.title.split(/\s+/).length >= 2 ? 12 : 0));
  const subtitleStrengthScore = book.subtitle ? detailScore(book.subtitle, 70, 46) : 35;
  const coverStrengthScore = clamp((book.coverImageUrl ? 88 : book.coverDirection || book.coverPrompt ? 68 : 35) + (book.coverQualityScore || 0) * .1);
  const positioningScore = clamp((detailScore(book.idea, 150) + audienceClarityScore + detailScore(book.bookDna.promise || book.bookDna.corePromise || "", 90)) / 3);
  const readerPromiseScore = detailScore(book.bookDna.promise || book.bookDna.corePromise || book.idea, 100, 45);
  const categoryFitScore = clamp(book.genre ? 78 + Math.min(book.bookDna.themes.length, 4) * 4 : 40);
  const contentReady = book.chapters.filter((chapter) => chapter.content.trim().length > 0).length / Math.max(book.chapters.length, 1);
  const salesReadinessScore = clamp((audienceClarityScore + positioningScore + coverStrengthScore + contentReady * 100) / 4);
  const marketabilityScore = clamp([audienceClarityScore, titleStrengthScore, subtitleStrengthScore, coverStrengthScore, positioningScore, readerPromiseScore, categoryFitScore, salesReadinessScore].reduce((sum, score) => sum + score, 0) / 8);
  const candidates = ([
    [audienceClarityScore, "The target audience needs more specificity.", `Narrow the audience from “${book.targetAudience || "general readers"}” to a recognizable role, season, or urgent need.`],
    [subtitleStrengthScore, "The subtitle does not yet carry a concrete reader outcome.", "Use the subtitle to name the problem, method, or transformation readers can expect."],
    [coverStrengthScore, "The cover direction is not fully launch-ready.", `Validate the cover against ${book.genre || "genre"} conventions at thumbnail size before launch.`],
    [positioningScore, "The competitive angle could be sharper.", "State what this book does differently from familiar books addressing the same reader problem."],
    [salesReadinessScore, "Several launch inputs remain incomplete.", "Complete description, keywords, review plan, launch posts, email sequence, and reader magnet before launch."],
  ] as [number, string, string][]).sort((a, b) => a[0] - b[0]);
  return { marketabilityScore, audienceClarityScore, titleStrengthScore, subtitleStrengthScore, coverStrengthScore, positioningScore, readerPromiseScore, categoryFitScore, salesReadinessScore, topWeaknesses: candidates.slice(0, 3).map((item) => item[1]), topRecommendations: candidates.slice(0, 3).map((item) => item[2]) };
}
