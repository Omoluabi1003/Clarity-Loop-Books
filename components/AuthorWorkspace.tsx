"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookCheck,
  BookMarked,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleDot,
  FileCheck2,
  Gauge,
  Lightbulb,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WandSparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Book, BookTemplate, CreationPathId } from "@/lib/types";
import { visibleBooks as getVisibleBooks } from "@/lib/persistence";
import { analyzeManuscriptIntelligence, getAuthorNextAction } from "@/lib/author-os";
import { BookCard } from "./BookCard";
import { BrandMark } from "./BrandMark";
import { CreationPathSelector } from "./CreationPathSelector";

interface Props {
  books: Book[];
  onOpen: (book: Book, view: "blueprint" | "chapters") => void;
  onCreate: (template?: BookTemplate) => void;
  onDelete: (book: Book) => void;
  onCreatePath: (path: CreationPathId) => void;
  onAuthorSuccess: (book?: Book) => void;
  onRename: (book: Book, title: string) => void;
  onDuplicate: (book: Book) => void;
  onArchive: (book: Book) => void;
}

const journey = [
  { label: "Create", detail: "Shape the idea" },
  { label: "Position", detail: "Find the market" },
  { label: "Write", detail: "Build the manuscript" },
  { label: "Publish", detail: "Prepare every format" },
  { label: "Grow", detail: "Reach more readers" },
];

const sampleIdeas = [
  "A practical guide to leading without burnout",
  "A memoir about rebuilding after a career change",
  "A field guide for first-time nonprofit founders",
];

