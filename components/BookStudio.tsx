"use client";

import { BookOpenText, CircleHelp, LogIn, LogOut, Menu, PenLine, Sparkles, UserPlus, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateBookBudget, recalculateBook } from "@/lib/book-budget";
import { deleteBookFromState, LEGACY_STORAGE_KEYS, parseStudioState, serializeStudioState, STORAGE_KEY } from "@/lib/persistence";
import { generateCoverPrompt } from "@/lib/ai";
import { AUTH_ACCOUNTS_KEY, AUTH_SESSION_KEY, parseAccounts, parseSession, serializeSession, type AuthUser, type StoredAccount } from "@/lib/auth";
import { sampleBooks } from "@/lib/templates";
import { getGenreProfile } from "@/lib/genre-intelligence";
import type { BetaFeedback, Book, BookForm, BookTemplate, CreationPathId, ExportFormat } from "@/lib/types";
import { AuthorWorkspace } from "./AuthorWorkspace";
import { BetaFeedbackPanel } from "./BetaFeedbackPanel";
import { BlueprintView } from "./BlueprintView";
import { ChapterStudio } from "./ChapterStudio";
import { ExportCenter } from "./ExportCenter";
import { NewBookWizard } from "./NewBookWizard";
import { DeleteDraftModal } from "./DeleteDraftModal";
import { AuthDialog } from "./AuthDialog";

type View = "workspace" | "blueprint" | "chapters";
type AuthMode = "signin" | "signup";

function hydrateBook(raw: Book): Book {
  const wordsPerPage = raw.wordsPerPage || 275;
  const targetPageCount = raw.targetPageCount || 180;
  const chapterCount = raw.chapters?.length || raw.chapterCount || 10;
  const targetWords = raw.targetWords || targetPageCount * wordsPerPage;
  const chapters = (raw.chapters || []).map((chapter) => ({ ...chapter, selectedTitle: chapter.selectedTitle || chapter.title, actualWordCount: chapter.actualWordCount ?? (chapter.content.trim() ? chapter.content.trim().split(/\s+/).length : 0) }));
  const genreProfile = raw.bookDna.genreProfile || getGenreProfile(raw.genre);
  return recalculateBook({
    ...raw,
    bookDna: { ...raw.bookDna, bookType: raw.bookDna.bookType || raw.genre, genreProfile, creativeMode: raw.bookDna.creativeMode || genreProfile.creativeMode, readerExperience: raw.bookDna.readerExperience || genreProfile.readerExpectation, narrativeMode: raw.bookDna.narrativeMode || genreProfile.narrativeStructure, requiredElements: raw.bookDna.requiredElements || genreProfile.requiredElements, forbiddenPatterns: raw.bookDna.forbiddenPatterns || genreProfile.forbiddenPatterns, toneGuidance: raw.bookDna.toneGuidance || genreProfile.toneGuidance, chapterStructureHint: raw.bookDna.chapterStructureHint || genreProfile.narrativeStructure, openingStyleOptions: raw.bookDna.openingStyleOptions || genreProfile.openingStyles },
    authorName: raw.authorName || "Author name needed",
    authorBio: raw.authorBio || "",
    wordsPerPage,
    targetWords,
    averageWordsPerChapter: raw.averageWordsPerChapter || Math.round(targetWords / chapterCount),
    actualWords: raw.actualWords || 0,
    actualEstimatedPages: raw.actualEstimatedPages || 0,
    qualityScore: raw.qualityScore ?? 0,
    exportHistory: raw.exportHistory || [],
    coverPrompt: raw.coverPrompt || "Professional cover concept pending review.",
    status: ["draft", "in_progress", "completed"].includes(raw.status as string) ? "drafting" : raw.status,
    deletedAt: raw.deletedAt || null,
    qualityFlags: raw.qualityFlags || [],
    chapters,
    versionHistory: raw.versionHistory || [],
  });
}

