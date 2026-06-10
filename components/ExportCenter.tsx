import { AlertTriangle, Check, Download, File, FileText, Globe2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { getPublishingReadiness } from "@/lib/book-budget";
import type { Book } from "@/lib/types";

export function ExportCenter({ book, onClose }: { book: Book; onClose: () => void }) {
  const [override, setOverride] = useState(false);
  const readiness = getPublishingReadiness(book);
  const blocked = readiness.exportReadinessStatus === "blocked" && !override;
  const downloadText = (extension: "docx" | "epub") => {
    if (blocked) return;
    const titlePage = `${book.title}\n${book.subtitle}\n\nby ${book.authorName}\n\n${book.publisherCredit || ""}`;
    const manuscript = book.chapters.map((chapter) => `CHAPTER ${chapter.chapterNumber}\n${chapter.title}\n\n${chapter.content || "[Chapter draft pending]"}`).join("\n\n\n");
    const metadata = `\n\nCOVER CONCEPT\n${book.coverPrompt}\n\nMANUSCRIPT METRICS\n${readiness.actualWords} words · ${readiness.actualEstimatedPages} estimated pages`;
    const blob = new Blob([`${titlePage}\n\n\n${manuscript}${metadata}`], { type: "text/plain" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${book.title.replace(/\W+/g, "-").toLowerCase()}-manuscript.${extension}`; link.click(); URL.revokeObjectURL(link.href);
  };
  return <div className="modal-backdrop"><section className="export-modal" role="dialog" aria-modal="true" aria-label="Export center">
    <div className="export-header"><div><p className="eyebrow">EXPORT CENTER</p><h2>Prepare your book for the world.</h2><p>{book.title} by {book.authorName}</p></div><button aria-label="Close export center" onClick={onClose}><X /></button></div>
    <div className="readiness-card"><div className="readiness-ring"><strong>{readiness.lengthAccuracyPercent}%</strong><small>length</small></div><div><h3>{readiness.exportReadinessStatus === "ready" ? "Your manuscript is ready to export" : "Publishing checks need attention"}</h3><p>{readiness.actualWords.toLocaleString()} of {readiness.targetWords.toLocaleString()} words · {readiness.actualEstimatedPages} of {readiness.targetPages} estimated pages · {readiness.completedChapters} of {readiness.chapterCount} chapters complete.</p><span><Check size={14} /> Book DNA consistency: {readiness.bookDnaConsistencyScore}%</span>{readiness.blockers.map((blocker) => <span className="readiness-warning" key={blocker}><AlertTriangle size={14} /> {blocker}</span>)}</div></div>
    {readiness.exportReadinessStatus !== "ready" && <label className="export-override"><input type="checkbox" checked={override} onChange={(event) => setOverride(event.target.checked)} /> Export an incomplete working draft anyway (warnings will remain in the file).</label>}
    <div className="export-options"><button disabled={blocked} onClick={() => window.print()}><span><FileText /></span><strong>Print-ready PDF</strong><small>Includes title and author metadata</small><em>Export PDF <Download size={14} /></em></button><button disabled={blocked} onClick={() => downloadText("docx")}><span><File /></span><strong>Editable DOCX</strong><small>Includes manuscript and cover metadata</small><em>Export DOCX <Download size={14} /></em></button><button disabled={blocked} onClick={() => downloadText("epub")}><span><Globe2 /></span><strong>EPUB eBook</strong><small>Includes publishing metadata</small><em>Export EPUB <Download size={14} /></em></button></div>
    <div className="publishing-assets"><div><Sparkles size={19} /><span><strong>Cover concept</strong><small>{book.coverPrompt}</small></span></div><div className="asset-chips"><button>Regenerate concept</button><button>Upload cover (coming soon)</button><button>Author bio</button><button>Keywords</button></div></div><p className="export-note">DOCX and EPUB use a metadata-rich preview download in this studio build. Connect a production document renderer before launch.</p>
  </section></div>;
}
