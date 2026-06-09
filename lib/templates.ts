import type { Book, BookTemplate } from "./types";

export const templates: BookTemplate[] = [
  { id: "self-help", name: "Self-Help", eyebrow: "Create transformation", description: "Turn your framework into a practical, encouraging reader journey.", icon: "Compass", genre: "Self-Help", targetAudience: "Readers ready to make a meaningful personal change", tone: "Encouraging and clear", writingStyle: "Practical and story-led", chapterCount: 10, targetPageCount: 180 },
  { id: "devotional", name: "Christian Devotional", eyebrow: "Faith & reflection", description: "Create thoughtful readings with reflection, application, and prayer.", icon: "Heart", genre: "Christian Devotional", targetAudience: "Readers seeking daily spiritual encouragement", tone: "Warm and hopeful", writingStyle: "Reflective and accessible", chapterCount: 14, targetPageCount: 120 },
  { id: "memoir", name: "Memoir", eyebrow: "Tell your story", description: "Shape lived experiences into an honest, memorable narrative.", icon: "Feather", genre: "Memoir", targetAudience: "Readers who connect through honest life stories", tone: "Personal and honest", writingStyle: "Narrative and vivid", chapterCount: 12, targetPageCount: 220 },
  { id: "business", name: "Business Book", eyebrow: "Build authority", description: "Share your method, point of view, and lessons with clarity.", icon: "BriefcaseBusiness", genre: "Business", targetAudience: "Leaders, founders, and working professionals", tone: "Confident and clear", writingStyle: "Insightful and example-driven", chapterCount: 10, targetPageCount: 200 },
  { id: "biography", name: "Biography", eyebrow: "A life in full", description: "Tell a compelling life story with context, milestones, and meaning.", icon: "UserRound", genre: "Biography", targetAudience: "General readers interested in an inspiring life", tone: "Thoughtful and authoritative", writingStyle: "Chronological and cinematic", chapterCount: 12, targetPageCount: 250 },
  { id: "children", name: "Children’s Book", eyebrow: "Big imagination", description: "Build a playful story around a simple, memorable lesson.", icon: "Rainbow", genre: "Children’s Book", targetAudience: "Children ages 6–9 and their caregivers", tone: "Playful and kind", writingStyle: "Simple and visual", chapterCount: 8, targetPageCount: 48 },
];

export const sampleBooks: Book[] = [
  {
    id: "clear-way-forward",
    title: "The Clear Way Forward",
    subtitle: "A practical guide to making confident decisions",
    idea: "A calm, practical guide that helps overwhelmed readers move from indecision to one clear next step.",
    genre: "Self-Help",
    targetAudience: "Busy professionals who feel stuck or overwhelmed",
    tone: "Encouraging and clear",
    writingStyle: "Practical and story-led",
    chapterCount: 8,
    targetPageCount: 180,
    chapterSizePreference: "medium",
    aiAssistanceLevel: "guided",
    status: "in_progress",
    progress: 38,
    updatedAt: "Updated recently",
    color: "midnight",
    bookDna: {
      promise: "Help readers quiet the noise, trust their judgment, and take the next honest step.",
      tone: "Encouraging, calm, and quietly confident",
      audience: "Busy professionals who feel stuck or overwhelmed",
      readingLevel: "Clear and conversational",
      voice: "A trusted guide sitting across the table",
      themes: ["clarity", "courage", "small steps", "self-trust"],
      styleRules: ["Use relatable examples", "Avoid jargon", "End with a useful reflection"],
    },
    chapters: [
      { id: "c1", bookId: "clear-way-forward", chapterNumber: 1, title: "When the Path Feels Foggy", summary: "Name the emotional cost of uncertainty and show why clarity is a practice.", outline: ["The hidden weight of open decisions", "Why certainty is the wrong goal", "A gentler definition of clarity"], targetWordCount: 2400, estimatedPages: 9, content: "There is a particular kind of tiredness that comes from carrying a decision you have not made. It follows you from room to room, quietly asking for attention.\n\nMost of us assume clarity arrives like a flash of light. In practice, it is more often built through a series of small, honest questions. The goal is not to see the entire road. It is to see enough of the next step to begin.", status: "locked", locked: true },
      { id: "c2", bookId: "clear-way-forward", chapterNumber: 2, title: "The Noise Around the Decision", summary: "Separate personal priorities from outside expectations, urgency, and fear.", outline: ["Recognize borrowed urgency", "Separate advice from alignment", "Create a quiet decision space"], targetWordCount: 2600, estimatedPages: 10, content: "", status: "pending", locked: false },
      { id: "c3", bookId: "clear-way-forward", chapterNumber: 3, title: "Name What Matters Most", summary: "Use a simple values filter to narrow choices without overthinking.", outline: ["Find the real question", "Choose three guiding values", "Test the options"], targetWordCount: 2500, estimatedPages: 10, content: "", status: "pending", locked: false },
      { id: "c4", bookId: "clear-way-forward", chapterNumber: 4, title: "Make the Smallest Honest Move", summary: "Turn insight into a low-risk next step readers can use immediately.", outline: ["Shrink the decision", "Design a useful experiment", "Notice what action teaches"], targetWordCount: 2500, estimatedPages: 10, content: "", status: "pending", locked: false },
      { id: "c5", bookId: "clear-way-forward", chapterNumber: 5, title: "Trust the Evidence You Create", summary: "Show how action rebuilds trust in personal judgment.", outline: ["Build evidence through action", "Read outcomes without shame", "Strengthen self-trust"], targetWordCount: 2500, estimatedPages: 10, content: "", status: "pending", locked: false },
      { id: "c6", bookId: "clear-way-forward", chapterNumber: 6, title: "When the Plan Changes", summary: "Help readers adapt without treating change as failure.", outline: ["Expect new information", "Release the perfect plan", "Adjust with intention"], targetWordCount: 2400, estimatedPages: 9, content: "", status: "pending", locked: false },
      { id: "c7", bookId: "clear-way-forward", chapterNumber: 7, title: "Build a Clarity Practice", summary: "Turn the framework into a repeatable weekly rhythm.", outline: ["Create a weekly reset", "Keep decisions visible", "Protect thinking time"], targetWordCount: 2500, estimatedPages: 10, content: "", status: "pending", locked: false },
      { id: "c8", bookId: "clear-way-forward", chapterNumber: 8, title: "The Way Forward Is Made", summary: "Close with confidence, momentum, and an invitation to begin.", outline: ["Gather what changed", "Name the next season", "Make the next honest move"], targetWordCount: 2200, estimatedPages: 8, content: "", status: "pending", locked: false },
    ],
  },
];
