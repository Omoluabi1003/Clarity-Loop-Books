import type { Book, BookPositioning, ReaderDNA } from "./types";

export function positionBook(book: Book, readers: ReaderDNA): BookPositioning {
  const reader = book.targetAudience || readers.primaryReaderAvatar.professionOrLifeStage;
  const problem = readers.primaryReaderAvatar.currentProblem;
  const promise = book.bookDna.promise || book.bookDna.corePromise || readers.readerTransformationPromise;
  const method = book.bookDna.themes.slice(0, 3).join(", ") || book.writingStyle || "a focused, reader-centered approach";
  return {
    positioningStatement: `For ${reader} who struggle with ${problem.toLowerCase()}, ${book.title} provides ${promise.toLowerCase()} through ${method}, so they can reach a meaningful next outcome.`,
    uniqueSellingProposition: `${book.title} combines ${method} with a ${book.tone.toLowerCase()} voice designed specifically for ${reader}.`,
    readerPromise: promise,
    competitiveAngle: `A ${book.genre.toLowerCase()} book that replaces broad inspiration with an audience-specific experience and a clear post-reading payoff.`,
    categoryRecommendations: [book.genre, `${book.genre} / ${book.bookDna.themes[0] || "Personal Growth"}`, `${book.genre} / ${book.bookDna.themes[1] || "Practical Guides"}`],
    keywordThemes: [book.genre, ...book.bookDna.themes, ...reader.split(/[,/&]/)].map((value) => value.trim()).filter(Boolean).slice(0, 10),
    backCoverHook: `${reader} do not need another generic book. They need a guide or story that recognizes ${problem.toLowerCase()} and shows what becomes possible next.`,
    oneSentencePitch: `${book.title} helps ${reader} ${promise.toLowerCase()} through ${method}.`,
    thirtySecondPitch: `${book.title} is a ${book.genre.toLowerCase()} book for ${reader}. It begins with the real challenge—${problem.toLowerCase()}—and offers ${promise.toLowerCase()}. Its distinctive angle is ${method}, giving readers a focused reason to choose, finish, and recommend it.`,
  };
}
