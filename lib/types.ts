export type ChapterStatus = "pending" | "drafted" | "underdeveloped" | "expanded" | "reviewed" | "locked" | "edited" | "needs_review" | "failed_quality_review";
export type BookStatus = "idea" | "blueprint" | "drafting" | "editing" | "ready_for_export" | "exported" | "deleted";
export type QualityStatus = "clean" | "needs_review" | "prompt_leak_detected" | "duplicate_content_detected" | "underdeveloped" | "failed_quality_review" | "ready";
export type PublishingReadinessStatus = "not_ready" | "needs_cover" | "needs_content_review" | "needs_expansion" | "ready_for_export" | "exported";
export type ChapterSizePreference = "short" | "medium" | "long" | "custom" | "auto";
export type AIAssistanceLevel = "full" | "guided" | "assistive";
export type OpeningStyle = "scenario" | "question" | "direct_claim" | "contrast" | "observation" | "case_example" | "problem_statement";
export type FeedbackType = "bug" | "export_issue" | "content_quality" | "feature_request" | "general";
export type FeedbackSeverity = "low" | "medium" | "high" | "critical";
export type ExportFormat = "pdf" | "docx" | "epub";
export type ProjectType = "idea" | "nonfiction" | "fiction" | "upload" | "screenplay" | "publishing_pack" | "movie_pitch_pack";
export type CreationPathId = "start_from_idea" | "nonfiction_book" | "fiction_book" | "upload_manuscript" | "screen_adaptation" | "publishing_pack" | "movie_pitch_pack";
export interface CreationPath { id: CreationPathId; projectType: ProjectType; label: string; description: string; accent: string; }

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
  partTitle?: string;
  thesis?: string;
  objective?: string;
  exampleBank?: string[];
  readerTakeaway?: string;
  openingStyle: OpeningStyle;
  content: string;
  generationContext?: ChapterGenerationContext;
  targetWordCount: number;
  actualWordCount: number;
  cleanWordCount?: number;
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
  projectType?: ProjectType;
  sourceProjectId?: string;
  publishingReadinessScore?: number;
  coverQualityScore?: number;
  coverStatus?: "missing" | "concept_ready" | "prompt_ready" | "placeholder_ready" | "uploaded" | "generated" | "approved" | "failed_quality";
  originalManuscript?: string;
  manuscriptAnalysis?: Record<string, unknown>;
  adaptationAssets?: { logline: string; synopsis: string; beatSheet: string[]; sceneBreakdown: string[]; };
  fictionAssets?: { storyBible: string; characterBible: string; worldBible: string; sceneCards: string[]; };
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
  coverConcept?: string;
  useDesignedCover?: boolean;
  exportCoverWithBook?: boolean;
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
  projectType?: ProjectType;
  sourceText?: string;
  sourceUrl?: string;
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
  rawWords: number;
  cleanWords: number;
  cleanLengthAccuracyPercent: number;
  duplicateParagraphRate: number;
  repetitionRisk: "low" | "medium" | "high";
  promptLeakageDetected: boolean;
  scaffoldLeakageDetected: boolean;
  coverStatus: "missing" | "uploaded" | "designed_placeholder";
  pdfReady: boolean;
  docxReady: boolean;
  readinessStatus: PublishingReadinessStatus;
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
