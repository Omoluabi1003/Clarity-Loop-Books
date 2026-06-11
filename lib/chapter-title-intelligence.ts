import type { BookDNA, Chapter, ChapterTitleContext, ChapterTitleOption, TitleQuality } from "./types";

const weakExact = ["chapter 1", "introduction", "building the practice 6", "the way forward 10", "understanding the concept", "applying the method", "implementation in modern work", "a new way to see it"];
const businessWords = /framework|strategy|implementation|operating model|modern work|scale|productivity/i;
const actionWords = /clarify|map|practice|apply|build|review|identify|plan|create|test/i;

const titleSets: Record<string, string[]> = {
  life_story: ["The House That Shaped {subject}", "A Childhood of Quiet Lessons", "The First Turning Point", "The Burden {subject} Carried", "The People Who Changed Everything", "A Legacy Still Speaking"],
  memory_journey: ["The Room I Still Remember", "What I Could Not Say Then", "The Day Everything Shifted", "The Version of Me I Left Behind", "What Memory Kept"],
  framework_instruction: ["Why the Old Model Breaks", "The Cost of Waiting for Certainty", "From Feedback to Better Decisions", "The Principle Beneath the Practice", "Making the Change Durable"],
  leadership_practice: ["The Decision No One Could Avoid", "What Trust Requires", "The Weight of the Room", "Leading Before Certainty", "The Culture Our Choices Create"],
  systems_exploration: ["The Shift Already Underway", "What the System Changes", "Beyond the Hype Cycle", "The Responsible Experiment", "Designing for What Comes Next"],
  guided_transformation: ["When the Old Answer Stops Working", "The Story Beneath the Struggle", "A Smaller, Braver Step", "Learning to Trust the Change", "The Practice That Carries You Forward"],
  spiritual_growth: ["When Grace Found Me", "The Valley Before the Calling", "Restored for a Reason", "What Surrender Opened", "Faith for the Road Ahead"],
  story_world: ["The Night the Door Opened", "A Promise Beneath the Rain", "The Stranger at the Crossing", "What Waited Beyond the Fire", "The Choice That Changed the Map"],
  imaginative_story: ["The Morning the Moon Sneezed", "A Door in the Dandelions", "The Brave Little Maybe", "The Day the Colors Ran Away", "Home Before the Stars"],
  applied_practice: ["Clarify the Problem", "Map the Pattern", "Practice the New Response", "Test What You Learned", "Build Your Action Plan"],
  screen_story: ["Opening Image: A World Out of Balance", "The Inciting Choice", "Crossing Into Danger", "The Reversal", "Final Image: What Has Changed"],
};

function topicWords(chapterIntent: string): string[] {
  return chapterIntent.split(/\W+/).filter((word) => word.length > 4 && !/chapter|reader|showing|specific|book|central/i.test(word)).slice(0, 4);
}

export function isWeakChapterTitle(title: string): boolean {
  const normalized = title.trim().toLowerCase();
  return !normalized || weakExact.includes(normalized) || /^chapter\s+\d+$/i.test(title) || /^(understanding|applying|introduction to|a new way|the way forward)(\b|:)/i.test(title) || /\s\d+$/.test(title);
}

export function scoreChapterTitle(title: string, bookDna: BookDNA, chapterIntent = ""): number {
  let score = isWeakChapterTitle(title) ? 35 : 78;
  const mode = bookDna.creativeMode;
  if (mode === "life_story" && businessWords.test(title)) score -= 35;
  if ((mode === "story_world" || mode === "screen_story") && /framework|method|concept|implementation/i.test(title)) score -= 35;
  if (mode === "applied_practice" && !actionWords.test(title)) score -= 20;
  if (topicWords(chapterIntent).some((word) => title.toLowerCase().includes(word.toLowerCase()))) score += 8;
  if (title.split(/\s+/).length >= 3 && title.split(/\s+/).length <= 8) score += 8;
  return Math.max(0, Math.min(100, score));
}

