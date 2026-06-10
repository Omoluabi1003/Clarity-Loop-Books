"use client";

import { BookOpenText, CircleHelp, LogIn, Menu, PenLine, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateBookBudget, recalculateBook } from "@/lib/book-budget";
import { deleteBookFromState, LEGACY_STORAGE_KEYS, parseStudioState, serializeStudioState, STORAGE_KEY, visibleBooks } from "@/lib/persistence";
import { generateCoverPrompt } from "@/lib/ai";
import { sampleBooks } from "@/lib/templates";
import type { BetaFeedback, Book, BookForm, BookTemplate, CreationPathId, ExportFormat } from "@/lib/types";
import { AuthorWorkspace } from "./AuthorWorkspace";
import { BetaFeedbackPanel } from "./BetaFeedbackPanel";
import { BlueprintView } from "./BlueprintView";
import { ChapterStudio } from "./ChapterStudio";
import { ExportCenter } from "./ExportCenter";
import { NewBookWizard } from "./NewBookWizard";
import { DeleteDraftModal } from "./DeleteDraftModal";
import { useAuth } from "./account/AuthProvider";
import { AuthShell } from "./account/AuthShell";
import { SignUpForm } from "./account/SignUpForm";
import { SignInForm } from "./account/SignInForm";
import { ForgotPasswordPlaceholder } from "./account/ForgotPasswordPlaceholder";
import { PlanSelection } from "./account/PlanSelection";
import { AccountPage } from "./account/AccountPage";
import { UserMenu } from "./account/UserMenu";

