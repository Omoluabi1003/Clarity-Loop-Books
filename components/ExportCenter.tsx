import { AlertTriangle, Check, Download, File, FileText, LoaderCircle, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { getPublishingReadiness } from "@/lib/book-budget";
import type { Book, ExportFormat } from "@/lib/types";

export function ExportCenter({ book, onClose, onExported }: { book: Book; onClose: () => void; onExported?: (format: ExportFormat) => void }) {
  const [override, setOverride] = useState(false);
  const [working, setWorking] = useState<"pdf" | "docx" | null>(null);
  const [error, setError] = useState("");
  const readiness = getPublishingReadiness(book);
  const blocked = readiness.exportReadinessStatus === "blocked" && !override;
  const download = async (format: "pdf" | "docx") => {
    if (blocked || working) return;
    setWorking(format); setError("");
    try {
      const response = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ book, format, allowIncomplete: override }) });
      if (!response.ok) { const detail = await response.json().catch(() => ({})); throw new Error(detail.error || "Export failed."); }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || `${book.title}.${format}`;
      const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      onExported?.(format);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Export failed. Your project remains saved."); }
    finally { setWorking(null); }
  };
  return <div className="modal-backdrop"><section className="export-modal" role="dialog" aria-modal="true" aria-label="Export center">
    <div className="export-header"><div><p className="eyebrow">EXPORT CENTER</p><h2>Prepare your complete manuscript.</h2><p>{book.title} by {book.authorName}</p></div><button aria-label="Close export center" onClick={onClose}><X /></button></div>
    <div className="readiness-card"><div className="readiness-ring"><strong>{readiness.lengthAccuracyPercent}%</strong><small>length</small></div><div><h3>{readiness.exportReadinessStatus === "ready" ? "Your manuscript is ready to export" : "Publishing checks need attention"}</h3><p>{readiness.actualWords.toLocaleString()} of {readiness.targetWords.toLocaleString()} words · {readiness.actualEstimatedPages} of {readiness.targetPages} estimated pages · {readiness.completedChapters} of {readiness.chapterCount} chapters complete.</p><span><Check size={14} /> Quality score: {readiness.qualityScore}%</span>{[...readiness.blockers, ...readiness.warnings].map((message) => <span className="readiness-warning" key={message}><AlertTriangle size={14} /> {message}</span>)}</div></div>
    {readiness.exportReadinessStatus === "blocked" && <label className="export-override"><input type="checkbox" checked={override} onChange={(event) => setOverride(event.target.checked)} /> Export an incomplete working draft anyway. The file will still contain the complete canonical saved manuscript.</label>}
    {error && <p className="export-error" role="alert"><AlertTriangle size={16} /> {error}</p>}
    <div className="export-options"><button disabled={blocked || Boolean(working)} onClick={() => download("pdf")}><span>{working === "pdf" ? <LoaderCircle className="spin" /> : <FileText />}</span><strong>Print-ready PDF</strong><small>Full manuscript, title pages, contents, and chapter breaks</small><em>Export PDF <Download size={14} /></em></button><button disabled={blocked || Boolean(working)} onClick={() => download("docx")}><span>{working === "docx" ? <LoaderCircle className="spin" /> : <File />}</span><strong>Editable DOCX</strong><small>Valid Word package with structured headings and page breaks</small><em>Export DOCX <Download size={14} /></em></button></div>
    <div className="publishing-assets"><div><Sparkles size={19} /><span><strong>Cover direction</strong><small>{book.coverDirection || book.coverPrompt}</small></span></div></div><p className="export-note">PDF and DOCX are generated from the same deterministic manuscript assembly engine, never from the visible page preview.</p>
  </section></div>;
}
