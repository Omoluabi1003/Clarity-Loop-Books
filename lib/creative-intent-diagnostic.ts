import { buildBookDna } from "./book-dna";
import { getGenreProfile } from "./genre-intelligence";
import type { BookDNA, BookForm, ConfirmedCreativeIntent, CreativeIntentReport } from "./types";

const signals: Array<[RegExp, string]> = [
  [/life story|born|childhood|legacy|biograph/i, "Biography"], [/my story|my life|memoir|remember/i, "Memoir"], [/character|novel|fantasy|murder|romance|story world/i, "Fiction"], [/faith|god|grace|prayer|scripture|calling/i, "Faith & Spiritual Growth"], [/workbook|exercise|training|worksheet|curriculum/i, "Workbook / Training Manual"], [/screenplay|film|episode|adaptation|cinematic/i, "Screenplay / Adaptation"], [/leader|team|culture|executive/i, "Leadership"], [/business|strategy|professional|organization|client/i, "Business & Professional Development"],
];

function detectBookType(form: BookForm): string {
  const source = `${form.title} ${form.subtitle} ${form.idea} ${form.writingStyle}`;
  return signals.find(([pattern]) => pattern.test(source))?.[1] || form.genre;
}

export function detectIntentMismatch(form: BookForm, bookDna: BookDNA): string[] {
  const detected = detectBookType(form);
  if (getGenreProfile(detected).genreId === getGenreProfile(bookDna.bookType || form.genre).genreId) return [];
  return [`Your topic contains signals associated with ${detected}, while you selected ${form.genre}. We will keep ${form.genre} authoritative unless you change it.`];
}

export function recommendGenreCorrection(form: BookForm, bookDna: BookDNA): string | undefined {
  const warnings = detectIntentMismatch(form, bookDna);
  return warnings.length ? `Consider ${detectBookType(form)} only if that better reflects the book you intend to write.` : undefined;
}

export function generateBookIdentityReport(form: BookForm, bookDna: BookDNA): CreativeIntentReport {
  const profile = bookDna.genreProfile || getGenreProfile(form.genre);
  const warnings = detectIntentMismatch(form, bookDna);
  const recommendation = recommendGenreCorrection(form, bookDna);
  const specificity = [form.title, form.idea, form.targetAudience, form.tone, form.writingStyle].filter((value) => value?.trim()).length;
  return {
    selectedBookType: form.genre,
    detectedBookType: detectBookType(form),
    detectedCreativeMode: bookDna.creativeMode || profile.creativeMode,
    readerExperience: bookDna.readerExperience || profile.readerExpectation,
    narrativeMode: bookDna.narrativeMode || profile.narrativeStructure,
    emotionalPromise: bookDna.corePromise || bookDna.promise,
    structuralRecommendation: profile.narrativeStructure,
    chapterNamingStyle: profile.preferredChapterPatterns.join(" → "),
    contentToAvoid: profile.forbiddenPatterns,
    generationConfidence: Math.min(96, 58 + specificity * 7 - warnings.length * 8),
    warnings,
    recommendedAdjustments: recommendation ? [recommendation] : [],
  };
}

export function diagnoseCreativeIntent(form: BookForm): CreativeIntentReport {
  return generateBookIdentityReport(form, buildBookDna(form));
}

export function buildConfirmedCreativeIntent(form: BookForm, userAdjustments: Partial<ConfirmedCreativeIntent> = {}): ConfirmedCreativeIntent {
  const report = diagnoseCreativeIntent(form);
  return {
    bookType: userAdjustments.bookType || report.selectedBookType,
    tone: userAdjustments.tone || form.tone,
    narrativeMode: userAdjustments.narrativeMode || report.narrativeMode,
    readerExperience: userAdjustments.readerExperience || report.readerExperience,
    emotionalPromise: userAdjustments.emotionalPromise || report.emotionalPromise,
    chapterNamingStyle: userAdjustments.chapterNamingStyle || report.chapterNamingStyle,
    confirmedAt: userAdjustments.confirmedAt || new Date().toISOString(),
    skipped: userAdjustments.skipped || false,
  };
}
