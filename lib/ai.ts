import { calculateBookBudget, countWords } from "./book-budget";
import type { Book, BookForm, Chapter } from "./types";

const chapterIdeas: Record<string, string[]> = {
  Memoir: ["The Place It Began", "Before I Knew Better", "The Day Everything Shifted", "Learning to Stay", "What I Carried Forward"],
  Business: ["The Cost of the Old Way", "A Better Operating Principle", "See the System Clearly", "Put the Method to Work", "Make the Change Last"],
  "Christian Devotional": ["Begin With Stillness", "Grace for This Morning", "Faith in the Middle", "A Hope You Can Hold", "Walking Forward in Peace"],
  "Children’s Book": ["A Very Curious Morning", "The Surprise Beyond the Gate", "A Brave Little Choice", "Friends Find a Way", "Home With Something New"],
};

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
      outline: ["Open with a relatable moment", "Develop the central insight", "Add an example or case study", "Offer practical implementation", "Close with a chapter summary"],
      targetWordCount,
      actualWordCount: 0,
      estimatedPages: Math.ceil(targetWordCount / budget.wordsPerPage),
      content: "",
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
  const prior = book.chapters[chapter.chapterNumber - 2];
  const next = book.chapters[chapter.chapterNumber];
  return `Book DNA: ${JSON.stringify(book.bookDna)}. Chapter title: ${chapter.title}. Chapter summary: ${chapter.summary}. Chapter outline: ${chapter.outline.join("; ")}. Target word count: ${chapter.targetWordCount}. Prior chapter context: ${prior?.summary || "Opening chapter"}. Next chapter context: ${next?.summary || "Closing chapter"}. Required depth: complete, publication-ready treatment. Include examples or case studies and practical implementation. Write a complete chapter that meets the target word count. Do not summarize. Develop the argument fully with examples, transitions, and practical application.`;
}

const paragraphs = [
  "A useful idea becomes meaningful when a reader can recognize it in ordinary life. Begin by noticing the situation as it is, without rushing to label it a success or a failure. That pause creates room for a more honest response and turns an abstract principle into something a person can practice today.",
  "Consider a professional facing a decision with incomplete information. The familiar response is to gather more advice, add another meeting, and postpone action. A better approach is to name the desired outcome, identify the smallest responsible experiment, and decide what evidence would make the next choice clearer.",
  "The distinction matters because insight alone rarely changes behavior. Implementation needs a visible cue, a manageable action, and a moment for reflection. When those elements repeat, confidence is no longer based on wishful thinking; it grows from evidence the reader has created through deliberate practice.",
  "There will also be resistance. Old habits often appear efficient because they are familiar, even when they no longer serve the goal. Instead of fighting that resistance, treat it as information. Ask what the habit protects, what it costs, and what a gentler replacement could make possible.",
  "Put the principle to work this week. Choose one real situation, write down the current pattern, and define one action that can be completed in less than thirty minutes. Afterward, record what changed, what remained difficult, and what the experience suggests about the next step.",
  "The chapter's central lesson is simple: clarity grows through attentive action. Readers do not need a perfect plan before they begin. They need a grounded way to observe, choose, act, and learn. That repeatable loop turns uncertainty into progress while preserving the freedom to adjust.",
];

export function writeSampleChapter(book: Book, chapter: Chapter, existingContent = ""): string {
  const intro = `${chapter.title}\n\n${chapter.summary}\n\nFor readers of ${book.title}, this chapter develops the idea in a ${book.tone.toLowerCase()} voice for ${book.targetAudience.toLowerCase()}.`;
  let content = existingContent.trim() || intro;
  let index = 0;
  while (countWords(content) < chapter.targetWordCount) {
    const section = chapter.outline[index % chapter.outline.length] || `Practical application ${index + 1}`;
    content += `\n\n${section}\n\n${paragraphs[index % paragraphs.length]} ${paragraphs[(index + 2) % paragraphs.length]}`;
    index += 1;
  }
  return content;
}

export function generateCoverPrompt(input: Pick<Book, "title" | "subtitle" | "authorName" | "genre" | "targetAudience" | "idea" | "bookDna" | "coverDirection">): string {
  const direction = input.coverDirection?.trim() || "a clear path emerging from fog, with a subtle loop transforming into a structured roadmap";
  return `Professional book cover for “${input.title}”${input.subtitle ? `, subtitle “${input.subtitle}”` : ""}, by ${input.authorName}. ${input.genre} for ${input.targetAudience}. Visual direction: ${direction}. Themes: ${input.bookDna.themes.join(", ")}. Modern publishing aesthetic, strong hierarchy, restrained palette, sophisticated typography, light emerging through complexity. Avoid generic robots, circuit boards, cartoon styling, cheap stock-art appearance, and cluttered typography.`;
}
