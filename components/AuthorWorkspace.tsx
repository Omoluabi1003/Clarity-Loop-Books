"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookMarked, FileCheck2, Plus, Sparkles } from "lucide-react";
import type { Book, BookTemplate, CreationPathId } from "@/lib/types";
import { visibleBooks as getVisibleBooks } from "@/lib/persistence";
import { BookCard } from "./BookCard";
import { EngineeringShowcase } from "./EngineeringShowcase";
import { HeroBookDemo } from "./HeroBookDemo";
import { PublishingPack } from "./PublishingPack";
import { TemplateSelector } from "./TemplateSelector";
import { CreationPathSelector } from "./CreationPathSelector";
import { StudioDirectory } from "./StudioDirectory";

interface Props {
  books: Book[];
  onOpen: (book: Book, view: "blueprint" | "chapters") => void;
  onCreate: (template?: BookTemplate) => void;
  onDelete: (book: Book) => void;
  onCreatePath: (path: CreationPathId) => void;
}

export function AuthorWorkspace({ books, onOpen, onCreate, onDelete, onCreatePath }: Props) {
  const visibleBooks = getVisibleBooks(books);
  const current = visibleBooks[0];

  return (
    <main>
      <section className="studio-hero page-shell">
        <div className="studio-hero-atmosphere" aria-hidden="true"><span /><span /><span /><i /><i /></div>
        <motion.div className="studio-hero-copy" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
          <p className="eyebrow"><Sparkles size={14} /> FROM FIRST THOUGHT TO FINISHED BOOK</p>
          <h1>Turn Your Idea Into a <em>Published Book.</em></h1>
          <p className="hero-lede">Clarity Loop helps you create a blueprint, chapters, manuscript, and publishing-ready export from one guided workspace.</p>
          <div className="hero-actions">
            <button type="button" className="primary-button hero-primary" onClick={() => onCreate()}><Plus size={18} /> Start Your Book</button>
            <button type="button" className="secondary-button" onClick={() => document.getElementById("book-build")?.scrollIntoView({ behavior: "smooth" })}>Watch the Book Build <ArrowRight size={16} /></button>
          </div>
          <div className="trust-line"><span><FileCheck2 size={15} /> Your ideas stay editable</span><i /><span>Designed for real authors, not prompt engineers</span></div>
          <div className="hero-studio-proof" aria-label="Studio capabilities">
            <span><strong>07</strong><small>Creative paths</small></span>
            <span><strong>01</strong><small>Connected studio</small></span>
            <span><strong>100%</strong><small>Creator controlled</small></span>
          </div>
        </motion.div>
        <motion.div id="book-build" initial={false} animate={{ opacity: 1, x: 0 }} transition={{ duration: .75, delay: .12 }}>
          <HeroBookDemo onStart={() => onCreate()} />
        </motion.div>
      </section>

      <section className="workflow-strip">
        <div className="page-shell workflow-inner">
          <p>The complete publishing journey</p>
          {['Idea', 'Blueprint', 'Chapters', 'Manuscript', 'Export'].map((step, index) => <span key={step}><b>{index + 1}</b>{step}{index < 4 && <ArrowRight size={14} />}</span>)}
        </div>
      </section>

      <CreationPathSelector onSelect={onCreatePath} />
      <StudioDirectory />

      <section className="workspace-section page-shell studio-dark-section" id="workspace">
        <div className="workspace-intro">
          <div><p className="eyebrow studio-eyebrow">MY BOOKS</p><h2 className="studio-dark-heading">What book would you like to create today?</h2><p className="studio-dark-body">Begin something new or return to the manuscript already waiting for you.</p></div>
          <div className="workspace-actions"><button type="button" className="primary-button" onClick={() => onCreate()}><Plus size={17} /> Create New Book</button>{current && <button type="button" className="secondary-button" onClick={() => onOpen(current, "chapters")}><BookMarked size={17} /> Continue Writing</button>}</div>
        </div>
        <div className="section-heading manuscript-heading"><div><p className="eyebrow studio-eyebrow">ON YOUR WRITING DESK</p><h3 className="studio-dark-subheading">Books in progress</h3></div>{current && <button type="button" className="text-button studio-text-button-on-dark" onClick={() => onOpen(current, "blueprint")}>Review latest blueprint <ArrowRight size={15} /></button>}</div>
        <div className="books-grid">{visibleBooks.map((book) => <BookCard book={book} onOpen={() => onOpen(book, "chapters")} onDelete={() => onDelete(book)} key={book.id} />)}<button type="button" className="blank-book" onClick={() => onCreate()}><span><Plus size={24} /></span><strong>Begin a new book</strong><small>Start with an idea, title, or message.</small></button></div>
      </section>

      <section className="method-section">
        <div className="page-shell method-grid">
          <motion.div className="method-heading" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="eyebrow">THE CLARITY LOOP METHOD</p><h2>A book-sized dream,<br /><em>made manageable.</em></h2><p>Every stage gives you something clear to review, refine, and approve. You are always the author.</p></motion.div>
          <div className="method-steps">
            {[['01', 'Shape the promise', 'Clarify the reader, message, tone, and transformation before writing.'], ['02', 'Build before you draft', 'Review the full table of contents and chapter-by-chapter plan.'], ['03', 'Write with continuity', 'Draft one chapter at a time while Book DNA protects your voice.'], ['04', 'Prepare to publish', 'Turn the manuscript into book files and launch-ready copy.']].map(([number, title, copy], index) => <motion.article key={number} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * .08 }} viewport={{ once: true }}><b>{number}</b><span><strong>{title}</strong><p>{copy}</p></span></motion.article>)}
          </div>
        </div>
      </section>

      <div className="page-shell"><TemplateSelector onSelect={onCreate} /></div>
      <EngineeringShowcase />
      <PublishingPack onStart={() => onCreate()} />

      <section className="final-cta">
        <div className="page-shell final-cta-inner"><span className="final-ornament">CL</span><p className="eyebrow">YOUR BOOK IS WAITING</p><h2>You already have the idea.<br /><em>Now give it a spine.</em></h2><p>No complicated prompts. No scattered documents. Just one beautiful, guided path from thought to finished book.</p><button type="button" className="gold-button" onClick={() => onCreate()}>Start Your Book <ArrowRight size={16} /></button><small>Developed by ETL GIS Consulting LLC</small></div>
      </section>
    </main>
  );
}
