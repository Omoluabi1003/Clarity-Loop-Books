import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("blueprint fallback defines editable chapter fields", () => {
  const source = readFileSync(new URL("../lib/ai.ts", import.meta.url), "utf8");
  for (const field of ["chapterNumber", "targetWordCount", "content", "status", "locked"]) assert.match(source, new RegExp(field));
});

test("all six requested templates are available", () => {
  const source = readFileSync(new URL("../lib/templates.ts", import.meta.url), "utf8");
  for (const name of ["Self-Help", "Christian Devotional", "Memoir", "Business Book", "Biography", "Children’s Book"]) assert.match(source, new RegExp(name.replace(/[’]/g, ".")));
});
