export type ChapterStatus = "pending" | "drafted" | "edited" | "locked";
export type BookStatus = "draft" | "in_progress" | "completed" | "exported";
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
  idea: string;
  genre: string;
  targetAudience: string;
  tone: string;
  writingStyle: string;
  chapterCount: number;
  targetPageCount: number;
  chapterSizePreference: ChapterSizePreference;
  aiAssistanceLevel: AIAssistanceLevel;
  bookDna: BookDNA;
  status: BookStatus;
  progress: number;
  updatedAt: string;
  createdAt?: string;
  color: string;
  chapters: Chapter[];
}

export interface BookForm {
  title: string;
  subtitle: string;
  idea: string;
  genre: string;
  targetAudience: string;
  tone: string;
  writingStyle: string;
  chapterCount: number;
  targetPageCount: number;
  chapterSizePreference: ChapterSizePreference;
  customChapterWords: number;
  aiAssistanceLevel: AIAssistanceLevel;
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
