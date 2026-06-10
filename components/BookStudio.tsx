"use client";

import { BookOpenText, CircleHelp, Menu, PenLine, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateBookBudget, recalculateBook } from "@/lib/book-budget";
import { generateCoverPrompt } from "@/lib/ai";
import { sampleBooks } from "@/lib/templates";
import type { Book, BookForm, BookTemplate } from "@/lib/types";
import { AuthorWorkspace } from "./AuthorWorkspace";
import { BlueprintView } from "./BlueprintView";
import { ChapterStudio } from "./ChapterStudio";
import { ExportCenter } from "./ExportCenter";
import { NewBookWizard } from "./NewBookWizard";

type View = "workspace" | "blueprint" | "chapters";
const STORAGE_KEY = "clarity-loop-books-v3";

function hydrateBook(raw: Book): Book {
  const wordsPerPage = raw.wordsPerPage || 275;
  const targetPageCount = raw.targetPageCount || 180;
  const chapterCount = raw.chapters?.length || raw.chapterCount || 10;
  const targetWords = raw.targetWords || targetPageCount * wordsPerPage;
  const chapters = (raw.chapters || []).map((chapter) => ({ ...chapter, actualWordCount: chapter.actualWordCount ?? (chapter.content.trim() ? chapter.content.trim().split(/\s+/).length : 0) }));
  return recalculateBook({
    ...raw,
    authorName: raw.authorName || "Author name needed",
    authorBio: raw.authorBio || "",
    wordsPerPage,
    targetWords,
    averageWordsPerChapter: raw.averageWordsPerChapter || Math.round(targetWords / chapterCount),
    actualWords: raw.actualWords || 0,
    actualEstimatedPages: raw.actualEstimatedPages || 0,
    coverPrompt: raw.coverPrompt || "Professional cover concept pending review.",
    status: ["draft", "in_progress", "completed"].includes(raw.status as string) ? "drafting" : raw.status,
    chapters,
    versionHistory: raw.versionHistory || [],
  });
}

