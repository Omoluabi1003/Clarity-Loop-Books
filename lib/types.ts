export type ChapterStatus = "pending" | "drafted" | "underdeveloped" | "expanded" | "edited" | "locked";
export type BookStatus = "idea" | "blueprint" | "drafting" | "editing" | "ready_for_export" | "exported";
export type ChapterSizePreference = "short" | "medium" | "long" | "custom" | "auto";
export type AIAssistanceLevel = "full" | "guided" | "assistive";

export interface BookDNA {
  promise: string;
  tone: string;
  audience: string;
  readingLevel: string;
  voice: string;
  themes: string[];
  styleRules: string[];
}

export interface Chapter {
  id: string;
  bookId?: string;
  chapterNumber: number;
  title: string;
  summary: string;
  outline: string[];
  content: string;
  targetWordCount: number;
  actualWordCount: number;
  estimatedPages: number;
  status: ChapterStatus;
  locked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Book {
  id: string;
  userId?: string;
  title: string;
  subtitle: string;
  authorName: string;
  authorBio: string;
  authorEmail?: string;
  authorWebsite?: string;
  publisherCredit?: string;
  idea: string;
  genre: string;
  targetAudience: string;
  tone: string;
  writingStyle: string;
  chapterCount: number;
  targetPageCount: number;
  wordsPerPage: number;
  targetWords: number;
  averageWordsPerChapter: number;
  actualWords: number;
  actualEstimatedPages: number;
  chapterSizePreference: ChapterSizePreference;
  aiAssistanceLevel: AIAssistanceLevel;
  bookDna: BookDNA;
  coverDirection?: string;
  coverPrompt: string;
  coverImageUrl?: string;
  status: BookStatus;
  progress: number;
  updatedAt: string;
  createdAt?: string;
  color: string;
  chapters: Chapter[];
  versionHistory?: string[];
}

export interface BookForm {
  title: string;
  subtitle: string;
  authorName: string;
  authorBio: string;
  authorEmail: string;
  authorWebsite: string;
  publisherCredit: string;
  idea: string;
  genre: string;
  targetAudience: string;
  tone: string;
  writingStyle: string;
  chapterCount: number;
  targetPageCount: number;
  wordsPerPage: number;
  chapterSizePreference: ChapterSizePreference;
  customChapterWords: number;
  aiAssistanceLevel: AIAssistanceLevel;
  coverDirection: string;
}

export interface BookTemplate {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  icon: string;
  genre: string;
  targetAudience: string;
  tone: string;
  writingStyle: string;
  chapterCount: number;
  targetPageCount: number;
}

export interface PublishingReadiness {
  targetPages: number;
  actualEstimatedPages: number;
  targetWords: number;
  actualWords: number;
  chapterCount: number;
  completedChapters: number;
  lengthAccuracyPercent: number;
  bookDnaConsistencyScore: number;
  exportReadinessStatus: "blocked" | "warning" | "ready";
  blockers: string[];
}