export function BookStudio() {
  const [books, setBooks] = useState<Book[]>(() => sampleBooks.map(hydrateBook));
  const [feedback, setFeedback] = useState<BetaFeedback[]>([]);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [view, setView] = useState<View>("workspace");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BookTemplate | null>(null);
  const [creationPath, setCreationPath] = useState<CreationPathId>("start_from_idea");
  const [exportOpen, setExportOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [lastSaved, setLastSaved] = useState("Not saved yet");
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [toast, setToast] = useState("");
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const booksRef = useRef(books);
  const feedbackRef = useRef(feedback);
  const storageReady = useRef(false);
  const activeBook = useMemo(() => books.find((book) => book.id === activeBookId), [books, activeBookId]);

  useEffect(() => { booksRef.current = books; }, [books]);
  useEffect(() => { feedbackRef.current = feedback; }, [feedback]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
      if (saved) {
        try { const state = parseStudioState(saved); setBooks(state.books.map(hydrateBook)); setFeedback(state.feedback); }
        catch { console.warn("Saved projects could not be loaded; starter data remains available."); }
      }
      const savedAccounts = parseAccounts(localStorage.getItem(AUTH_ACCOUNTS_KEY));
      setAccounts(savedAccounts);
      setAuthUser(parseSession(localStorage.getItem(AUTH_SESSION_KEY), savedAccounts));
      storageReady.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const save = () => {
      if (!storageReady.current) return;
      localStorage.setItem(STORAGE_KEY, serializeStudioState(booksRef.current, feedbackRef.current));
      setLastSaved(`Autosaved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    };
    const interval = window.setInterval(save, 15_000);
    window.addEventListener("beforeunload", save);
    return () => { window.clearInterval(interval); window.removeEventListener("beforeunload", save); };
  }, []);

  const saveNow = (nextBooks = booksRef.current) => {
    localStorage.setItem(STORAGE_KEY, serializeStudioState(nextBooks, feedbackRef.current));
    setLastSaved("Saved just now");
  };
  const openBook = (book: Book, target: "blueprint" | "chapters") => { setActiveBookId(book.id); setView(target); window.scrollTo(0, 0); };
  const openWizard = (template?: BookTemplate) => { setCreationPath("start_from_idea"); setSelectedTemplate(template ?? null); setWizardOpen(true); };
  const openCreationPath = (path: CreationPathId) => { setCreationPath(path); setSelectedTemplate(null); setWizardOpen(true); };
  const updateBook = (next: Book) => setBooks((current) => {
    const recalculated = recalculateBook({ ...next, updatedAt: new Date().toISOString() });
    const updated = current.map((book) => book.id === next.id ? recalculated : book);
    booksRef.current = updated;
    if (storageReady.current) { localStorage.setItem(STORAGE_KEY, serializeStudioState(updated, feedbackRef.current)); setLastSaved("Saved just now"); }
    return updated;
  });
  const deleteBook = (permanent: boolean) => {
    if (!bookToDelete) return;
    const next = deleteBookFromState(booksRef.current, bookToDelete.id, permanent);
    booksRef.current = next;
    setBooks(next);
    saveNow(next);
    if (activeBookId === bookToDelete.id) { setActiveBookId(null); setView("workspace"); }
    setBookToDelete(null);
    setToast("Draft deleted from Books in Progress.");
    window.setTimeout(() => setToast(""), 3500);
  };
  const createBook = async (form: BookForm) => {
    const response = await fetch("/api/blueprint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!response.ok) throw new Error("Blueprint failed");
    const data = await response.json();
    const budget = calculateBookBudget(form);
    const id = `book-${Date.now()}`;
    const now = new Date().toISOString();
    const base: Book = {
      id, projectType: form.projectType || "idea", originalManuscript: form.sourceText || undefined, title: form.title, subtitle: form.subtitle || "", authorName: form.authorName, authorBio: form.authorBio,
      authorEmail: form.authorEmail, authorWebsite: form.authorWebsite, publisherCredit: form.publisherCredit,
      idea: form.idea, genre: form.genre, targetAudience: form.targetAudience, tone: form.tone, writingStyle: form.writingStyle,
      chapterCount: budget.chapterCount, targetPageCount: budget.targetPages, wordsPerPage: budget.wordsPerPage,
      targetWords: budget.targetWords, averageWordsPerChapter: budget.averageWordsPerChapter, actualWords: 0, actualEstimatedPages: 0, qualityScore: 100, exportHistory: [],
      chapterSizePreference: form.chapterSizePreference, aiAssistanceLevel: form.aiAssistanceLevel, status: "blueprint", progress: 0,
      updatedAt: now, createdAt: now, color: "gold", coverDirection: form.coverDirection, coverPrompt: "", useDesignedCover: true, exportCoverWithBook: true, chapters: data.chapters.map((chapter: Book["chapters"][number]) => ({ ...chapter, bookId: id })),
      bookDna: data.bookDna, confirmedCreativeIntent: form.confirmedCreativeIntent, creativeIntentReport: data.creativeIntentReport, genreAlignmentScore: data.genreAlignmentScore, genreWarnings: data.genreWarnings || [],
      versionHistory: [now],
    };
    const book = { ...base, coverPrompt: generateCoverPrompt(base) };
    const next = [book, ...booksRef.current];
    booksRef.current = next;
    setBooks(next);
    saveNow(next);
    setWizardOpen(false); setSelectedTemplate(null); openBook(book, "blueprint");
  };
  const submitFeedback = (entry: BetaFeedback) => { const next = [entry, ...feedbackRef.current]; feedbackRef.current = next; setFeedback(next); localStorage.setItem(STORAGE_KEY, serializeStudioState(booksRef.current, next)); };
  const recordExport = (format: ExportFormat) => { if (!activeBook) return; updateBook({ ...activeBook, status: "exported", exportHistory: [{ id: `export-${Date.now()}`, bookId: activeBook.id, format, status: "completed", fileUrl: "browser-download", errorMessage: "", createdAt: new Date().toISOString() }, ...(activeBook.exportHistory || [])] }); };
  const goWorkspace = () => { saveNow(); setView("workspace"); setActiveBookId(null); setExportOpen(false); };
  const finishAuthentication = (user: AuthUser, nextAccounts: StoredAccount[]) => {
    localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(nextAccounts));
    localStorage.setItem(AUTH_SESSION_KEY, serializeSession(user));
    setAccounts(nextAccounts);
    setAuthUser(user);
    setAuthMode(null);
    setToast(`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}. Your studio is ready.`);
    window.setTimeout(() => setToast(""), 3500);
  };
  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setMobileMenu(false);
  };
  const signOut = () => {
    saveNow();
    localStorage.removeItem(AUTH_SESSION_KEY);
    setAuthUser(null);
    setMobileMenu(false);
    setToast("You have signed out of this browser.");
    window.setTimeout(() => setToast(""), 3500);
  };
  const projectManagementOverlays = <>{toast && <div className="success-toast" role="status">{toast}</div>}{bookToDelete && <DeleteDraftModal book={bookToDelete} onCancel={() => setBookToDelete(null)} onConfirm={deleteBook} />}</>;

  if (activeBook && view === "blueprint") return <><BlueprintView book={activeBook} onBack={goWorkspace} onStartWriting={() => setView("chapters")} onChange={updateBook} onDelete={() => setBookToDelete(activeBook)} />{projectManagementOverlays}{exportOpen && <ExportCenter book={activeBook} onClose={() => setExportOpen(false)} onExported={recordExport} />}</>;
  if (activeBook && view === "chapters") return <><ChapterStudio book={activeBook} lastSaved={lastSaved} onSave={() => saveNow()} onBack={goWorkspace} onBlueprint={() => setView("blueprint")} onChange={updateBook} onExport={() => setExportOpen(true)} onDelete={() => setBookToDelete(activeBook)} />{projectManagementOverlays}{exportOpen && <ExportCenter book={activeBook} onClose={() => setExportOpen(false)} onExported={recordExport} />}</>;
  return <div className="app-shell"><header className="main-header page-shell"><button className="brand" onClick={goWorkspace}><span className="brand-mark">CL</span><span><strong>Clarity Loop</strong><small>AI BOOK STUDIO</small></span></button><nav id="primary-navigation" className={mobileMenu ? "open" : ""}><button className="active" onClick={() => { setMobileMenu(false); document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" }); }}><PenLine size={16} /> Author Workspace</button><button onClick={() => { setMobileMenu(false); document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" }); }}><BookOpenText size={16} /> Book Templates</button><button onClick={() => { setMobileMenu(false); const launcher = document.querySelector<HTMLButtonElement>(".feedback-launcher"); if (launcher) launcher.click(); else document.querySelector<HTMLElement>(".feedback-panel")?.focus(); }}><CircleHelp size={16} /> Help</button><div className="mobile-account-actions" aria-label="Account actions">{authUser ? <><span className="mobile-account-chip" title={authUser.email}><UserRound size={16} /><span><small>Signed in as</small>{authUser.name}</span></span><button className="auth-nav-button auth-signout" onClick={signOut}><LogOut size={16} /> Sign out</button></> : <><p>Save your studio and return to your books on this device.</p><div><button className="auth-nav-button" onClick={() => openAuth("signin")}><LogIn size={16} /> Sign in</button><button className="auth-nav-button auth-create" onClick={() => openAuth("signup")}><UserPlus size={16} /> Sign up</button></div></>}</div></nav><div className="header-action"><div className="auth-actions header-auth-actions">{authUser ? <><span className="account-chip" title={authUser.email}><UserRound size={15} /><span><small>Signed in</small>{authUser.name}</span></span><button className="auth-nav-button auth-signout" onClick={signOut}><LogOut size={15} /> Sign out</button></> : <><button className="auth-nav-button" onClick={() => openAuth("signin")}><LogIn size={15} /> Sign in</button><button className="auth-nav-button auth-create" onClick={() => openAuth("signup")}><UserPlus size={15} /> Create account</button></>}</div><button className="new-book-nav" onClick={() => openWizard()}><Sparkles size={15} /> New Book</button><button className="menu-button" type="button" aria-label={mobileMenu ? "Close navigation" : "Open navigation"} aria-expanded={mobileMenu} aria-controls="primary-navigation" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</button></div></header><AuthorWorkspace books={books} onOpen={openBook} onCreate={openWizard} onCreatePath={openCreationPath} onDelete={setBookToDelete} /><footer className="studio-dark-surface"><div className="page-shell footer-inner"><div className="brand brand-light"><span className="brand-mark">CL</span><span><strong>Clarity Loop</strong><small>AI BOOK STUDIO</small></span></div><p>Developed by <strong>ETL GIS Consulting LLC</strong></p><small>© ETL GIS Consulting LLC. All rights reserved.</small></div></footer><BetaFeedbackPanel books={books} onSubmit={submitFeedback} />{projectManagementOverlays}{authMode && <AuthDialog mode={authMode} accounts={accounts} onClose={() => setAuthMode(null)} onModeChange={setAuthMode} onAuthenticated={finishAuthentication} />}{wizardOpen && <NewBookWizard key={selectedTemplate?.id ?? "blank"} initialTemplate={selectedTemplate} initialPath={creationPath} onClose={() => { setWizardOpen(false); setSelectedTemplate(null); }} onCreate={createBook} />}</div>;
}
