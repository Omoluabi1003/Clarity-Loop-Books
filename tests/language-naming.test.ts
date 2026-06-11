import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LOCALE_LABELS } from "../lib/i18n/config";

const swahiliDictionary = JSON.parse(
  readFileSync(new URL("../locales/sw.json", import.meta.url), "utf8"),
) as { meta: { name: string }; components: { AuthDialog: { name: string } } };

test("the locale selector and Swahili dictionary use the requested language name", () => {
  assert.equal(LOCALE_LABELS.sw, "Swahili");
  assert.equal(swahiliDictionary.meta.name, "Swahili");
  assert.equal(swahiliDictionary.components.AuthDialog.name, "Swahili");
});
