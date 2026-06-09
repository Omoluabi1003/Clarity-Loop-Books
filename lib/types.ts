export type ChapterStatus = "Not started" | "Ready to write" | "Draft ready" | "Needs review";

export interface BookDNA {
  tone: string;
  audience: string;
  readingLevel: string;
  voice: string;
  themes: string[];
  styleRules: string[];
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  summary: string;
  targetWordCount: number;
  content: string;
  status: ChapterStatus;
  locked: boolean;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  genre: string;
  audience: string;
  tone: string;
  writingStyle: string;
  bookLength: string;
  status: "Planning" | "Writing" | "Complete";
  autoMode: boolean;
  progress: number;
  updatedAt: string;
  color: string;
  bookDNA: BookDNA;
  chapters: Chapter[];
}

export interface BookForm {
  title: string;
  subtitle: string;
  genre: string;
  audience: string;
  tone: string;
  writingStyle: string;
  bookLength: string;
  chapterCount: number;
  autoMode: boolean;
}

export interface BookTemplate {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  icon: string;
  color: string;
  genre: string;
  audience: string;
  tone: string;
  writingStyle: string;
  chapterCount: number;
  length: string;
}
