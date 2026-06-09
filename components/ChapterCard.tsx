import { ChevronDown, ChevronUp, Expand, FilePenLine, Lock, LockOpen, Minus, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Chapter } from "@/lib/types";

interface Props { chapter: Chapter; active: boolean; busy: boolean; onOpen: () => void; onUpdate: (patch: Partial<Chapter>) => void; onWrite: (action: "write" | "rewrite" | "expand" | "shorten") => void }

export function ChapterCard({ chapter, active, busy, onOpen, onUpdate, onWrite }: Props) {
  const [editing, setEditing] = useState(false);
  const words = chapter.content.trim() ? chapter.content.trim().split(/\s+/).length : 0;
  return (
    <article className={`chapter-card ${active ? "active" : ""} ${chapter.locked ? "locked" : ""}`}>
      <button className="chapter-summary" onClick={onOpen}>
        <span className="chapter-number">{String(chapter.chapterNumber).padStart(2, "0")}</span>
        <span className="chapter-heading"><small>{chapter.status}</small><strong>{chapter.title}</strong><span>{chapter.summary}</span></span>
        <span className="chapter-count">{words ? `${words} words` : `${chapter.targetWordCount.toLocaleString()} target`}</span>
        {active ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {active && <div className="chapter-body">
        <div className="chapter-toolbar">
          <label>Target words <input type="number" value={chapter.targetWordCount} onChange={(e) => onUpdate({ targetWordCount: Number(e.target.value) })} /></label>
          <div>
            {chapter.content && <><button title="Rewrite" disabled={busy || chapter.locked} onClick={() => onWrite("rewrite")}><RotateCcw size={15} /> Rewrite</button><button title="Expand" disabled={busy || chapter.locked} onClick={() => onWrite("expand")}><Expand size={15} /> Expand</button><button title="Shorten" disabled={busy || chapter.locked} onClick={() => onWrite("shorten")}><Minus size={15} /> Shorten</button></>}
            <button onClick={() => onUpdate({ locked: !chapter.locked })}>{chapter.locked ? <Lock size={15} /> : <LockOpen size={15} />}{chapter.locked ? "Locked" : "Lock"}</button>
          </div>
        </div>
        {chapter.content ? <div className="editor-shell">
          <div className="editor-top"><span>Manuscript</span><button onClick={() => setEditing(!editing)}><FilePenLine size={15} /> {editing ? "Done editing" : "Edit chapter"}</button></div>
          {editing ? <textarea className="chapter-editor" value={chapter.content} disabled={chapter.locked} onChange={(e) => onUpdate({ content: e.target.value, status: "Needs review" })} /> : <div className="chapter-prose">{chapter.content.split("\n").map((paragraph, index) => paragraph.startsWith("### ") ? <h3 key={index}>{paragraph.replace("### ", "")}</h3> : paragraph ? <p key={index}>{paragraph}</p> : null)}</div>}
        </div> : <div className="empty-chapter"><span><Sparkles size={22} /></span><h3>Your chapter plan is ready</h3><p>We’ll use your outline and Book DNA to create a thoughtful first draft.</p><button className="primary-button" disabled={busy || chapter.locked} onClick={() => onWrite("write")}><Sparkles size={17} /> {busy ? "Writing your chapter…" : "Write my chapter"}</button></div>}
      </div>}
    </article>
  );
}