type View = "workspace" | "blueprint" | "chapters";
type AccountPanel = "sign-up" | "sign-in" | "forgot" | "plans" | "account" | null;

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
  const { account, ready: authReady, signOut } = useAuth();
  const [accountPanel, setAccountPanel] = useState<AccountPanel>(null);
  const [gateMessage, setGateMessage] = useState("");
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
  const booksRef = useRef(books);
  const feedbackRef = useRef(feedback);
  const storageReady = useRef(false);
  const activeBook = useMemo(() => books.find((book) => book.id === activeBookId), [books, activeBookId]);
  const accountBooks = useMemo(() => account ? books.filter((book) => book.userId === account.id) : [], [account, books]);
  const activeProjectCount = useMemo(() => visibleBooks(accountBooks).length, [accountBooks]);
  const previewAccess = !account || account.planStatus !== "free_active" || account.selectedPlan === "free_preview";
  const showGate = (message: string) => { setGateMessage(message); window.setTimeout(() => setGateMessage(""), 6000); };

  useEffect(() => { booksRef.current = books; }, [books]);
  useEffect(() => { feedbackRef.current = feedback; }, [feedback]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
      if (saved) {
        try { const state = parseStudioState(saved); setBooks(state.books.map(hydrateBook)); setFeedback(state.feedback); }
        catch { console.warn("Saved projects could not be loaded; starter data remains available."); }
      }
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
  const openWizard = (template?: BookTemplate) => {
    if (!account) { setAccountPanel("sign-up"); return; }
    if (account.planStatus === "inactive") { setAccountPanel("plans"); return; }
    if (activeProjectCount >= 1 && previewAccess) { showGate("Free Preview includes 1 active project. Upgrade activation is coming soon."); return; }
    setCreationPath("start_from_idea"); setSelectedTemplate(template ?? null); setWizardOpen(true);
  };
  const openCreationPath = (path: CreationPathId) => {
    if (!account) { setAccountPanel("sign-up"); return; }
    if (path !== "start_from_idea" && previewAccess) { showGate("This module is part of Author Pro or Studio. Stripe activation is coming soon."); return; }
    if (activeProjectCount >= 1 && previewAccess) { showGate("Free Preview includes 1 active project. Upgrade activation is coming soon."); return; }
    setCreationPath(path); setSelectedTemplate(null); setWizardOpen(true);
  };
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
      id, userId: account?.id, projectType: form.projectType || "idea", originalManuscript: form.sourceText || undefined, title: form.title, subtitle: form.subtitle || "", authorName: form.authorName, authorBio: form.authorBio,
      authorEmail: form.authorEmail, authorWebsite: form.authorWebsite, publisherCredit: form.publisherCredit,
      idea: form.idea, genre: form.genre, targetAudience: form.targetAudience, tone: form.tone, writingStyle: form.writingStyle,
      chapterCount: budget.chapterCount, targetPageCount: budget.targetPages, wordsPerPage: budget.wordsPerPage,
      targetWords: budget.targetWords, averageWordsPerChapter: budget.averageWordsPerChapter, actualWords: 0, actualEstimatedPages: 0, qualityScore: 100, exportHistory: [],
      chapterSizePreference: form.chapterSizePreference, aiAssistanceLevel: form.aiAssistanceLevel, status: "blueprint", progress: 0,
      updatedAt: now, createdAt: now, color: "gold", coverDirection: form.coverDirection, coverPrompt: "", useDesignedCover: true, exportCoverWithBook: true, chapters: data.chapters.map((chapter: Book["chapters"][number]) => ({ ...chapter, bookId: id })),
      bookDna: { thesis: form.idea, promise: `Help ${form.targetAudience.toLowerCase()} understand and apply the central idea of ${form.title}.`, tone: form.tone, audience: form.targetAudience, readingLevel: "Clear and conversational", voice: form.writingStyle, themes: ["clarity", "growth", "meaningful change"], styleRules: ["Use welcoming, non-technical language", "Include relatable examples and case studies", "End with practical implementation and a useful takeaway"] },
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
  const goWorkspace = () => { if (storageReady.current) saveNow(); setView("workspace"); setActiveBookId(null); setExportOpen(false); };
  const handleSignOut = () => { goWorkspace(); signOut(); setAccountPanel(null); setWizardOpen(false); };
  const openPlans = () => account ? setAccountPanel("plans") : setAccountPanel("sign-up");
  const projectManagementOverlays = <>{gateMessage && <div className="gate-toast" role="alert"><strong>Studio access</strong><span>{gateMessage}</span><button onClick={openPlans}>View plans</button></div>}{toast && <div className="success-toast" role="status">{toast}</div>}{bookToDelete && <DeleteDraftModal book={bookToDelete} onCancel={() => setBookToDelete(null)} onConfirm={deleteBook} />}</>;

  if (account && activeBook && activeBook.userId === account.id && view === "blueprint") return <><BlueprintView book={activeBook} onBack={goWorkspace} onStartWriting={() => setView("chapters")} onChange={updateBook} onDelete={() => setBookToDelete(activeBook)} />{projectManagementOverlays}{exportOpen && <ExportCenter book={activeBook} onClose={() => setExportOpen(false)} onExported={recordExport} />}</>;
  if (account && activeBook && activeBook.userId === account.id && view === "chapters") return <><ChapterStudio book={activeBook} lastSaved={lastSaved} onSave={() => saveNow()} onBack={goWorkspace} onBlueprint={() => setView("blueprint")} onChange={updateBook} onExport={() => setExportOpen(true)} onDelete={() => setBookToDelete(activeBook)} />{projectManagementOverlays}{exportOpen && <ExportCenter book={activeBook} onClose={() => setExportOpen(false)} onExported={recordExport} />}</>;
  return <div className="app-shell"><header className="main-header page-shell"><button className="brand" onClick={goWorkspace}><span className="brand-mark">CL</span><span><strong>Clarity Loop</strong><small>AI BOOK STUDIO</small></span></button><nav className={mobileMenu ? "open" : ""}><button className="active"><PenLine size={16} /> Author Workspace</button><button onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}><BookOpenText size={16} /> Book Templates</button><button onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}><CircleHelp size={16} /> Plans</button></nav><div className="header-action">{authReady && (account ? <><button className="new-book-nav" onClick={() => openWizard()}><Sparkles size={15} /> New Book</button><UserMenu account={account} onAccount={() => setAccountPanel("account")} onPlan={() => setAccountPanel("plans")} onSignOut={handleSignOut} /></> : <><button className="header-sign-in" onClick={() => setAccountPanel("sign-in")}><LogIn size={15} /> Sign In</button><button className="new-book-nav" onClick={() => setAccountPanel("sign-up")}><Sparkles size={15} /> Start Free</button></>)}<button className="menu-button" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</button></div></header><AuthorWorkspace books={accountBooks} account={account} activeProjectCount={activeProjectCount} onViewPlans={openPlans} onOpen={openBook} onCreate={openWizard} onCreatePath={openCreationPath} onDelete={setBookToDelete} /><footer><div className="page-shell footer-inner"><div className="brand brand-light"><span className="brand-mark">CL</span><span><strong>Clarity Loop</strong><small>AI BOOK STUDIO</small></span></div><p>Developed by <strong>ETL GIS Consulting LLC</strong></p><small>© ETL GIS Consulting LLC. All rights reserved.</small></div></footer>{account && <BetaFeedbackPanel books={accountBooks} onSubmit={submitFeedback} />}{projectManagementOverlays}{wizardOpen && <NewBookWizard key={selectedTemplate?.id ?? "blank"} initialTemplate={selectedTemplate} initialPath={creationPath} onClose={() => { setWizardOpen(false); setSelectedTemplate(null); }} onCreate={createBook} />}{accountPanel === "sign-up" && <AuthShell eyebrow="PRIVATE BETA ACCESS" title="Your next book begins with clarity." description="Create a focused workspace for your ideas, manuscripts, and publishing assets." onClose={() => setAccountPanel(null)}><SignUpForm onSuccess={() => setAccountPanel("plans")} onSignIn={() => setAccountPanel("sign-in")} /></AuthShell>}{accountPanel === "sign-in" && <AuthShell eyebrow="CREATOR SIGN IN" title="Welcome back to the studio." description="Continue the work already waiting in your connected publishing workspace." onClose={() => setAccountPanel(null)}><SignInForm onSuccess={(signedIn) => setAccountPanel(signedIn.planStatus === "inactive" ? "plans" : null)} onSignUp={() => setAccountPanel("sign-up")} onForgot={() => setAccountPanel("forgot")} /></AuthShell>}{accountPanel === "forgot" && <AuthShell eyebrow="ACCOUNT ACCESS" title="Return to your creative work." description="Production password recovery will arrive with the permanent account system." onClose={() => setAccountPanel(null)} onBack={() => setAccountPanel("sign-in")}><ForgotPasswordPlaceholder onSignIn={() => setAccountPanel("sign-in")} /></AuthShell>}{accountPanel === "plans" && account && <AuthShell eyebrow="PLAN SELECTION" title="Build at the level your vision requires." description="Choose now and activate paid access later—without entering payment details." onClose={() => setAccountPanel(null)}><PlanSelection onComplete={() => setAccountPanel(null)} /></AuthShell>}{accountPanel === "account" && account && <AuthShell eyebrow="YOUR CLARITY LOOP ACCOUNT" title="A professional home for your work." description="Review your creator profile, intended use, and selected studio plan." onClose={() => setAccountPanel(null)}><AccountPage account={account} onPlan={() => setAccountPanel("plans")} /></AuthShell>}</div>;
}
