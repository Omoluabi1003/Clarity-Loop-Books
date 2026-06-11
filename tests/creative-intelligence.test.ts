import assert from "node:assert/strict";
import test from "node:test";
import { buildBookDna } from "../lib/book-dna";
import { buildConfirmedCreativeIntent, diagnoseCreativeIntent } from "../lib/creative-intent-diagnostic";
import { buildChapterTitleContext, generateChapterTitleOptions, regenerateTitleOptionsForChapter, validateChapterTitles } from "../lib/chapter-title-intelligence";
import type { BookForm, Chapter } from "../lib/types";

function form(genre: string, idea = "A specific and meaningful book idea"): BookForm {
  return { title: "Working Title", subtitle: "", authorName: "Author", authorBio: "", authorEmail: "", authorWebsite: "", publisherCredit: "", idea, genre, targetAudience: "Thoughtful readers", tone: "Warm and clear", writingStyle: "Specific and story-led", chapterCount: 8, targetPageCount: 160, wordsPerPage: 275, chapterSizePreference: "auto", customChapterWords: 2500, aiAssistanceLevel: "guided", coverDirection: "" };
}

test("selected genre creates authoritative genre DNA", () => {
  const biography = buildBookDna(form("Biography", "The life and legacy of a community leader"));
  assert.equal(biography.creativeMode, "life_story");
  assert.ok(biography.forbiddenPatterns?.includes("business framework language"));
  assert.equal(buildBookDna(form("Business & Professional Development")).creativeMode, "framework_instruction");
  assert.equal(buildBookDna(form("Fiction")).creativeMode, "story_world");
  assert.equal(buildBookDna(form("Faith & Spiritual Growth")).creativeMode, "spiritual_growth");
  assert.equal(buildBookDna(form("Workbook / Training Manual")).creativeMode, "applied_practice");
});

test("identity report precedes generation and confirmed intent overrides inference", () => {
  const raw = form("Biography", "A business leader's life, childhood, adversity, and legacy");
  const report = diagnoseCreativeIntent(raw);
  assert.equal(report.selectedBookType, "Biography");
  assert.ok(report.structuralRecommendation.includes("life-stage"));
  const confirmed = buildConfirmedCreativeIntent(raw, { bookType: "Memoir", emotionalPromise: "Help readers feel less alone." });
  const dna = buildBookDna(raw, confirmed);
  assert.equal(dna.bookType, "Memoir");
  assert.equal(dna.corePromise, "Help readers feel less alone.");
});

test("chapter titles are genre-aware, editable, validated, and lock-safe", () => {
  const dna = buildBookDna(form("Biography", "The life and legacy of a community leader"));
  const options = generateChapterTitleOptions(dna, "Explore early life and family influence", 0);
  assert.equal(options.length, 4);
  assert.ok(options[0].genreFitScore >= 75);
  const edited = buildChapterTitleContext("The Porch Where He Learned to Listen", dna, "Explore early life");
  assert.equal(edited.title, "The Porch Where He Learned to Listen");
  const chapter = { chapterNumber: 1, title: "The Strategy of Change", selectedTitle: "The Strategy of Change", summary: "Early life", titleLocked: true, titleOptions: options } as Chapter;
  assert.deepEqual(regenerateTitleOptionsForChapter(dna, chapter), options);
  assert.ok(validateChapterTitles([chapter], dna).warnings.some((warning) => warning.includes("Biography title sounds like business strategy")));
});

test("older chapters without title options can receive options lazily", () => {
  const dna = buildBookDna(form("Fiction", "A stranger arrives in a flooded city with a dangerous promise"));
  const oldChapter = { chapterNumber: 2, title: "The Arrival", summary: "The stranger crosses into the city", titleLocked: false } as Chapter;
  assert.equal(regenerateTitleOptionsForChapter(dna, oldChapter).length, 4);
});
