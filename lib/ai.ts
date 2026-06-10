import { calculateBookBudget, countWords } from "./book-budget";
import { analyzeChapterQuality, normalizeParagraphCasing } from "./quality";
import type { Book, BookForm, Chapter, ChapterGenerationContext, OpeningStyle } from "./types";

const chapterIdeas: Record<string, string[]> = {
  Memoir: ["The Place It Began", "Before I Knew Better", "The Day Everything Shifted", "Learning to Stay", "What I Carried Forward"],
  Business: ["The Cost of the Old Way", "A Better Operating Principle", "See the System Clearly", "Put the Method to Work", "Make the Change Last"],
  "Christian Devotional": ["Begin With Stillness", "Grace for This Morning", "Faith in the Middle", "A Hope You Can Hold", "Walking Forward in Peace"],
  "Children’s Book": ["A Very Curious Morning", "The Surprise Beyond the Gate", "A Brave Little Choice", "Friends Find a Way", "Home With Something New"],
};

const openingStyles: OpeningStyle[] = ["scenario", "question", "direct_claim", "contrast", "observation", "case_example", "problem_statement"];

export function buildBlueprint(form: BookForm): Chapter[] {
  const ideas = chapterIdeas[form.genre] ?? ["Where You Are Now", "What Keeps You Stuck", "A New Way to See It", "The First Brave Step", "Building a Lasting Practice"];
  const budget = calculateBookBudget(form);
  return budget.chapterBudgets.map((targetWordCount, index) => {
    const title = ideas[index] ?? `${index === form.chapterCount - 1 ? "The Way Forward" : "Building the Practice"} ${index + 1}`;
    return {
      id: `chapter-${Date.now()}-${index}`,
      chapterNumber: index + 1,
      title,
      summary: `Guide ${form.targetAudience.toLowerCase()} through ${title.toLowerCase()} with a clear idea, a relatable example, and a practical next step.`,
      outline: ["Open with a distinct, chapter-specific moment", "Develop the central insight", "Add an example or case study", "Offer practical implementation", "Close with a chapter summary"],
      openingStyle: openingStyles[index % openingStyles.length],
      targetWordCount,
      actualWordCount: 0,
      estimatedPages: Math.ceil(targetWordCount / budget.wordsPerPage),
      content: "",
      qualityFlags: [],
      qualityScore: 100,
      status: "pending",
      locked: false,
    };
  });
}

export function buildBlueprintPrompt(form: BookForm): string {
  const budget = calculateBookBudget(form);
  return `Create a complete book blueprint. Title: ${form.title}. Subtitle: ${form.subtitle}. Author: ${form.authorName}. Book idea: ${form.idea}. Target audience: ${form.targetAudience}. Genre: ${form.genre}. Tone: ${form.tone}. Writing style: ${form.writingStyle}. Target pages: ${budget.targetPages}. Target words: ${budget.targetWords}. Chapter count: ${budget.chapterCount}. Average words per chapter: ${budget.averageWordsPerChapter}.`;
}

export function buildChapterGenerationContext(book: Book, chapter: Chapter): ChapterGenerationContext {
  const previousChapterSummaries = book.chapters
    .filter((candidate) => candidate.chapterNumber < chapter.chapterNumber)
    .sort((a, b) => a.chapterNumber - b.chapterNumber)
    .map((candidate) => candidate.summary);
  const phrasesToAvoid = book.chapters
    .filter((candidate) => candidate.chapterNumber !== chapter.chapterNumber && candidate.content)
    .map((candidate) => candidate.content.split(/\s+/).slice(0, 12).join(" "));
  return {
    bookThesis: book.bookDna.thesis || book.idea,
    audienceProfile: book.targetAudience,
    tone: book.tone,
    writingStyle: book.writingStyle,
    bookDna: book.bookDna,
    chapterIntention: chapter.summary,
    chapterOutline: chapter.outline,
    previousChapterSummaries,
    openingStyle: chapter.openingStyle,
    phrasesToAvoid,
  };
}

export function buildChapterPrompt(book: Book, chapter: Chapter): string {
  const context = buildChapterGenerationContext(book, chapter);
  return `SYSTEM: The GENERATION_CONTEXT below is private editorial guidance. Never quote, label, summarize, or restate it in MANUSCRIPT_CONTENT.
Return only publishable chapter prose. Do not include instructions, audience descriptions, Book DNA, metadata labels, or commentary about the writing task.
Each chapter must open with original chapter-specific prose, advance the argument, and use examples not used in another chapter.

<GENERATION_CONTEXT>
${JSON.stringify(context)}
</GENERATION_CONTEXT>

<MANUSCRIPT_REQUIREMENTS>
Chapter title: ${chapter.title}
Target word count: ${chapter.targetWordCount}; meet at least 85 percent and aim for the full target.
Use meaningful section headings, developed reasoning, transitions, evidence-aware examples, and practical application.
Do not repeat opening language, restate the book premise as filler, recycle the chapter title awkwardly in prose, or reuse prior examples.
</MANUSCRIPT_REQUIREMENTS>

Return only <MANUSCRIPT_CONTENT> prose without the wrapper tags.`;
}

