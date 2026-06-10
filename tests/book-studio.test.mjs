import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const budget = readFileSync(new URL("../lib/book-budget.ts", import.meta.url), "utf8");
const ai = readFileSync(new URL("../lib/ai.ts", import.meta.url), "utf8");
const studio = readFileSync(new URL("../components/BookStudio.tsx", import.meta.url), "utf8");
const exportCenter = readFileSync(new URL("../components/ExportCenter.tsx", import.meta.url), "utf8");

test("book budget converts pages to words and allocates every word", () => {
  assert.match(budget, /targetWords = targetPages \* wordsPerPage/);
  assert.match(budget, /targetWords % chapterCount/);
  assert.equal(180 * 275, 49_500);
  assert.equal((180 * 275) / 10, 4_950);
});

test("chapter generation enforces the 85 percent completion floor", () => {
  assert.match(ai, /chapter\.targetWordCount/);
  assert.match(ai, /Target word count:/);
  assert.match(ai, /examples or case studies/);
  assert.match(ai, /while \(countWords\(content\)/);
});

test("projects autosave every 15 seconds and can migrate saved v2 books", () => {
  assert.match(studio, /15_000/);
  assert.match(studio, /clarity-loop-books-v2/);
  assert.match(studio, /beforeunload/);
});

test("export readiness blocks incomplete manuscripts but supports explicit override", () => {
  assert.match(exportCenter, /exportReadinessStatus === "blocked"/);
  assert.match(exportCenter, /Export an incomplete working draft anyway/);
  assert.match(exportCenter, /book\.authorName/);
  assert.match(exportCenter, /book\.coverPrompt/);
});
