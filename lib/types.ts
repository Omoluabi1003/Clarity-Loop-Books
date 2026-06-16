export type ChapterStatus = "pending" | "drafted" | "underdeveloped" | "expanded" | "reviewed" | "locked" | "edited" | "needs_review" | "failed_quality_review";
export type BookStatus = "idea" | "blueprint" | "drafting" | "editing" | "ready_for_export" | "exported" | "deleted";
export type QualityStatus = "clean" | "needs_review" | "prompt_leak_detected" | "duplicate_content_detected" | "underdeveloped" | "failed_quality_review" | "ready";
export type PublishingReadinessStatus = "not_ready" | "needs_cover" | "needs_content_review" | "needs_expansion" | "ready_for_export" | "exported";
export type ChapterSizePreference = "short" | "medium" | "long" | "custom" | "auto";
export type AIAssistanceLevel = "full" | "guided" | "assistive";
export type OpeningStyle = "scenario" | "question" | "direct_claim" | "contrast" | "observation" | "case_example" | "problem_statement";
export type TitleQuality = "Strong" | "Needs work" | "Generic";
export type FeedbackType = "bug" | "export_issue" | "content_quality" | "feature_request" | "general";
export type FeedbackSeverity = "low" | "medium" | "high" | "critical";
export type ExportFormat = "pdf" | "docx" | "epub";
export type ProjectType = "idea" | "nonfiction" | "fiction" | "upload" | "screenplay" | "publishing_pack" | "movie_pitch_pack";
export type CreationPathId = "start_from_idea" | "nonfiction_book" | "fiction_book" | "upload_manuscript" | "screen_adaptation" | "publishing_pack" | "movie_pitch_pack";
export interface CreationPath { id: CreationPathId; projectType: ProjectType; label: string; description: string; accent: string; }


export interface GenreProfile {
  genreId: string;
  label: string;
  creativeMode: string;
  readerExpectation: string;
  narrativeStructure: string;
  requiredElements: string[];
  forbiddenPatterns: string[];
  preferredChapterPatterns: string[];
  toneGuidance: string;
  openingStyles: OpeningStyle[];
  exampleTypes: string[];
  chapterPurposeStyle: string;
  coverMoodHints: string[];
}

export interface ConfirmedCreativeIntent {
  bookType: string;
  tone: string;
  narrativeMode: string;
  readerExperience: string;
  emotionalPromise: string;
  chapterNamingStyle: string;
  confirmedAt?: string;
  skipped?: boolean;
}

export interface CreativeIntentReport {
  selectedBookType: string;
  detectedBookType: string;
  detectedCreativeMode: string;
  readerExperience: string;
  narrativeMode: string;
  emotionalPromise: string;
  structuralRecommendation: string;
  chapterNamingStyle: string;
  contentToAvoid: string[];
  generationConfidence: number;
  warnings: string[];
  recommendedAdjustments: string[];
}

export interface ChapterTitleOption {
  title: string;
  subtitle: string;
  rationale: string;
  tone: string;
  chapterPromise: string;
  suggestedOpeningStyle: OpeningStyle;
  emotionalDirection: string;
  keywords: string[];
  genreFitScore: number;
}

export interface ChapterTitleContext {
  title: string;
  creativeAnchor: string;
  chapterPromise: string;
  suggestedOpeningStyle: OpeningStyle;
  emotionalDirection: string;
  tone: string;
  keywords: string[];
  genreFitScore: number;
}

export interface BookDNA {
  promise: string;
  tone: string;
  audience: string;
  readingLevel: string;
  voice: string;
  themes: string[];
  styleRules: string[];
  thesis?: string;
  bookType?: string;
  genreProfile?: GenreProfile;
  corePromise?: string;
  readerExperience?: string;
  narrativeMode?: string;
  creativeMode?: string;
  requiredElements?: string[];
  forbiddenPatterns?: string[];
  toneGuidance?: string;
  chapterStructureHint?: string;
  openingStyleOptions?: OpeningStyle[];
  uniqueCreativeInstructions?: string[];
  confirmedCreativeIntent?: ConfirmedCreativeIntent;
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
  selectedTitle?: string;
  titleContext?: ChapterTitleContext;
  genreProfile?: GenreProfile;
}