export function buildChapterTitleContext(title: string, bookDna: BookDNA, chapterIntent = ""): ChapterTitleContext {
  const profile = bookDna.genreProfile;
  const score = scoreChapterTitle(title, bookDna, chapterIntent);
  const keywords = [...new Set([...topicWords(title), ...topicWords(chapterIntent)])].slice(0, 6);
  const opening = profile?.openingStyles[0] || "scenario";
  return { title, creativeAnchor: `Treat “${title}” as the governing image and promise for this chapter, not a decorative heading.`, chapterPromise: chapterIntent || `Deliver a distinct movement in the reader's journey that fulfills “${title}.”`, suggestedOpeningStyle: opening, emotionalDirection: bookDna.creativeMode === "story_world" ? "Increase tension, discovery, and emotional consequence." : bookDna.creativeMode === "life_story" || bookDna.creativeMode === "memory_journey" ? "Move from lived detail toward reflective meaning." : bookDna.creativeMode === "spiritual_growth" ? "Move honestly from spiritual tension toward grace, restoration, or calling." : bookDna.creativeMode === "applied_practice" ? "Move from clarity to confident action." : "Move from recognition to insight and a meaningful next step.", tone: bookDna.toneGuidance || bookDna.tone, keywords, genreFitScore: score };
}

export function generateChapterTitleOptions(bookDna: BookDNA, chapterIntent: string, index: number): ChapterTitleOption[] {
  const mode = bookDna.creativeMode || "guided_transformation";
  const set = titleSets[mode] || titleSets.guided_transformation;
  return Array.from({ length: 4 }, (_, offset) => {
    const title = set[(index + offset) % set.length].replaceAll("{subject}", "Them");
    const context = buildChapterTitleContext(title, bookDna, chapterIntent);
    return { title, subtitle: topicWords(chapterIntent).join(" · "), rationale: `Fits the ${bookDna.genreProfile?.label || bookDna.bookType || "selected"} journey and gives this chapter a specific creative direction.`, tone: context.tone, chapterPromise: context.chapterPromise, suggestedOpeningStyle: context.suggestedOpeningStyle, emotionalDirection: context.emotionalDirection, keywords: context.keywords, genreFitScore: context.genreFitScore };
  }).sort((a, b) => b.genreFitScore - a.genreFitScore);
}

export function titleQuality(title: string, bookDna: BookDNA, chapterIntent = ""): TitleQuality {
  const score = scoreChapterTitle(title, bookDna, chapterIntent);
  return isWeakChapterTitle(title) ? "Generic" : score >= 75 ? "Strong" : "Needs work";
}

export function validateChapterTitles(chapters: Chapter[], bookDna: BookDNA): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  const scores = chapters.map((chapter) => {
    const title = chapter.selectedTitle || chapter.title;
    const score = scoreChapterTitle(title, bookDna, chapter.summary);
    if (isWeakChapterTitle(title)) warnings.push(`Chapter ${chapter.chapterNumber}: Chapter title appears generic.`);
    if (bookDna.creativeMode === "life_story" && businessWords.test(title)) warnings.push(`Chapter ${chapter.chapterNumber}: Biography title sounds like business strategy.`);
    if (bookDna.creativeMode === "story_world" && /framework|method|implementation|concept/i.test(title)) warnings.push(`Chapter ${chapter.chapterNumber}: Fiction title sounds like nonfiction framework.`);
    if (bookDna.creativeMode === "applied_practice" && !actionWords.test(title)) warnings.push(`Chapter ${chapter.chapterNumber}: Workbook title lacks practical action.`);
    return score;
  });
  return { score: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0, warnings };
}

export function regenerateTitleOptionsForChapter(bookDna: BookDNA, chapter: Chapter): ChapterTitleOption[] {
  if (chapter.titleLocked) return chapter.titleOptions || [];
  return generateChapterTitleOptions(bookDna, chapter.summary || chapter.thesis || "", chapter.chapterNumber + (chapter.titleOptions?.length || 0));
}
