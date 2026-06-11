import { ArrowUpRight, BookOpenText, Clock3, Download, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Book } from "@/lib/types";
import { ManuscriptProgress } from "./ManuscriptProgress";

export function BookCard({ book, onOpen, onDelete }: { book: Book; onOpen: () => void; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const updated = book.updatedAt.includes("T") ? new Date(book.updatedAt).toLocaleString() : book.updatedAt;
  return <article className="book-card">
    <button className="book-card-open" onClick={onOpen} aria-label={`Open ${book.title}`}>
      <span data-book-content className={`book-cover ${book.color}`} style={book.coverImageUrl ? { backgroundImage: `url(${book.coverImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><small>{book.authorName}</small><BookOpenText size={26} /><strong>{book.title}</strong><em>{book.genre}</em></span>
      <span className="book-card-copy">
        <span className="card-kicker"><span><span className="project-type-pill">{(book.projectType || "nonfiction").replaceAll("_", " ")}</span><span className="status-pill">{book.status.replaceAll("_", " ")}</span></span><ArrowUpRight size={18} /></span>
        <strong data-book-content className="book-card-title">{book.title}</strong><span data-book-content className="book-card-subtitle">by {book.authorName}</span>
        <ManuscriptProgress book={book} compact />
        <span className="card-scores"><b>Quality {book.qualityScore}%</b><b>Cover {book.coverQualityScore ?? (book.useDesignedCover ? 82 : 0)}%</b></span><span className="updated">{book.actualWords.toLocaleString()} words · {book.actualEstimatedPages} pages</span>
        <span className="updated"><Clock3 size={14} /> {updated} <Download size={13} /> Resume</span>
      </span>
    </button>
    <button className="book-card-menu-button" aria-label={`Actions for ${book.title}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><MoreVertical size={18} /></button>
    {menuOpen && <div className="book-card-menu"><button onClick={() => { setMenuOpen(false); onDelete(); }}><Trash2 size={15} /> Delete Draft</button></div>}
  </article>;
}
