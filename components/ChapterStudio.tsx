import { ArrowLeft, BookOpen, Check, Download, Dna, MoreHorizontal, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Book, Chapter } from "@/lib/types";
import { ChapterCard } from "./ChapterCard";

interface Props { book: Book; onBack: () => void; onChange: (book: Book) => void; onExport: () => void }

export function ChapterStudio({ book, onBack, onChange, onExport }: Props) {
  const [activeChapter, setActiveChapter] = useState(book.chapters[0]?.id ?? "");
  const [busy, setBusy] = useState("");
  const [showDNA, setShowDNA] = useState(false);
  const updateChapter = (id: string, patch: Partial<Chapter>) => onChange({ ...book, chapters: book.chapters.map((chapter) => chapter.id === id ? { ...chapter, ...patch } : chapter) });
  const writeChapter = async (chapter: Chapter, action: "write" | "rewrite" | "expand" | "shorten") => {
    setBusy(chapter.id);
    const response = await fetch("/api/chapter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookTitle: book.title, tone: book.tone, audience: book.audience, chapter, action }) });
    const data = await response.json();
    updateChapter(chapter.id, { content: data.content, status: "Draft ready" });
    setBusy("");
  };
  const drafted = book.chapters.filter((chapter) => chapter.content).length;
  return <main className="studio-page">
    <header className="studio-header"><button className="back-button" onClick={onBack}><ArrowLeft size={18} /> My books</button><div className="studio-title"><span className={`mini-cover ${book.color}`}><BookOpen size={18} /></span><div><small>{book.genre}</small><strong>{book.title}</strong></div></div><div className="studio-actions"><button className="secondary-button" onClick={() => setShowDNA(!showDNA)}><Dna size={17} /> Book DNA</button><button className="primary-button" onClick={onExport}><Download size={17} /> Export book</button><button className="icon-button"><MoreHorizontal /></button></div></header>
    <div className="studio-layout"><section className="chapter-list"><div className="studio-intro"><div><p className="eyebrow">CHAPTER STUDIO</p><h1>Your book is taking shape.</h1><p>Write one chapter at a time. You are always in control.</p></div><div className="studio-progress"><strong>{drafted}<span> / {book.chapters.length}</span></strong><small>chapters drafted</small><div className="progress-track"><span style={{ width: `${book.chapters.length ? drafted / book.chapters.length * 100 : 0}%` }} /></div></div></div>
      {book.chapters.length ? <div className="chapter-stack">{book.chapters.map((chapter) => <ChapterCard key={chapter.id} chapter={chapter} active={activeChapter === chapter.id} busy={busy === chapter.id} onOpen={() => setActiveChapter(activeChapter === chapter.id ? "" : chapter.id)} onUpdate={(patch) => updateChapter(chapter.id, patch)} onWrite={(action) => writeChapter(chapter, action)} />)}</div> : <div className="no-chapters"><Sparkles /><h2>Your blueprint is being prepared</h2><p>Add chapters to begin writing.</p></div>}
    </section>
    <aside className={`dna-panel ${showDNA ? "mobile-open" : ""}`}><div className="dna-heading"><span><Dna size={20} /></span><div><small>YOUR BOOK DNA</small><strong>The heartbeat of your book</strong></div></div><p>We quietly use these notes to keep every chapter feeling consistent and true to you.</p><dl><div><dt>Tone</dt><dd>{book.bookDNA.tone}</dd></div><div><dt>Reader</dt><dd>{book.bookDNA.audience}</dd></div><div><dt>Voice</dt><dd>{book.bookDNA.voice}</dd></div><div><dt>Reading feel</dt><dd>{book.bookDNA.readingLevel}</dd></div></dl><div className="dna-section"><strong>Core themes</strong><div className="tag-list">{book.bookDNA.themes.map((theme) => <span key={theme}>{theme}</span>)}</div></div><div className="dna-section"><strong>Style promises</strong>{book.bookDNA.styleRules.map((rule) => <p className="rule" key={rule}><Check size={14} /> {rule}</p>)}</div><button className="text-link">Edit my Book DNA →</button></aside>
    </div>
  </main>;
}
