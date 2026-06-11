import type { Book, BookPositioning, MarketingPackage, ReaderDNA } from "./types";

const rotate = (items: string[], count: number, make: (item: string, index: number) => string) => Array.from({ length: count }, (_, index) => make(items[index % items.length], index));
export function generateMarketingPackage(book: Book, positioning: BookPositioning, readers: ReaderDNA): MarketingPackage {
  const themes = book.bookDna.themes.length ? book.bookDna.themes : book.chapters.slice(0, 5).map((chapter) => chapter.title);
  const source = themes.length ? themes : [book.idea];
  const cta = `Learn more about ${book.title}.`;
  return {
    linkedInPosts: rotate(source, 30, (theme, i) => `${i % 3 === 0 ? "A question worth asking" : i % 3 === 1 ? "A lesson from the manuscript" : "A practical shift"}: ${theme}. ${positioning.readerPromise} is not about generic inspiration—it starts with the decisions ${book.targetAudience} face now. ${cta}`),
    facebookPosts: rotate(source, 30, (theme, i) => `${i % 2 ? "Behind this chapter is a simple idea" : "Have you ever felt this tension"}: ${theme}. I wrote ${book.title} for ${book.targetAudience} who want to feel understood and see a credible next step. What part of this theme feels most familiar?`),
    xPosts: rotate(source, 30, (theme, i) => `${theme}: ${readers.languageReadersUse[i % readers.languageReadersUse.length]} ${i % 4 === 0 ? cta : ""}`.trim()),
    threadsPosts: rotate(source, 30, (theme, i) => `${i + 1}. A thread from ${book.title}: ${theme}. The common advice misses the lived reality of ${book.targetAudience}. Here is the more useful question: what would meaningful progress look like now?`),
    instagramCaptions: rotate(source, 30, (theme, i) => `${i % 2 ? "A page from the thinking behind" : "The story beneath"} ${book.title}: ${theme}. Written for ${book.targetAudience}. Save this for the moment you need a clearer next step. #${book.genre.replace(/\W/g, "")} #AuthorJourney`),
    tikTokVideoIdeas: rotate(source, 15, (theme, i) => `${i + 1}. Open with “The most misunderstood part of ${theme} is…” then connect one manuscript insight to ${readers.primaryReaderAvatar.currentProblem}. End with a question, not a sales claim.`),
    youtubeShortsIdeas: rotate(source, 15, (theme, i) => `${i + 1}. 45-second author lesson: define ${theme}, name one common mistake, share one book-specific reframe, and invite viewers to read the related chapter.`),
    podcastPitchEmail: `Subject: Guest idea for your audience — ${book.title}\n\nI’m the author of ${book.title}, a ${book.genre.toLowerCase()} book for ${book.targetAudience}. A useful conversation for your listeners would explore ${source.slice(0, 3).join(", ")} and why ${readers.primaryReaderAvatar.currentProblem.toLowerCase()}. I can offer practical, book-grounded examples without turning the conversation into a generic promotion.`,
    pressRelease: `${book.title.toUpperCase()} OFFERS A FOCUSED NEW RESOURCE FOR ${book.targetAudience.toUpperCase()}\n\n${book.title}, by ${book.authorName}, explores ${source.slice(0, 3).join(", ")} with a ${book.tone.toLowerCase()} approach. The book is designed to ${positioning.readerPromise.toLowerCase()}. Availability and publication details should be confirmed before distribution.`,
    bookTrailerScript: `[Opening: the reader's world] “${readers.languageReadersUse[0]}”\n[Shift] ${positioning.backCoverHook}\n[Reveal cover] ${book.title} by ${book.authorName}.\n[Promise] ${positioning.oneSentencePitch}\n[Close] Available wherever the author confirms the book is sold.`,
  };
}
