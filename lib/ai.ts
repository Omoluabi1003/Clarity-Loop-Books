import type { BookForm, Chapter } from "./types";

const chapterIdeas: Record<string, string[]> = {
  Memoir: ["The Place It Began", "Before I Knew Better", "The Day Everything Shifted", "Learning to Stay", "What I Carried Forward"],
  Business: ["The Old Way Is Costing Us", "A Better Operating Principle", "See the System Clearly", "Put the Method to Work", "Make the Change Last"],
  "Christian Devotional": ["Begin With Stillness", "Grace for This Morning", "Faith in the Middle", "A Hope You Can Hold", "Walking Forward in Peace"],
  "Children’s Book": ["A Very Curious Morning", "The Surprise Beyond the Gate", "A Brave Little Choice", "Friends Find a Way", "Home With Something New"],
};

export function buildBlueprint(form: BookForm): Chapter[] {
  const ideas = chapterIdeas[form.genre] ?? ["Where You Are Now", "What Keeps You Stuck", "A New Way to See It", "The First Brave Step", "Building a Lasting Practice"];
  const totalWords = form.bookLength.startsWith("Short") ? 15000 : form.bookLength.startsWith("Long") ? 50000 : 30000;
  return Array.from({ length: form.chapterCount }, (_, index) => {
    const title = ideas[index] ?? `${index < form.chapterCount - 1 ? "Building the Practice" : "The Way Forward"} ${index + 1}`;
    return {
      id: `chapter-${Date.now()}-${index}`,
      chapterNumber: index + 1,
      title,
      summary: `Guide ${form.audience.toLowerCase()} through ${title.toLowerCase()} with a clear idea, a relatable example, and a practical next step.`,
      targetWordCount: Math.round(totalWords / form.chapterCount / 100) * 100,
      content: "",
      status: "Ready to write",
      locked: false,
    };
  });
}

export function writeSampleChapter(bookTitle: string, chapter: Chapter, tone: string, audience: string): string {
  return `Every meaningful change begins before anyone else can see it. It begins in the quiet moment when you decide to pay attention.\n\nIn ${bookTitle}, this is where our work becomes practical. ${chapter.summary} The aim is not to rush toward a perfect answer. It is to create enough room to notice what is true, what matters, and what can happen next.\n\nImagine a reader who has tried to solve this by working harder. They have collected advice, made lists, and promised themselves that next week will be different. What they need is not more pressure. They need a simple way to move.\n\nStart here: pause, name the one thing that feels most important, and choose an action small enough to complete today. This ${tone.toLowerCase()} approach gives ${audience.toLowerCase()} evidence that forward motion is possible.\n\n### A moment to reflect\n\nWhat would become easier if you stopped asking for the whole answer and looked only for the next honest step?`;
}
