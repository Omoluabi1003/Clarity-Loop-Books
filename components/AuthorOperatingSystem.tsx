"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, BarChart3, Check, ChevronRight, CircleDollarSign, Copy, Globe2, Headphones, Languages, MailPlus, Megaphone, MonitorSmartphone, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import type { Book } from "@/lib/types";
import { analyzeManuscriptIntelligence, buildAuthorBrain, getAuthorNextAction, getPublishingChecklist } from "@/lib/author-os";
import { buildPublicBookPreview, encodeBookPreview } from "@/lib/book-preview";

interface Props {
  book: Book;
  books: Book[];
  onNavigate: (book: Book, action: "blueprint" | "chapters" | "author_success") => void;
}

const offers = [
  { icon: Headphones, name: "Audiobook studio", detail: "Narration-ready script + production", price: "From $149" },
  { icon: Languages, name: "Book translation", detail: "Localized edition with tone review", price: "From $99" },
  { icon: MonitorSmartphone, name: "Author website", detail: "Profile, book page, and email capture", price: "From $129" },
  { icon: Megaphone, name: "Marketing kit", detail: "Launch emails, social assets, and pitches", price: "From $79" },
];

export function AuthorOperatingSystem({ book, books, onNavigate }: Props) {
  const intelligence = useMemo(() => analyzeManuscriptIntelligence(book), [book]);
  const nextAction = useMemo(() => getAuthorNextAction(book), [book]);
  const authorBrain = useMemo(() => buildAuthorBrain(books), [books]);
  const checklist = useMemo(() => getPublishingChecklist(book), [book]);
  const [copied, setCopied] = useState(false);
  const completed = checklist.filter((item) => item.complete).length;

  const sharePreview = async () => {
    const payload = encodeBookPreview(buildPublicBookPreview(book));
    const url = `${window.location.origin}/preview/${book.id}?book=${payload}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  const runNextAction = () => {
    if (nextAction.action === "preview") void sharePreview();
    else onNavigate(book, nextAction.action);
  };

  return <section className="author-os page-shell" aria-labelledby="author-os-title">
    <div className="author-os-heading">
      <div><p className="eyebrow"><Sparkles size={14} /> AUTHOR OPERATING SYSTEM</p><h2 id="author-os-title">Your next book is only part of the plan.</h2><p>Write, improve, publish, grow an audience, and build revenue from one author command center.</p></div>
      <div className="author-os-identity"><span>{book.authorName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><small>AUTHOR PORTFOLIO</small><strong>{authorBrain.projectCount} {authorBrain.projectCount === 1 ? "book" : "books"} · memory {authorBrain.memoryStrength}%</strong></div></div>
    </div>

    <article className="author-brain-card">
      <div><p className="eyebrow"><Sparkles size={14} /> AUTHOR BRAIN</p><h3>Your creative memory gets smarter with every project.</h3><p>Clarity Loop remembers your recurring voice, reader, and themes so returning work starts with context—not a blank prompt.</p></div>
      <dl><div><dt>Preferred tone</dt><dd>{authorBrain.preferredTone}</dd></div><div><dt>Writing style</dt><dd>{authorBrain.preferredWritingStyle}</dd></div><div><dt>Primary audience</dt><dd>{authorBrain.primaryAudience}</dd></div><div><dt>Next-book signal</dt><dd>{authorBrain.nextBookRecommendation}</dd></div></dl>
      <div className="author-brain-themes">{authorBrain.favoriteThemes.map((theme) => <span key={theme}>{theme}</span>)}</div>
    </article>

    <div className="author-os-grid">
      <article className="author-os-card next-action-card">
        <div className="os-card-label"><span><WandSparkles size={16} /> NEXT BEST ACTION</span><b>Recommended</b></div>
        <h3>{nextAction.label}</h3><p>{nextAction.detail}</p>
        <button className="primary-button" type="button" onClick={runNextAction}>{nextAction.action === "preview" ? "Copy preview link" : "Continue now"}<ArrowRight size={16} /></button>
        <div className="momentum-row"><span><strong>{book.progress}%</strong> manuscript progress</span><span><strong>{book.actualWords.toLocaleString()}</strong> words written</span></div>
      </article>

      <article className="author-os-card intelligence-card">
        <div className="os-card-label"><span><ShieldCheck size={16} /> MANUSCRIPT INTELLIGENCE</span><b className="live-pill">Live</b></div>
        <div className="readiness-score"><div style={{ "--score": `${intelligence.publishReadyScore * 3.6}deg` } as React.CSSProperties}><strong>{intelligence.publishReadyScore}</strong><small>/100</small></div><span><b>Publish-ready score</b><small>{intelligence.publishReadyScore >= 80 ? "Strong foundation" : "Improvement opportunities found"}</small></span></div>
        <div className="signal-list">{intelligence.signals.map((signal) => <div key={signal.label}><span><b>{signal.label}</b><strong>{signal.score}</strong></span><i><em style={{ width: `${signal.score}%` }} /></i></div>)}</div>
        <button type="button" className="os-text-action" onClick={() => onNavigate(book, "chapters")}>Review {intelligence.recommendations.length} recommendations <ChevronRight size={15} /></button>
      </article>

      <article className="author-os-card checklist-card">
        <div className="os-card-label"><span><BadgeCheck size={16} /> PUBLISHING CHECKLIST</span><b>{completed}/{checklist.length}</b></div>
        <h3>Move from manuscript to market</h3>
        <div className="os-checklist">{checklist.map((item) => <div className={item.complete ? "complete" : ""} key={item.label}><span>{item.complete && <Check size={13} />}</span><p>{item.label}</p></div>)}</div>
        <button type="button" className="os-text-action" onClick={() => onNavigate(book, "author_success")}>Open publishing workspace <ChevronRight size={15} /></button>
      </article>

      <article className="author-os-card growth-card">
        <div className="os-card-label"><span><BarChart3 size={16} /> READER GROWTH LOOP</span><b>Beta</b></div>
        <div className="preview-mini"><div><Globe2 size={19} /><span><small>PUBLIC BOOK PREVIEW</small><strong>{book.title}</strong><em>by {book.authorName}</em></span></div><div className="preview-capture"><MailPlus size={16} /> Reader waitlist enabled</div></div>
        <p>Every shared preview can capture interested readers and carries optional Clarity Loop attribution.</p>
        <button className="secondary-button" type="button" onClick={() => void sharePreview()}>{copied ? <><Check size={16} /> Preview link copied</> : <><Copy size={16} /> Create shareable preview</>}</button>
      </article>
    </div>

    <div className="revenue-layer">
      <div className="revenue-heading"><div><p className="eyebrow"><CircleDollarSign size={14} /> PUBLISHING SERVICES</p><h3>Turn one manuscript into a complete author business.</h3></div><span>Available when you’re ready—never blocks writing.</span></div>
      <div className="offer-grid">{offers.map(({ icon: Icon, name, detail, price }) => <button type="button" key={name}><span><Icon size={19} /></span><div><strong>{name}</strong><small>{detail}</small></div><b>{price}</b><ChevronRight size={16} /></button>)}</div>
    </div>
  </section>;
}
