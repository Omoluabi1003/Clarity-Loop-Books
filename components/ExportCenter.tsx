import { Check, Download, FileText, LockKeyhole, Printer, X } from "lucide-react";
import type { Book } from "@/lib/types";

export function ExportCenter({ book, onClose }: { book: Book; onClose: () => void }) {
  const written = book.chapters.filter((chapter) => chapter.content).length;
  const downloadDoc = () => {
    const body = book.chapters.map((chapter) => `<h1>Chapter ${chapter.chapterNumber}: ${chapter.title}</h1>${chapter.content.split("\n").map((p) => `<p>${p}</p>`).join("")}`).join("");
    const blob = new Blob([`<html><body><h1>${book.title}</h1><h2>${book.subtitle}</h2>${body}</body></html>`], { type: "application/msword" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${book.title.replace(/\W+/g, "-").toLowerCase()}.doc`; link.click(); URL.revokeObjectURL(link.href);
  };
  return <div className="modal-backdrop"><section className="export-modal"><button className="modal-close" onClick={onClose}><X /></button><div className="export-hero"><span><Download /></span><p className="eyebrow">EXPORT CENTER</p><h2>Your manuscript, ready your way</h2><p>Download a clean copy to share, review, or take into your favorite editing tool.</p></div><div className="manuscript-check"><div><strong>{book.title}</strong><span>{written} of {book.chapters.length} chapters written</span></div><div className="progress-track"><span style={{ width: `${book.chapters.length ? written / book.chapters.length * 100 : 0}%` }} /></div>{written < book.chapters.length && <small>You can export now, or finish the remaining chapters first.</small>}</div><div className="export-options"><button onClick={() => window.print()}><span className="file-icon pdf"><Printer /></span><span><strong>Print or save as PDF</strong><small>A polished, shareable reading copy</small><em><Check size={13} /> Included in your plan</em></span></button><button onClick={downloadDoc}><span className="file-icon doc"><FileText /></span><span><strong>Word document</strong><small>An editable manuscript for Microsoft Word</small><em className="pro"><LockKeyhole size={13} /> Pro preview</em></span></button></div><p className="export-note">Your writing stays yours. Clarity Loop never claims ownership of your work.</p></section></div>;
}
