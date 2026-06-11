import type { Book } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";

/**
 * UI localization never changes author content. This intentionally disabled seam reserves
 * a separate, explicit workflow for a future manuscript-translation feature.
 */
export const BOOK_CONTENT_TRANSLATION_ENABLED = false;

export type BookContentTranslationRequest = {
  book: Book;
  sourceLocale: Locale;
  targetLocale: Locale;
  explicitlyConfirmed: true;
};

export async function translateBookContent(request: BookContentTranslationRequest): Promise<never> {
  void request;
  throw new Error("Book-content translation is not enabled. The original manuscript remains unchanged.");
}
