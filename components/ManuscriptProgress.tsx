import { Check } from "lucide-react";
import type { Book } from "@/lib/types";

export function ManuscriptProgress({ book, compact = false }: { book: Book; compact?: boolean }) {
  const drafted = book.chapters.filter((chapter) => chapter.status !== "pending").length;
  const percent = book.chapters.length ? Math.round((drafted / book.chapters.length) * 100) : book.progress;
  return <div className={`manuscript-progress ${compact ? "compact" : ""}`}>
    <div className="progress-label"><span>{drafted} of {book.chapters.length} chapters drafted</span><strong>{percent}%</strong></div>
    <div className="progress-bar"><span style={{ width: `${percent}%` }} /></div>
    {!compact && <div className="milestone-row"><span className="done"><Check size={13} /> Idea</span><span className="done"><Check size={13} /> Blueprint</span><span className={percent ? "active" : ""}>Chapters</span><span>Manuscript</span><span>Export</span></div>}
  </div>;
}
