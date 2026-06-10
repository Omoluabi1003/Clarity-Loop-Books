import { ArrowUpRight, BookOpenText, Clock3, Download } from "lucide-react";
import type { Book } from "@/lib/types";
import { ManuscriptProgress } from "./ManuscriptProgress";

export function BookCard({ book, onOpen }: { book: Book; onOpen: () => void }) {
  const updated = book.updatedAt.includes("T") ? new Date(book.updatedAt).toLocaleString() : book.updatedAt;
  return <button className="book-card" onClick={onOpen}>
    <span className={`book-cover ${book.color}`} style={book.coverImageUrl ? { backgroundImage: `url(${book.coverImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><small>{book.authorName}</small><BookOpenText size={26} /><strong>{book.title}</strong><em>{book.genre}</em></span>
    <span className="book-card-copy">
      <span className="card-kicker"><span className="status-pill">{book.status.replaceAll("_", " ")}</span><ArrowUpRight size={18} /></span>
      <strong className="book-card-title">{book.title}</strong><span className="book-card-subtitle">by {book.authorName}</span>
      <ManuscriptProgress book={book} compact />
      <span className="updated">{book.actualWords.toLocaleString()} words · {book.actualEstimatedPages} pages</span>
      <span className="updated"><Clock3 size={14} /> {updated} <Download size={13} /> Resume</span>
    </span>
  </button>;
}