const paragraphs = [
  "A useful idea becomes meaningful when a reader can recognize it in ordinary life. Begin by noticing the situation as it is, without rushing to label it a success or a failure. That pause creates room for a more honest response and turns an abstract principle into something a person can practice today.",
  "Consider a professional facing a decision with incomplete information. The familiar response is to gather more advice, add another meeting, and postpone action. A better approach is to name the desired outcome, identify the smallest responsible experiment, and decide what evidence would make the next choice clearer.",
  "The distinction matters because insight alone rarely changes behavior. Implementation needs a visible cue, a manageable action, and a moment for reflection. When those elements repeat, confidence is no longer based on wishful thinking; it grows from evidence the reader has created through deliberate practice.",
  "There will also be resistance. Old habits often appear efficient because they are familiar, even when they no longer serve the goal. Instead of fighting that resistance, treat it as information. Ask what the habit protects, what it costs, and what a gentler replacement could make possible.",
  "Put the principle to work this week. Choose one real situation, write down the current pattern, and define one action that can be completed in less than thirty minutes. Afterward, record what changed, what remained difficult, and what the experience suggests about the next step.",
  "The chapter's central lesson is simple: clarity grows through attentive action. Readers do not need a perfect plan before they begin. They need a grounded way to observe, choose, act, and learn. That repeatable loop turns uncertainty into progress while preserving the freedom to adjust.",
];

const openingLead: Record<OpeningStyle, (book: Book, chapter: Chapter) => string> = {
  scenario: (...[, chapter]) => `At ${8 + chapter.chapterNumber}:17 on a Tuesday morning, a routine decision exposes the practical tension explored here. The pressure is real, the information is incomplete, and waiting feels safer than moving.`,
  question: (_book, chapter) => `What would change if ${chapter.title.toLowerCase()} became a practiced capability rather than an idea you merely understood?`,
  direct_claim: (_book, chapter) => `${chapter.title} is not a secondary concern. It is the operating condition that determines whether insight becomes useful action.`,
  contrast: (_book, chapter) => `Most people treat ${chapter.title.toLowerCase()} as a matter of intention. In practice, it is a matter of design.`,
  observation: () => `Watch a team at the moment certainty disappears and a pattern becomes visible: familiar activity increases just as useful learning slows down.`,
  case_example: (_book, chapter) => `A growing services firm discovered the cost of ${chapter.title.toLowerCase()} only after its most carefully planned initiative stalled in plain sight.`,
  problem_statement: (_book, chapter) => `The problem is not that people lack information about ${chapter.title.toLowerCase()}. The problem is that information has not been converted into a repeatable way of working.`,
};

export function writeSampleChapter(book: Book, chapter: Chapter, existingContent = ""): string {
  const intro = `# ${chapter.title}

${openingLead[chapter.openingStyle || "observation"](book, chapter)}`;
  let content = existingContent.trim() || intro;
  let index = 0;
  while (countWords(content) < chapter.targetWordCount) {
    const baseSection = chapter.outline[index % chapter.outline.length] || "Practical application";
    const section = index < chapter.outline.length ? baseSection : `${baseSection} — Practice ${index + 1}`;
    const application = index + 1;
    const chapterContext = `Application ${application} of chapter ${chapter.chapterNumber} tests this section’s principle. Evidence ${application} frames a specific situation. Decision ${application} names the choice. Pattern ${application} records current conditions. Trial ${application} produces evidence. Reflection ${application} chooses the next move.`;
    content += `

## ${section}

${paragraphs[(index + chapter.chapterNumber) % paragraphs.length]} ${chapterContext} ${paragraphs[(index + chapter.chapterNumber + 2) % paragraphs.length]}`;
    index += 1;
  }
  const normalized = normalizeParagraphCasing(content);
  return analyzeChapterQuality({ ...chapter, content: normalized }, book.chapters).content;
}

export function generateCoverPrompt(input: Pick<Book, "title" | "subtitle" | "authorName" | "genre" | "targetAudience" | "idea" | "bookDna" | "coverDirection">): string {
  const direction = input.coverDirection?.trim() || "a clear path emerging from fog, with a subtle loop transforming into a structured roadmap";
  return `Professional book cover for “${input.title}”${input.subtitle ? `, subtitle “${input.subtitle}”` : ""}, by ${input.authorName}. ${input.genre} for ${input.targetAudience}. Visual direction: ${direction}. Themes: ${input.bookDna.themes.join(", ")}. Modern publishing aesthetic, strong hierarchy, restrained palette, sophisticated typography, light emerging through complexity. Avoid generic robots, circuit boards, cartoon styling, cheap stock-art appearance, and cluttered typography.`;
}
