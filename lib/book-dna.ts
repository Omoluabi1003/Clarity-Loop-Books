import { getGenreProfile } from "./genre-intelligence";
import type { BookDNA, BookForm } from "./types";

export function buildBookDna(form: BookForm, confirmedCreativeIntent = form.confirmedCreativeIntent): BookDNA {
  const authoritativeType = confirmedCreativeIntent?.bookType || form.genre;
  const genreProfile = getGenreProfile(authoritativeType);
  const corePromise = confirmedCreativeIntent?.emotionalPromise || `Give ${form.targetAudience} a meaningful, genre-appropriate experience centered on ${form.idea.split(/\n|[.!?]/)[0].trim() || form.title}.`;
  return {
    promise: corePromise,
    corePromise,
    tone: confirmedCreativeIntent?.tone || form.tone,
    audience: form.targetAudience,
    readingLevel: "Clear, audience-aware, and appropriate to the selected book type",
    voice: genreProfile.toneGuidance,
    themes: form.idea.split(/\W+/).filter((word) => word.length > 5).slice(0, 5),
    styleRules: [`Honor the conventions of ${genreProfile.label}`, ...genreProfile.requiredElements.slice(0, 3).map((item) => `Include ${item}`), ...genreProfile.forbiddenPatterns.slice(0, 2).map((item) => `Avoid ${item}`)],
    thesis: form.idea,
    bookType: authoritativeType,
    genreProfile,
    readerExperience: confirmedCreativeIntent?.readerExperience || genreProfile.readerExpectation,
    narrativeMode: confirmedCreativeIntent?.narrativeMode || genreProfile.narrativeStructure,
    creativeMode: genreProfile.creativeMode,
    requiredElements: genreProfile.requiredElements,
    forbiddenPatterns: genreProfile.forbiddenPatterns,
    toneGuidance: genreProfile.toneGuidance,
    chapterStructureHint: genreProfile.narrativeStructure,
    openingStyleOptions: genreProfile.openingStyles,
    uniqueCreativeInstructions: [`Make the selected book type (${authoritativeType}) authoritative.`, `Use ${confirmedCreativeIntent?.chapterNamingStyle || genreProfile.preferredChapterPatterns.join(", ")} as chapter-title guidance.`, `Mine the author's topic and source details for specific imagery, tensions, people, stakes, and language.`],
    confirmedCreativeIntent,
  };
}