function IntelligencePreview({ onStart }: { onStart: () => void }) {
  const [idea, setIdea] = useState(sampleIdeas[0]);
  const [analyzedIdea, setAnalyzedIdea] = useState(sampleIdeas[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const scores = useMemo(() => {
    const seed = analyzedIdea.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return {
      opportunity: 78 + (seed % 12),
      title: 72 + (seed % 17),
      readiness: 64 + (seed % 14),
      length: 42 + (seed % 10),
    };
  }, [analyzedIdea]);

  const analyze = () => {
    if (!idea.trim()) return;
    setIsAnalyzing(true);
    window.setTimeout(() => {
      setAnalyzedIdea(idea.trim());
      setIsAnalyzing(false);
    }, 520);
  };

  return (
    <div className="os-intelligence-preview" aria-label="Interactive book intelligence preview">
      <div className="preview-window-bar">
        <span><i /><i /><i /></span>
        <p><BrainCircuit size={14} /> Clarity Intelligence</p>
        <b>LIVE PREVIEW</b>
      </div>
      <div className="preview-query">
        <label htmlFor="book-idea-preview">What do you want to write?</label>
        <div>
          <input id="book-idea-preview" value={idea} onChange={(event) => setIdea(event.target.value)} onKeyDown={(event) => event.key === "Enter" && analyze()} />
          <button type="button" onClick={analyze} disabled={isAnalyzing || !idea.trim()} aria-label="Analyze book idea">
            {isAnalyzing ? <span className="preview-spinner" /> : <WandSparkles size={17} />}
            <span>Analyze</span>
          </button>
        </div>
      </div>
      <div className={`preview-results${isAnalyzing ? " is-analyzing" : ""}`}>
        <div className="preview-score-primary">
          <div style={{ "--preview-score": `${scores.opportunity * 3.6}deg` } as React.CSSProperties}>
            <strong>{scores.opportunity}</strong><small>/100</small>
          </div>
          <span><small>MARKET OPPORTUNITY</small><strong>Promising niche</strong><em>Clear reader pain + durable demand</em></span>
        </div>
        <div className="preview-signal-grid">
          <article><Users size={17} /><span><small>Audience</small><strong>Defined & reachable</strong><em>Mid-career leaders</em></span><Check size={15} /></article>
          <article><Target size={17} /><span><small>Title strength</small><strong>{scores.title}/100</strong><em>Benefit is immediately clear</em></span><b>{scores.title}</b></article>
          <article><BookMarked size={17} /><span><small>Recommended length</small><strong>{scores.length},000 words</strong><em>8–10 focused chapters</em></span><Check size={15} /></article>
          <article><FileCheck2 size={17} /><span><small>Publishing readiness</small><strong>{scores.readiness}/100</strong><em>Positioning needs one decision</em></span><b>{scores.readiness}</b></article>
        </div>
      </div>
      <div className="preview-insight"><Sparkles size={15} /><p><strong>AI insight:</strong> Lead with the transformation, then support it with a practical 30-day framework.</p></div>
      <button className="preview-convert" type="button" onClick={onStart}>Build this book <ArrowRight size={16} /></button>
    </div>
  );
}

export function AuthorWorkspace({ books, onOpen, onCreate, onDelete, onCreatePath, onAuthorSuccess, onRename, onDuplicate, onArchive }: Props) {
  const visibleBooks = getVisibleBooks(books);
  const current = visibleBooks[0];
  const intelligence = current ? analyzeManuscriptIntelligence(current) : null;
  const nextAction = current ? getAuthorNextAction(current) : null;
  const completedChapters = current?.chapters.filter((chapter) => Boolean(chapter.content.trim())).length ?? 0;

  return (
    <main className="author-os-home">
      <section className="os-hero page-shell">
        <motion.div className="os-hero-copy" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
          <p className="os-kicker"><Sparkles size={14} /> BUILT FOR THE WHOLE AUTHOR JOURNEY</p>
          <h1>Your AI Author<br /><em>Operating System.</em></h1>
          <p className="os-hero-lede">Create, position, publish, market, and grow from one intelligent platform.</p>
          <div className="os-hero-actions">
            <button className="os-primary-cta" type="button" onClick={() => onCreate()}><Sparkles size={17} /> Start Your Book <ArrowRight size={17} /></button>
            <button className="os-secondary-cta" type="button" onClick={() => document.getElementById("intelligence-preview")?.scrollIntoView({ behavior: "smooth" })}>Watch a Book Built in 30 Seconds <ChevronRight size={16} /></button>
          </div>
          <div className="os-confidence-row">
            <span><Check size={13} /> No prompt engineering</span>
            <span><Check size={13} /> Your work stays editable</span>
            <span><Check size={13} /> Intelligence at every step</span>
          </div>
        </motion.div>
        <motion.div id="intelligence-preview" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, delay: .1 }}>
          <IntelligencePreview onStart={() => onCreate()} />
        </motion.div>
      </section>

      <section className="os-journey" aria-label="The complete author journey">
        <div className="page-shell">
          <p>ONE CONNECTED SYSTEM</p>
          <div>{journey.map((step, index) => <article key={step.label}><span>{index + 1}</span><div><strong>{step.label}</strong><small>{step.detail}</small></div>{index < journey.length - 1 && <ArrowRight size={14} />}</article>)}</div>
        </div>
      </section>

      <details className="os-creation-paths">
        <summary><span><Sparkles size={14} /> Have more than an idea?</span><strong>Explore 7 tailored creation paths <ChevronRight size={15} /></strong></summary>
        <CreationPathSelector onSelect={onCreatePath} />
      </details>

      {current && intelligence && nextAction && (
        <section className="os-command-center page-shell" id="workspace">
          <div className="os-section-heading">
            <div><p className="os-kicker"><Gauge size={14} /> AUTHOR COMMAND CENTER</p><h2>Good {new Date().getUTCHours() < 17 ? "morning" : "evening"}, {current.authorName.split(" ")[0]}.</h2><p>Here is what matters most across your author business right now.</p></div>
            <button type="button" className="os-quiet-button" onClick={() => onOpen(current, "chapters")}>Open workspace <ArrowRight size={15} /></button>
          </div>

          <div className="os-command-grid">
            <article className="os-command-card os-next-action">
              <div className="os-card-top"><span><WandSparkles size={15} /> RECOMMENDED NEXT ACTION</span><b>Highest impact</b></div>
              <h3>{nextAction.label}</h3><p>{nextAction.detail}</p>
              <button type="button" onClick={() => onOpen(current, nextAction.action === "blueprint" ? "blueprint" : "chapters")}>Continue now <ArrowRight size={15} /></button>
            </article>
            <article className="os-command-card os-readiness-card">
              <div className="os-card-top"><span><BookCheck size={15} /> PUBLISHING READINESS</span><b>Live</b></div>
              <div className="os-big-score"><strong>{intelligence.publishReadyScore}</strong><span>/100<small>{intelligence.publishReadyScore >= 80 ? "Ready to review" : "Building momentum"}</small></span></div>
              <i><em style={{ width: `${intelligence.publishReadyScore}%` }} /></i>
            </article>
            <article className="os-command-card os-author-score">
              <div className="os-card-top"><span><TrendingUp size={15} /> AUTHOR SCORE</span></div>
              <div className="os-big-score"><strong>{Math.min(96, 61 + visibleBooks.length * 7 + completedChapters * 2)}</strong><span>/100<small>Up 8 points this month</small></span></div>
              <p>Consistency and manuscript clarity are strengthening.</p>
            </article>
            <article className="os-command-card os-market-card">
              <div className="os-card-top"><span><BarChart3 size={15} /> MARKET OPPORTUNITY</span><b>Strong</b></div>
              <h3>Practical clarity for busy professionals</h3><p>Your topic sits at the intersection of decision-making, confidence, and sustainable performance.</p>
              <button type="button" onClick={() => onAuthorSuccess(current)}>View opportunity <ChevronRight size={15} /></button>
            </article>
          </div>

          <div className="os-detail-grid" id="intelligence">
            <article className="os-detail-panel">
              <div className="os-panel-heading"><span><BrainCircuit size={18} /></span><div><small>AUTHOR BRAIN</small><h3>Your creative operating profile</h3></div><b>Learning</b></div>
              <dl>
                <div><dt>Preferred writing style</dt><dd>{current.writingStyle}</dd></div>
                <div><dt>Audience profile</dt><dd>{current.targetAudience}</dd></div>
                <div><dt>Most successful topic</dt><dd>{current.bookDna.themes?.[0] ?? "Practical transformation"}</dd></div>
                <div><dt>Current manuscript focus</dt><dd>{current.bookDna.promise}</dd></div>
                <div className="os-suggested-project"><dt><Lightbulb size={14} /> Suggested next project</dt><dd>A companion workbook that turns each chapter into a weekly practice.</dd></div>
              </dl>
            </article>

            <article className="os-detail-panel os-book-intelligence">
              <div className="os-panel-heading"><span><Search size={18} /></span><div><small>BOOK INTELLIGENCE</small><h3>Why your manuscript is scoring this way</h3></div><button type="button" onClick={() => onOpen(current, "chapters")}>Review</button></div>
              <div className="os-intelligence-signals">{intelligence.signals.map((signal, index) => <div key={signal.label}><span><i>{index === 0 ? <Sparkles size={13} /> : <CircleDot size={12} />}</i><strong>{signal.label}</strong></span><em><b style={{ width: `${signal.score}%` }} /></em><small>{signal.score}</small></div>)}</div>
              <div className="os-reasoning-note"><BrainCircuit size={16} /><p><strong>Clarity recommendation:</strong> {intelligence.recommendations[0] ?? "Keep developing each chapter against the reader promise."}</p></div>
            </article>
          </div>
        </section>
      )}

      <section className="os-books-section" id="books">
        <div className="page-shell">
          <div className="os-section-heading">
            <div><p className="os-kicker"><BookMarked size={14} /> YOUR BOOKS</p><h2>Pick up where you left off.</h2><p>Every manuscript, decision, and insight stays connected.</p></div>
            <button type="button" className="os-primary-cta compact" onClick={() => onCreate()}>Create New Book</button>
          </div>
          <div className="books-grid os-books-grid">{visibleBooks.map((book) => <BookCard book={book} onOpen={() => onOpen(book, "chapters")} onDelete={() => onDelete(book)} onRename={(title) => onRename(book, title)} onDuplicate={() => onDuplicate(book)} onArchive={() => onArchive(book)} key={book.id} />)}<button type="button" className="blank-book" onClick={() => onCreate()}><span><Plus size={24} /></span><strong>Start your next book</strong><small>Turn an idea into an intelligent blueprint.</small></button></div>
        </div>
      </section>

      <section className="os-final-cta page-shell" id="publishing">
        <BrandMark priority />
        <div><p className="os-kicker"><Sparkles size={14} /> ONE SYSTEM. EVERY STAGE.</p><h2>Your book is bigger than a manuscript.</h2><p>Build the book, understand the market, prepare to publish, and create what comes next.</p></div>
        <button className="os-primary-cta" type="button" onClick={() => onCreate()}>Start Your Book <ArrowRight size={17} /></button>
      </section>
    </main>
  );
}
