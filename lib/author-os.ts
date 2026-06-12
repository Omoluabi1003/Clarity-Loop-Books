import type { Book, Chapter } from "./types";
import { analyzeBookQuality } from "./quality";

export interface ManuscriptSignal {
  label: string;
  score: number;
  detail: string;
}

export interface ManuscriptIntelligence {
  publishReadyScore: number;
  uniquenessScore: number;
  toneConsistencyScore: number;
  structureScore: number;
  audienceAlignmentScore: number;
  readabilityScore: number;
  commercialClarityScore: number;
  repeatedOpeningGroups: number[][];
  repeatedPhrases: string[];
  recommendations: string[];
  signals: ManuscriptSignal[];
}


export interface AuthorBrainProfile {
  preferredTone: string;
  preferredWritingStyle: string;
  primaryAudience: string;
  favoriteThemes: string[];
  projectCount: number;
  completedProjectCount: number;
  nextBookRecommendation: string;
  memoryStrength: number;
}

function mostFrequent(values: string[], fallback: string): string {
  const counts = values.filter(Boolean).reduce<Record<string, number>>((result, value) => ({ ...result, [value]: (result[value] || 0) + 1 }), {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || fallback;
}

export function buildAuthorBrain(books: Book[]): AuthorBrainProfile {
  const active = books.filter((book) => !book.deletedAt);
  const themes = active.flatMap((book) => [book.genre, ...(book.bookDna?.themes || [])]).filter(Boolean);
  const preferredTone = mostFrequent(active.map((book) => book.tone), "Not learned yet");
  const preferredWritingStyle = mostFrequent(active.map((book) => book.writingStyle), "Not learned yet");
  const primaryAudience = mostFrequent(active.map((book) => book.targetAudience), "Not learned yet");
  const favoriteThemes = [...new Set(themes)].slice(0, 4);
  const completedProjectCount = active.filter((book) => book.status === "exported" || book.progress >= 100).length;
  const latestGenre = active.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0]?.genre;
  return {
    preferredTone,
    preferredWritingStyle,
    primaryAudience,
    favoriteThemes,
    projectCount: active.length,
    completedProjectCount,
    nextBookRecommendation: latestGenre ? `Build a differentiated follow-up in ${latestGenre} for ${primaryAudience}.` : "Start a project to unlock a personalized next-book recommendation.",
    memoryStrength: clamp(active.length * 22 + Math.min(30, active.reduce((sum, book) => sum + book.chapters.filter((chapter) => chapter.content.trim()).length, 0) * 3)),
  };
}

export interface AuthorNextAction {
  label: string;
  detail: string;
  action: "blueprint" | "chapters" | "author_success" | "preview";
}

const words = (value: string) => value.trim().toLowerCase().match(/[a-z0-9']+/g) || [];
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function vocabulary(chapter: Chapter): Set<string> {
  return new Set(words(chapter.content).filter((word) => word.length > 4));
}

function chapterUniqueness(chapter: Chapter, chapters: Chapter[]): number {
  const own = vocabulary(chapter);
  if (!own.size) return 0;
  const others = new Set(chapters.filter((item) => item.id !== chapter.id).flatMap((item) => [...vocabulary(item)]));
  const shared = [...own].filter((word) => others.has(word)).length;
  return clamp(100 - (shared / own.size) * 62);
}

function toneFingerprint(chapter: Chapter) {
  const text = chapter.content;
  const sentenceCount = Math.max(1, text.split(/[.!?]+/).filter(Boolean).length);
  return {
    sentenceLength: words(text).length / sentenceCount,
    questions: (text.match(/\?/g) || []).length / sentenceCount,
    exclamations: (text.match(/!/g) || []).length / sentenceCount,
  };
}

export function analyzeManuscriptIntelligence(book: Book): ManuscriptIntelligence {
  const drafted = book.chapters.filter((chapter) => chapter.content.trim());
  const quality = analyzeBookQuality(book);
  const uniquenessScore = drafted.length
    ? clamp(drafted.reduce((sum, chapter) => sum + chapterUniqueness(chapter, drafted), 0) / drafted.length)
    : 0;
  const fingerprints = drafted.map(toneFingerprint);
  const averageLength = fingerprints.length ? fingerprints.reduce((sum, item) => sum + item.sentenceLength, 0) / fingerprints.length : 0;
  const toneVariance = fingerprints.length
    ? fingerprints.reduce((sum, item) => sum + Math.abs(item.sentenceLength - averageLength) + item.questions * 8 + item.exclamations * 8, 0) / fingerprints.length
    : 20;
  const toneConsistencyScore = drafted.length ? clamp(100 - toneVariance * 3) : 0;
  const structured = drafted.filter((chapter) => chapter.outline.length >= 2 && chapter.summary.trim() && chapter.title.trim()).length;
  const structureScore = book.chapters.length ? clamp((structured / book.chapters.length) * 100) : 0;
  const completionScore = book.chapterCount ? clamp((drafted.length / book.chapterCount) * 100) : 0;
  const audienceTerms = words(`${book.targetAudience} ${book.bookDna.promise}`).filter((word) => word.length > 4);
  const manuscriptWords = new Set(words(drafted.map((chapter) => chapter.content).join(" ")));
  const audienceAlignmentScore = drafted.length ? clamp(55 + (audienceTerms.filter((word) => manuscriptWords.has(word)).length / Math.max(1, audienceTerms.length)) * 45) : 0;
  const averageSentenceLength = fingerprints.length ? fingerprints.reduce((sum, item) => sum + item.sentenceLength, 0) / fingerprints.length : 0;
  const readabilityScore = drafted.length ? clamp(100 - Math.abs(17 - averageSentenceLength) * 4) : 0;
  const commercialClarityScore = clamp((book.title.trim() ? 25 : 0) + (book.subtitle.trim() ? 20 : 0) + (book.targetAudience.trim() ? 25 : 0) + (book.bookDna.promise?.trim() ? 30 : 0));
  const publishReadyScore = clamp(quality.score * .24 + uniquenessScore * .16 + toneConsistencyScore * .14 + structureScore * .12 + completionScore * .12 + audienceAlignmentScore * .1 + readabilityScore * .06 + commercialClarityScore * .06);
  const repeatedPhrases = quality.repeatedPhraseFamilies.filter((item) => item.exceedsThreshold).map((item) => item.phrase);
  const recommendations: string[] = [];

  if (!drafted.length) recommendations.push("Draft the first chapter to unlock manuscript-level intelligence.");
  if (quality.duplicateOpenings.length) recommendations.push(`Rewrite the openings of chapters ${quality.duplicateOpenings.flat().join(", ")} so each chapter earns attention differently.`);
  if (repeatedPhrases.length) recommendations.push(`Replace repeated phrase families: ${repeatedPhrases.slice(0, 3).join(", ")}.`);
  if (uniquenessScore < 80 && drafted.length) recommendations.push("Add chapter-specific examples, evidence, or stories to strengthen uniqueness.");
  if (toneConsistencyScore < 80 && drafted.length > 1) recommendations.push(`Align sentence rhythm and point of view with the book's ${book.tone.toLowerCase()} tone.`);
  if (structureScore < 85) recommendations.push("Complete each chapter summary and outline before final editing.");
  if (publishReadyScore >= 85) recommendations.push("Run a final human proofread, then move this manuscript into publishing and launch preparation.");

  return {
    publishReadyScore,
    uniquenessScore,
    toneConsistencyScore,
    structureScore,
    audienceAlignmentScore,
    readabilityScore,
    commercialClarityScore,
    repeatedOpeningGroups: quality.duplicateOpenings,
    repeatedPhrases,
    recommendations: recommendations.slice(0, 4),
    signals: [
      { label: "Chapter uniqueness", score: uniquenessScore, detail: "Distinct ideas and vocabulary across chapters" },
      { label: "Tone consistency", score: toneConsistencyScore, detail: `Alignment with the ${book.tone} voice` },
      { label: "Structure quality", score: structureScore, detail: "Complete chapter promises, summaries, and outlines" },
      { label: "Audience alignment", score: audienceAlignmentScore, detail: `Fit for ${book.targetAudience}` },
      { label: "Readability", score: readabilityScore, detail: "Sentence rhythm and reading accessibility" },
      { label: "Commercial clarity", score: commercialClarityScore, detail: "Title, promise, audience, and positioning clarity" },
    ],
  };
}

export function getAuthorNextAction(book: Book): AuthorNextAction {
  const drafted = book.chapters.filter((chapter) => chapter.content.trim()).length;
  if (!book.chapters.length) return { label: "Approve your book blueprint", detail: "Lock the reader promise and chapter journey before drafting.", action: "blueprint" };
  if (!drafted) return { label: "Draft chapter one", detail: "Create a meaningful first chapter and unlock manuscript intelligence.", action: "chapters" };
  if (drafted < book.chapterCount) return { label: `Continue with chapter ${drafted + 1}`, detail: `${book.chapterCount - drafted} chapters remain in your first draft.`, action: "chapters" };
  if (!book.exportHistory?.some((job) => job.status === "completed")) return { label: "Prepare your publishing package", detail: "Review readiness, metadata, launch assets, and export options.", action: "author_success" };
  return { label: "Launch your reader preview", detail: "Turn the finished book into a waitlist and referral asset.", action: "preview" };
}

export function getPublishingChecklist(book: Book) {
  const drafted = book.chapters.filter((chapter) => chapter.content.trim()).length;
  return [
    { label: "Reader and promise defined", complete: Boolean(book.targetAudience && book.bookDna.promise) },
    { label: "First draft completed", complete: drafted >= book.chapterCount },
    { label: "Manuscript quality reviewed", complete: book.qualityScore >= 80 },
    { label: "Cover direction approved", complete: Boolean(book.coverImageUrl || book.useDesignedCover) },
    { label: "Publishing files exported", complete: Boolean(book.exportHistory?.some((job) => job.status === "completed")) },
  ];
}
