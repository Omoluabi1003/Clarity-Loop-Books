import { calculateBookBudget, countWords } from "./book-budget";
import { analyzeChapterQuality, normalizeParagraphCasing } from "./quality";
import type { Book, BookForm, Chapter, OpeningStyle } from "./types";

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

export function buildChapterPrompt(book: Book, chapter: Chapter): string {
  const previousSummaries = book.chapters
    .filter((candidate) => candidate.chapterNumber < chapter.chapterNumber)
    .sort((a, b) => a.chapterNumber - b.chapterNumber)
    .map((candidate) => `Chapter ${candidate.chapterNumber}: ${candidate.summary}`);
  const phrasesToAvoid = book.chapters
    .filter((candidate) => candidate.chapterNumber !== chapter.chapterNumber && candidate.content)
    .map((candidate) => candidate.content.split(/\s+/).slice(0, 12).join(" "));
  return `Write a complete professional nonfiction chapter, not a summary or short draft.
Book thesis: ${book.bookDna.thesis || book.idea}.
Book DNA: ${JSON.stringify(book.bookDna)}.
Chapter purpose: ${chapter.summary}.
Chapter title: ${chapter.title}.
Chapter outline: ${chapter.outline.join("; ")}.
Chapter target word count: ${chapter.targetWordCount}; meet at least 85 percent and aim for the full target.
Assigned opening style: ${chapter.openingStyle}.
Previous chapter summaries: ${previousSummaries.join(" | ") || "This is the opening chapter."}.
Phrases and examples to avoid repeating: ${phrasesToAvoid.join(" | ") || "None yet."}.
Required original examples: introduce at least one chapter-specific scenario, case example, or application not used elsewhere.
Professional nonfiction structure: use meaningful section headings, developed reasoning, transitions, evidence-aware examples, and practical application.
Do not repeat opening language, restate the book premise as filler, or recycle examples from earlier chapters.`;
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
  scenario: (book, chapter) => `Chapter ${chapter.chapterNumber} begins with a ${book.targetAudience.toLowerCase()} confronting the exact decision at the heart of ${chapter.title}. The pressure is real, the information is incomplete, and waiting feels safer than moving.`,
  question: (_book, chapter) => `What would change if ${chapter.title.toLowerCase()} became a practiced capability rather than an idea you merely understood?`,
  direct_claim: (_book, chapter) => `${chapter.title} is not a secondary concern. It is the operating condition that determines whether insight becomes useful action.`,
  contrast: (_book, chapter) => `Most people treat ${chapter.title.toLowerCase()} as a matter of intention. In practice, it is a matter of design.`,
  observation: () => `Watch a team at the moment certainty disappears and a pattern becomes visible: familiar activity increases just as useful learning slows down.`,
  case_example: (_book, chapter) => `A growing services firm discovered the cost of ${chapter.title.toLowerCase()} only after its most carefully planned initiative stalled in plain sight.`,
  problem_statement: (_book, chapter) => `The problem is not that people lack information about ${chapter.title.toLowerCase()}. The problem is that information has not been converted into a repeatable way of working.`,
};

export function writeSampleChapter(book: Book, chapter: Chapter, existingContent = ""): string {
  const intro = `# ${chapter.title}

${openingLead[chapter.openingStyle || "observation"](book, chapter)}

${chapter.summary}`;
  let content = existingContent.trim() || intro;
  let index = 0;
  while (countWords(content) < chapter.targetWordCount) {
    const baseSection = chapter.outline[index % chapter.outline.length] || "Practical application";
    const section = index < chapter.outline.length ? baseSection : `${baseSection} — Practice ${index + 1}`;
    const chapterContext = `Application ${index + 1} in chapter ${chapter.chapterNumber} advances this principle ${book.bookDna.thesis || book.idea}. Test it through a chapter-specific application: define the decision, observe the current pattern, run a bounded experiment, and record what the evidence changes.`;
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
