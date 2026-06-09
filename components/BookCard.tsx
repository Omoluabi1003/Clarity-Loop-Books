import { ArrowUpRight, BookOpenText, Clock3 } from "lucide-react";
import type { Book } from "@/lib/types";
import { ManuscriptProgress } from "./ManuscriptProgress";

export function BookCard({ book, onOpen }: { book: Book; onOpen: () => void }) {
  return <button className="book-card" onClick={onOpen}>
    <span className={`book-cover ${book.color}`}><small>CLARITY LOOP</small><BookOpenText size={26} /><strong>{book.title}</strong><em>{book.genre}</em></span>
    <span className="book-card-copy">
      <span className="card-kicker"><span className="status-pill">In progress</span><ArrowUpRight size={18} /></span>
      <strong className="book-card-title">{book.title}</strong><span className="book-card-subtitle">{book.subtitle}</span>
      <ManuscriptProgress book={book} compact />
      <span className="updated"><Clock3 size={14} /> {book.updatedAt}</span>
    </span>
  </button>;
}
