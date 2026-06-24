import test from "node:test";
import assert from "node:assert/strict";
import { getLaunchContext } from "../lib/clarity-launch-engine";

test("getLaunchContext reads a book context", () => {
  const context = getLaunchContext({
    title: "The Clarity Path",
    idea: "A practical clarity book.",
    genre: "Self-Help",
    targetAudience: "professionals",
    authorName: "Sample Author",
    bookDna: {
      promise: "clear direction",
      tone: "Professional",
      audience: "professionals",
      readingLevel: "General",
      voice: "Clear",
      themes: [],
      styleRules: []
    }
  } as any);

  assert.equal(context.title, "The Clarity Path");
  assert.equal(context.genre, "Self-Help");
  assert.equal(context.audience, "professionals");
  assert.equal(context.promise, "clear direction");
});