export function BookStudio() {
  const [books, setBooks] = useState<Book[]>(() => sampleBooks.map(hydrateBook));
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [view, setView] = useState<View>("workspace");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BookTemplate | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [lastSaved, setLastSaved] = useState("Not saved yet");
  const booksRef = useRef(books);
  const storageReady = useRef(false);
  const activeBook = useMemo(() => books.find((book) => book.id === activeBookId), [books, activeBookId]);

  useEffect(() => { booksRef.current = books; }, [books]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("clarity-loop-books-v2");
      if (saved) {
        try { setBooks((JSON.parse(saved) as Book[]).map(hydrateBook)); }
        catch { localStorage.removeItem(STORAGE_KEY); }
      }
      storageReady.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const save = () => {
      if (!storageReady.current) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(booksRef.current));
      setLastSaved(`Autosaved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    };
    const interval = window.setInterval(save, 15_000);
    window.addEventListener("beforeunload", save);
    return () => { window.clearInterval(interval); window.removeEventListener("beforeunload", save); };
  }, []);

  const saveNow = (nextBooks = booksRef.current) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBooks));
    setLastSaved("Saved just now");
  };
  const openBook = (book: Book, target: "blueprint" | "chapters") => { setActiveBookId(book.id); setView(target); window.scrollTo(0, 0); };
  const openWizard = (template?: BookTemplate) => { setSelectedTemplate(template ?? null); setWizardOpen(true); };
  const updateBook = (next: Book) => setBooks((current) => {
    const recalculated = recalculateBook({ ...next, updatedAt: new Date().toISOString() });
    const updated = current.map((book) => book.id === next.id ? recalculated : book);
    booksRef.current = updated;
    return updated;
  });
  const createBook = async (form: BookForm) => {
    const response = await fetch("/api/blueprint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!response.ok) throw new Error("Blueprint failed");
    const data = await response.json();
    const budget = calculateBookBudget(form);
    const id = `book-${Date.now()}`;
    const now = new Date().toISOString();
    const base: Book = {
      id, title: form.title, subtitle: form.subtitle || "", authorName: form.authorName, authorBio: form.authorBio,
      authorEmail: form.authorEmail, authorWebsite: form.authorWebsite, publisherCredit: form.publisherCredit,
      idea: form.idea, genre: form.genre, targetAudience: form.targetAudience, tone: form.tone, writingStyle: form.writingStyle,
      chapterCount: budget.chapterCount, targetPageCount: budget.targetPages, wordsPerPage: budget.wordsPerPage,
      targetWords: budget.targetWords, averageWordsPerChapter: budget.averageWordsPerChapter, actualWords: 0, actualEstimatedPages: 0,
      chapterSizePreference: form.chapterSizePreference, aiAssistanceLevel: form.aiAssistanceLevel, status: "blueprint", progress: 0,
      updatedAt: now, createdAt: now, color: "gold", coverDirection: form.coverDirection, coverPrompt: "", chapters: data.chapters.map((chapter: Book["chapters"][number]) => ({ ...chapter, bookId: id })),
      bookDna: { promise: `Help ${form.targetAudience.toLowerCase()} understand and apply the central idea of ${form.title}.`, tone: form.tone, audience: form.targetAudience, readingLevel: "Clear and conversational", voice: form.writingStyle, themes: ["clarity", "growth", "meaningful change"], styleRules: ["Use welcoming, non-technical language", "Include relatable examples and case studies", "End with practical implementation and a useful takeaway"] },
      versionHistory: [now],
    };
    const book = { ...base, coverPrompt: generateCoverPrompt(base) };
    const next = [book, ...booksRef.current];
    booksRef.current = next;
    setBooks(next);
    saveNow(next);
    setWizardOpen(false); setSelectedTemplate(null); openBook(book, "blueprint");
  };
  const goWorkspace = () => { saveNow(); setView("workspace"); setActiveBookId(null); setExportOpen(false); };

  if (activeBook && view === "blueprint") return <><BlueprintView book={activeBook} onBack={goWorkspace} onStartWriting={() => setView("chapters")} onChange={updateBook} />{exportOpen && <ExportCenter book={activeBook} onClose={() => setExportOpen(false)} />}</>;
  if (activeBook && view === "chapters") return <><ChapterStudio book={activeBook} lastSaved={lastSaved} onSave={() => saveNow()} onBack={goWorkspace} onBlueprint={() => setView("blueprint")} onChange={updateBook} onExport={() => setExportOpen(true)} />{exportOpen && <ExportCenter book={activeBook} onClose={() => setExportOpen(false)} />}</>;
  return <div className="app-shell"><header className="main-header page-shell"><button className="brand" onClick={goWorkspace}><span className="brand-mark">CL</span><span><strong>Clarity Loop</strong><small>AI BOOK STUDIO</small></span></button><nav className={mobileMenu ? "open" : ""}><button className="active"><PenLine size={16} /> Author Workspace</button><button onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}><BookOpenText size={16} /> Book Templates</button><button><CircleHelp size={16} /> Help</button></nav><div className="header-action"><button className="new-book-nav" onClick={() => openWizard()}><Sparkles size={15} /> New Book</button><button className="menu-button" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</button></div></header><AuthorWorkspace books={books} onOpen={openBook} onCreate={openWizard} /><footer><div className="page-shell footer-inner"><div className="brand brand-light"><span className="brand-mark">CL</span><span><strong>Clarity Loop</strong><small>AI BOOK STUDIO</small></span></div><p>Developed by <strong>ETL GIS Consulting LLC</strong></p><small>© ETL GIS Consulting LLC. All rights reserved.</small></div></footer>{wizardOpen && <NewBookWizard key={selectedTemplate?.id ?? "blank"} initialTemplate={selectedTemplate} onClose={() => { setWizardOpen(false); setSelectedTemplate(null); }} onCreate={createBook} />}</div>;
}
