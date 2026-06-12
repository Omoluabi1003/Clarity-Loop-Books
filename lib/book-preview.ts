import type { Book } from "./types";

export interface PublicBookPreview {
  id: string;
  title: string;
  subtitle: string;
  authorName: string;
  summary: string;
  genre: string;
  audience: string;
  coverImageUrl?: string;
  sample: string;
  attribution: boolean;
}

export function buildPublicBookPreview(book: Book): PublicBookPreview {
  const firstChapter = book.chapters.find((chapter) => chapter.content.trim());
  return {
    id: book.id,
    title: book.title,
    subtitle: book.subtitle,
    authorName: book.authorName,
    summary: book.bookDna.promise || book.idea,
    genre: book.genre,
    audience: book.targetAudience,
    coverImageUrl: book.coverImageUrl,
    sample: firstChapter?.content.replace(/^#+\s.*$/gm, "").trim().slice(0, 900) || "A reader preview is coming soon.",
    attribution: true,
  };
}

export function encodeBookPreview(preview: PublicBookPreview): string {
  const bytes = new TextEncoder().encode(JSON.stringify(preview));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function decodeBookPreview(value: string): PublicBookPreview | null {
  try {
    const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as PublicBookPreview;
  } catch {
    return null;
  }
}
