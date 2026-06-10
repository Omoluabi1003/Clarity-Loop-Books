export type ChapterStatus = "pending" | "drafted" | "underdeveloped" | "expanded" | "reviewed" | "locked" | "edited" | "needs_review";
export type BookStatus = "idea" | "blueprint" | "drafting" | "editing" | "ready_for_export" | "exported" | "deleted";
export type QualityStatus = "clean" | "needs_review" | "prompt_leak_detected" | "duplicate_content_detected" | "underdeveloped" | "ready";
export type ChapterSizePreference = "short" | "medium" | "long" | "custom" | "auto";
export type AIAssistanceLevel = "full" | "guided" | "assistive";
export type OpeningStyle = "scenario" | "question" | "direct_claim" | "contrast" | "observation" | "case_example" | "problem_statement";
export type FeedbackType = "bug" | "export_issue" | "content_quality" | "feature_request" | "general";
export type FeedbackSeverity = "low" | "medium" | "high" | "critical";
export type ExportFormat = "pdf" | "docx" | "epub";

export interface BookDNA {
  promise: string;
  tone: string;
  audience: string;
  readingLevel: string;
  voice: string;
  themes: string[];
  styleRules: string[];
  thesis?: string;
}

export interface ChapterGenerationContext {
  bookThesis: string;
  audienceProfile: string;
  tone: string;
  writingStyle: string;
  bookDna: BookDNA;
  chapterIntention: string;
  chapterOutline: string[];
  previousChapterSummaries: string[];
  openingStyle: OpeningStyle;
  phrasesToAvoid: string[];
}

export interface Chapter {
  id: string;
  bookId?: string;
  chapterNumber: number;
  title: string;
  summary: string;
  outline: string[];
  openingStyle: OpeningStyle;
  content: string;
  generationContext?: ChapterGenerationContext;
  targetWordCount: number;
  actualWordCount: number;
  estimatedPages: number;
  qualityFlags: string[];
  qualityScore?: number;
  qualityStatus?: QualityStatus;
  leakageDetected?: boolean;
  duplicateDetected?: boolean;
  status: ChapterStatus;
  locked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExportJob {
  id: string;
  bookId: string;
  format: ExportFormat;
  status: "pending" | "processing" | "completed" | "failed";
  fileUrl: string;
  errorMessage: string;
  createdAt: string;
}

export interface BetaFeedback {
  id: string;
  bookId: string;
  type: FeedbackType;
  message: string;
  severity: FeedbackSeverity;
  createdAt: string;
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
  copyrightPage?: string;
  closingNotes?: string;
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
  qualityScore: number;
  qualityFlags?: string[];
  deletedAt?: string | null;
  status: BookStatus;
  progress: number;
  updatedAt: string;
  createdAt?: string;
  color: string;
  chapters: Chapter[];
  versionHistory?: string[];
  exportHistory?: ExportJob[];
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
  missingChapterNumbers: number[];
  lengthAccuracyPercent: number;
  bookDnaConsistencyScore: number;
  qualityScore: number;
  exportReadinessStatus: "blocked" | "warning" | "ready";
  blockers: string[];
  warnings: string[];
}

export interface SavedStudioState {
  schemaVersion: 4;
  books: Book[];
  feedback: BetaFeedback[];
  savedAt: string;
}
