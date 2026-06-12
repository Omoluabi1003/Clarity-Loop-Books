import assert from "node:assert/strict";
import test from "node:test";
import { analyzeManuscriptIntelligence, getAuthorNextAction, getPublishingChecklist } from "../lib/author-os";
import { buildPublicBookPreview } from "../lib/book-preview";
import { sampleBooks } from "../lib/templates";

const book = sampleBooks[0];

test("manuscript intelligence returns bounded, actionable scores", () => {
  const report = analyzeManuscriptIntelligence(book);
  assert.equal(report.signals.length, 3);
  for (const score of [report.publishReadyScore, report.uniquenessScore, report.toneConsistencyScore, report.structureScore]) {
    assert.ok(score >= 0 && score <= 100);
  }
  assert.ok(report.recommendations.length > 0);
});

test("author OS derives a next action and publishing checklist", () => {
  const action = getAuthorNextAction(book);
  const checklist = getPublishingChecklist(book);
  assert.ok(action.label.length > 0);
  assert.equal(checklist.length, 5);
  assert.ok(checklist.every((item) => typeof item.complete === "boolean"));
});

test("public preview only includes acquisition-safe book fields", () => {
  const preview = buildPublicBookPreview(book);
  assert.equal(preview.id, book.id);
  assert.equal(preview.title, book.title);
  assert.equal(preview.attribution, true);
  assert.ok(preview.sample.length <= 900);
  assert.equal("authorEmail" in preview, false);
});
