import type { BetaFeedback, Book, SavedStudioState } from "./types";

export const STORAGE_KEY = "clarity-loop-studio-v4";
export const LEGACY_STORAGE_KEYS = ["clarity-loop-books-v3", "clarity-loop-books-v2"];

export function serializeStudioState(books: Book[], feedback: BetaFeedback[]): string {
  const state: SavedStudioState = { schemaVersion: 4, books, feedback, savedAt: new Date().toISOString() };
  return JSON.stringify(state);
}

export function parseStudioState(raw: string): { books: Book[]; feedback: BetaFeedback[] } {
  const parsed = JSON.parse(raw) as SavedStudioState | Book[];
  if (Array.isArray(parsed)) return { books: parsed, feedback: [] };
  if (parsed.schemaVersion !== 4 || !Array.isArray(parsed.books)) throw new Error("Unsupported saved project format.");
  return { books: parsed.books, feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [] };
}

export function deleteBookFromState(books: Book[], bookId: string, permanent = false, deletedAt = new Date().toISOString()): Book[] {
  if (permanent) return books.filter((book) => book.id !== bookId);
  return books.map((book) => book.id === bookId ? {
    ...book,
    deletedAt,
    status: "deleted",
    updatedAt: deletedAt,
  } : book);
}

export function visibleBooks(books: Book[]): Book[] {
  return books.filter((book) => !book.deletedAt && !book.archivedAt && book.status !== "deleted");
}