export interface Chapter {
  id: string;
  bookId?: string;
  chapterNumber: number;
  title: string;
  selectedTitle?: string;
  titleOptions?: ChapterTitleOption[];
  titleLocked?: boolean;
  titleContext?: ChapterTitleContext;
  chapterPromise?: string;
  suggestedOpeningStyle?: OpeningStyle;
  emotionalDirection?: string;
  titleQuality?: TitleQuality;
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

export type AuthorSuccessStatus = "not_started" | "analyzing" | "draft_ready" | "needs_review" | "ready" | "exported";
export type AuthorSuccessTier = "free_preview" | "creator" | "author_pro" | "studio" | "agency_enterprise" | "paid_pending";

export interface ReaderAvatar { name: string; ageRange: string; professionOrLifeStage: string; currentProblem: string; desiredOutcome: string; emotionalState: string; buyingTrigger: string; objection: string; preferredPlatform: string; }
export interface MarketabilityReport { marketabilityScore: number; audienceClarityScore: number; titleStrengthScore: number; subtitleStrengthScore: number; coverStrengthScore: number; positioningScore: number; readerPromiseScore: number; categoryFitScore: number; salesReadinessScore: number; topWeaknesses: string[]; topRecommendations: string[]; }
export interface ReaderDNA { primaryReaderAvatar: ReaderAvatar; secondaryReaderAvatar: ReaderAvatar; readerPainPoints: string[]; readerGoals: string[]; readerBuyingTriggers: string[]; readerObjections: string[]; readerTransformationPromise: string; whereReadersCanBeFound: string[]; languageReadersUse: string[]; }
export interface BookPositioning { positioningStatement: string; uniqueSellingProposition: string; readerPromise: string; competitiveAngle: string; categoryRecommendations: string[]; keywordThemes: string[]; backCoverHook: string; oneSentencePitch: string; thirtySecondPitch: string; }
export interface PublishingPackage { amazonDescription: string; barnesAndNobleDescription: string; backCoverCopy: string; shortBookDescription: string; longBookDescription: string; authorBioShort: string; authorBioLong: string; keywords: string[]; categories: string[]; bookMetadata: Record<string, string>; disclaimerSuggestions: string[]; }
export interface LaunchPackage { launchReadinessScore: number; launchChecklist: string[]; thirtyDayLaunchPlan: string[]; sixtyDayLaunchPlan: string[]; ninetyDayLaunchPlan: string[]; arcReaderStrategy: string; reviewRequestPlan: string[]; influencerOutreachPlan: string[]; launchEmailSequence: string[]; launchDayChecklist: string[]; }
export interface MarketingPackage { linkedInPosts: string[]; facebookPosts: string[]; xPosts: string[]; threadsPosts: string[]; instagramCaptions: string[]; tikTokVideoIdeas: string[]; youtubeShortsIdeas: string[]; podcastPitchEmail: string; pressRelease: string; bookTrailerScript: string; }
export interface ReviewAcquisitionPlan { arcInvitationMessage: string; reviewRequestEmail: string; reviewFollowUpEmail: string; launchTeamMessage: string; readerThankYouMessage: string; reviewTrackingChecklist: string[]; }
export interface MonetizationPackage { workshopOutline: string[]; courseOutline: string[]; webinarOutline: string[]; keynoteTopics: string[]; speakerOneSheetCopy: string; consultingOffer: string; leadMagnetIdeas: string[]; emailNurtureSequence: string[]; coachingPackageIdeas: string[]; corporateTrainingAngle: string; }
export interface AuthorSuccessBlueprint { authorSuccessScore: number; bookBusinessSummary: string; recommendedAudience: string; recommendedPositioning: string; recommendedLaunchStrategy: string; recommendedMarketingChannels: string[]; recommendedRevenuePaths: string[]; firstSevenDaysActionPlan: string[]; nextThirtyDaysActionPlan: string[]; nextNinetyDaysActionPlan: string[]; }
export interface AuthorSuccessAsset { id: string; type: "marketability" | "market_intelligence" | "reader_dna" | "positioning" | "publishing" | "launch" | "marketing" | "reviews" | "monetization" | "blueprint"; title: string; status: "preview" | "ready" | "locked"; generatedAt: string; }
export interface AuthorSuccessPlan { marketability: MarketabilityReport; readerDNA: ReaderDNA; positioning: BookPositioning; publishing: PublishingPackage; launch: LaunchPackage; marketing: MarketingPackage; reviews: ReviewAcquisitionPlan; monetization: MonetizationPackage; blueprint: AuthorSuccessBlueprint; disclaimer: string; }

export interface Book {
  id: string;
  projectType?: ProjectType;
  sourceProjectId?: string;
  publishingReadinessScore?: number;
  authorSuccessStatus?: AuthorSuccessStatus;
  marketabilityScore?: number;
  launchReadinessScore?: number;
  authorSuccessAssets?: AuthorSuccessAsset[];
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
  confirmedCreativeIntent?: ConfirmedCreativeIntent;
  creativeIntentReport?: CreativeIntentReport;
  genreAlignmentScore?: number;
  genreWarnings?: string[];
  coverDirection?: string;
  coverPrompt: string;
  coverImageUrl?: string;
  coverConcept?: string;
  useDesignedCover?: boolean;
  exportCoverWithBook?: boolean;
  qualityScore: number;
  qualityFlags?: string[];
  deletedAt?: string | null;
  archivedAt?: string | null;
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
  confirmedCreativeIntent?: ConfirmedCreativeIntent;
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

export type MarketConfidenceLevel = "verified" | "high_confidence" | "estimated" | "low_confidence";
export type MarketSourceType = "official_api" | "licensed_feed" | "user_upload" | "partner_integration" | "public_page";
export interface MarketTimeWindowSignal { window: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"; rankVelocity: number; reviewVelocity: number; categoryMomentum: number; campaignLift: number; confidenceScore: number; }
export interface MarketSourceAdapterSummary { name: string; sourceType: MarketSourceType; permission: "permitted" | "verified" | "licensed" | "terms_review_required"; auditRequirement: string; }
export interface MarketScoreMetrics { rankVelocity: number; reviewVelocity: number; categoryMomentum: number; priceElasticitySignal: number; campaignLift: number; publisherLiftScore: number; marketerLiftScore: number; salesConfidenceScore: number; engagementRecommendationScore: number; }
export interface MarketScorecard { name: string; score: number; evidence: string[]; confidence: MarketConfidenceLevel; }
export interface MarketIntelligencePlan { marketScore: number; confidenceLevel: MarketConfidenceLevel; salesConfidenceScore: number; formulaSummary: string; disclaimer: string; timeWindows: MarketTimeWindowSignal[]; metrics: MarketScoreMetrics; sourceArchitecture: MarketSourceAdapterSummary[]; dashboardModules: string[]; publisherScorecard: MarketScorecard; marketingPartnerScorecard: MarketScorecard; recommendations: string[]; }
