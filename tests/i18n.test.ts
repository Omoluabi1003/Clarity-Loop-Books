import assert from "node:assert/strict";
import test from "node:test";
import { BOOK_CONTENT_TRANSLATION_ENABLED, translateBookContent } from "../lib/book-content-translation";
import { DEFAULT_LOCALE, isLocale, localeDirection, SUPPORTED_LOCALES } from "../lib/i18n/config";
import { flatDictionary, translateKey, translateSource } from "../lib/i18n/translate";
import { renderDocx, renderPdf, safeFilename } from "../lib/export-renderers";
import { sampleBooks } from "../lib/templates";
import type { Book } from "../lib/types";

const expectedLocales = ["en", "fr", "es", "ar", "de", "zh-CN", "yo", "sw"];

test("the supported locale contract contains only the eight release locales", () => {
  assert.deepEqual([...SUPPORTED_LOCALES], expectedLocales);
  assert.equal(DEFAULT_LOCALE, "en");
  assert.equal(isLocale("zh-CN"), true);
  assert.equal(localeDirection("ar"), "rtl");
  for (const locale of SUPPORTED_LOCALES.filter((item) => item !== "ar")) assert.equal(localeDirection(locale), "ltr");
});

test("every locale has exactly the complete English key set", () => {
  const englishKeys = Object.keys(flatDictionary("en")).sort();
  assert.ok(englishKeys.length > 1_000, "site-wide catalog should cover the complete application surface");
  for (const locale of SUPPORTED_LOCALES) {
    assert.deepEqual(Object.keys(flatDictionary(locale)).sort(), englishKeys, `${locale} dictionary must match English`);
    for (const key of englishKeys) assert.notEqual(flatDictionary(locale)[key].trim(), "", `${locale}:${key} must not be blank`);
  }
});

test("key and source translation use English fallback semantics", () => {
  assert.equal(translateKey("en", "common.language"), "Language");
  assert.notEqual(translateKey("fr", "common.language"), "Language");
  assert.equal(translateSource("de", "Clarity Loop"), "Clarity Loop");
  assert.equal(translateSource("en", "Uncatalogued author prose"), "Uncatalogued author prose");
});

test("manuscript translation remains a separate explicitly disabled workflow", async () => {
  assert.equal(BOOK_CONTENT_TRANSLATION_ENABLED, false);
  await assert.rejects(
    translateBookContent({ book: sampleBooks[0], sourceLocale: "en", targetLocale: "fr", explicitlyConfirmed: true }),
    /not enabled/i,
  );
});

function unicodeBook(title: string, content: string): Book {
  return {
    ...structuredClone(sampleBooks[0]),
    id: `unicode-${title.codePointAt(0)}`,
    title,
    subtitle: content,
    authorName: content,
    authorBio: content,
    chapterCount: 1,
    chapters: [{ ...structuredClone(sampleBooks[0].chapters[0]), id: "unicode-chapter", chapterNumber: 1, title, selectedTitle: title, summary: content, content }],
  };
}

test("PDF and DOCX renderers preserve Arabic, Chinese, and extended Latin projects", async () => {
  for (const [title, content] of [
    ["كتاب الوضوح", "هذا نص عربي واضح يحافظ على الحروف واتجاه الكتابة."],
    ["清晰之书", "这是用于验证简体中文字符导出的清晰文本。"],
    ["Ìwé Ìmọ̀lára", "Yorùbá, Français, Español, Deutsch na Kiswahili."],
  ] as const) {
    const book = unicodeBook(title, content);
    const [pdf, docx] = await Promise.all([renderPdf(book), renderDocx(book)]);
    assert.ok(pdf.byteLength > 1_000, `${title} PDF should contain an embedded Unicode font`);
    assert.ok(docx.byteLength > 1_000, `${title} DOCX should be generated`);
    assert.equal(safeFilename(title, "pdf"), `${title.toLocaleLowerCase().replace(/\s+/g, "-")}.pdf`);
  }
});
