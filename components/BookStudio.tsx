"use client";

import { Bell, BookOpen, ChevronDown, CircleHelp, LayoutGrid, Menu, Search, Settings, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sampleBooks } from "@/lib/templates";
import type { Book, BookForm, BookTemplate } from "@/lib/types";
import { BookDashboard } from "./BookDashboard";
import { BookWizard } from "./BookWizard";
import { ChapterStudio } from "./ChapterStudio";
import { ExportCenter } from "./ExportCenter";
import { TemplateSelector } from "./TemplateSelector";

export function BookStudio() {
  const [books, setBooks] = useState<Book[]>(sampleBooks);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BookTemplate | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const storageReady = useRef(false);
  const activeBook = books.find((book) => book.id === activeBookId);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("clarity-loop-books");
      if (saved) {
        try { setBooks(JSON.parse(saved)); } catch { localStorage.removeItem("clarity-loop-books"); }
      }
      storageReady.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (storageReady.current) localStorage.setItem("clarity-loop-books", JSON.stringify(books));
  }, [books]);

  const createBook = async (form: BookForm) => {
    const response = await fetch("/api/blueprint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    const id = `book-${Date.now()}`;
    const book: Book = { id, title: form.title, subtitle: form.subtitle || "A new book taking shape", genre: form.genre, audience: form.audience, tone: form.tone, writingStyle: form.writingStyle, bookLength: form.bookLength, autoMode: form.autoMode, status: "Planning", progress: 8, updatedAt: "Just now", color: "violet", chapters: data.chapters, bookDNA: { tone: form.tone, audience: form.audience, readingLevel: "Clear and conversational", voice: form.writingStyle, themes: ["growth", "clarity", "meaningful change"], styleRules: ["Use plain, welcoming language", "Include relatable examples", "End with a useful takeaway"] } };
    setBooks((current) => [book, ...current]); setWizardOpen(false); setSelectedTemplate(null); setActiveBookId(id);
  };
  const openWizard = (template?: BookTemplate) => { setSelectedTemplate(template ?? null); setWizardOpen(true); };

  if (activeBook) return <><ChapterStudio book={activeBook} onBack={() => setActiveBookId(null)} onChange={(next) => setBooks((current) => current.map((book) => book.id === next.id ? next : book))} onExport={() => setExportOpen(true)} />{exportOpen && <ExportCenter book={activeBook} onClose={() => setExportOpen(false)} />}</>;

  return <div className="app-shell"><header className="main-header"><button className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>Clarity <b>Loop</b></span></button><nav className={mobileMenu ? "open" : ""}><button className="active"><LayoutGrid size={17} /> Dashboard</button><button><BookOpen size={17} /> My Books</button><button onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}><Sparkles size={17} /> Templates</button><button><CircleHelp size={17} /> Help</button></nav><div className="header-tools"><button aria-label="Search"><Search size={19} /></button><button aria-label="Notifications" className="notification"><Bell size={19} /><span /></button><button className="profile"><span>MJ</span><em>Maya Johnson</em><ChevronDown size={15} /></button><button className="mobile-menu" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</button></div></header><BookDashboard books={books} onOpen={setActiveBookId} onCreate={() => openWizard()} /><TemplateSelector onSelect={openWizard} /><footer><div className="brand"><span className="brand-mark"><Sparkles size={15} /></span><span>Clarity <b>Loop</b></span></div><p>Your words. Your voice. Your book.</p><button><Settings size={15} /> Studio settings</button></footer>{wizardOpen && <BookWizard key={selectedTemplate?.id ?? "blank"} initialTemplate={selectedTemplate} onClose={() => { setWizardOpen(false); setSelectedTemplate(null); }} onCreate={createBook} />}</div>;
}
