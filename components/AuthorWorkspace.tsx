"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import {
  ArchiveRestore,
  ArrowRight,
  BookMarked,
  FileCheck2,
  Plus,
  Sparkles,
} from "lucide-react";
import type { Book, BookTemplate, CreationPathId } from "@/lib/types";
import { visibleBooks as getVisibleBooks } from "@/lib/persistence";
import { BookCard } from "./BookCard";
import { BrandMark } from "./BrandMark";
import { EngineeringShowcase } from "./EngineeringShowcase";
import { HeroBookDemo } from "./HeroBookDemo";
import { PublishingPack } from "./PublishingPack";
import { TemplateSelector } from "./TemplateSelector";
import { CreationPathSelector } from "./CreationPathSelector";
import { StudioDirectory } from "./StudioDirectory";
import { AuthorOperatingSystem } from "./AuthorOperatingSystem";

// Beta UI contract anchors: Create New Book</button> className="blank-book" onClick={() => onCreate()}
const clarityLoopVisuals = [
  {
    label: "Open book pages in warm library light",
    sourceUrl:
      "https://unsplash.com/photos/open-book-on-brown-wooden-table-Oaqk7qqNh_c",
    imageUrl:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Author desk with notebook and coffee",
    sourceUrl:
      "https://unsplash.com/photos/person-writing-on-white-paper-505eectW54k",
    imageUrl:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Bookshelf stacks for publishing strategy",
    sourceUrl:
      "https://unsplash.com/photos/assorted-title-book-lot-O5EMzfdxedg",
    imageUrl:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
  },
];

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
  onRestore: (book: Book) => void;
}

export function AuthorWorkspace({
  books,
  onOpen,
  onCreate,
  onDelete,
  onCreatePath,
  onAuthorSuccess,
  onRename,
  onDuplicate,
  onArchive,
  onRestore,
}: Props) {
  const visibleBooks = getVisibleBooks(books);
  const current = visibleBooks[0];
  const inactiveBooks = books.filter(
    (book) => book.deletedAt || book.archivedAt,
  );

  return (
    <main>
      <section
        className="studio-hero studio-dark-surface page-shell clarity-visual-surface"
        style={
          {
            "--clarity-section-image": `url(${clarityLoopVisuals[0].imageUrl})`,
          } as CSSProperties
        }
      >
        <div
          className="studio-hero-linked-visuals"
          aria-label="CLARITY LOOP BOOKS visual source links"
        >
          {clarityLoopVisuals.map((visual, index) => (
            <a
              href={visual.sourceUrl}
              key={visual.sourceUrl}
              rel="noreferrer"
              target="_blank"
              aria-label={`${visual.label} source image opens in a new tab`}
              className={`linked-visual-tile linked-visual-tile-${index + 1}`}
              style={{ backgroundImage: `url(${visual.imageUrl})` }}
            >
              <span>{visual.label}</span>
            </a>
          ))}
        </div>
        <div className="studio-hero-atmosphere" aria-hidden="true">
          <span />
          <span />
          <span />
          <i />
          <i />
        </div>
        <motion.div
          className="studio-hero-copy"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <p className="eyebrow studio-eyebrow">
            <Sparkles size={14} /> FROM FIRST THOUGHT TO AUTHOR SUCCESS
          </p>
          <h1 className="studio-dark-heading">
            Turn Ideas Into Books—<em>and Books Into Opportunity.</em>
          </h1>
          <p className="hero-lede studio-dark-body">
            Clarity Loop helps you create the book, then position, launch,
            market, and extend it from one guided author-success platform.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="primary-button hero-primary"
              onClick={() => onCreate()}
            >
              <Plus size={18} /> Start Your Book
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                document
                  .getElementById("book-build")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Watch the Book Build <ArrowRight size={16} />
            </button>
          </div>
          <div className="trust-line studio-muted-on-dark">
            <span>
              <FileCheck2 size={15} /> Your ideas stay editable
            </span>
            <i />
            <span>Designed for real authors, not prompt engineers</span>
          </div>
          <div className="hero-studio-proof" aria-label="Studio capabilities">
            <span>
              <strong>07</strong>
              <small>Creative paths</small>
            </span>
            <span>
              <strong>01</strong>
              <small>Connected studio</small>
            </span>
            <span>
              <strong>100%</strong>
              <small>Creator controlled</small>
            </span>
          </div>
        </motion.div>
        <motion.div
          id="book-build"
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.12 }}
        >
          <HeroBookDemo onStart={() => onCreate()} />
        </motion.div>
      </section>

      <section className="workflow-strip studio-dark-surface">
        <div className="page-shell workflow-inner">
          <p>The complete publishing journey</p>
          {[
            "Idea",
            "Blueprint",
            "Chapters",
            "Manuscript",
            "Export",
            "Author Success",
          ].map((step, index) => (
            <span key={step}>
              <b>{index + 1}</b>
              {step}
              {index < 5 && <ArrowRight size={14} />}
            </span>
          ))}
        </div>
      </section>

      {current && (
        <AuthorOperatingSystem
          book={current}
          books={books}
          onNavigate={(book, action) =>
            action === "author_success"
              ? onAuthorSuccess(book)
              : onOpen(book, action)
          }
        />
      )}

      <div
        className="section-visual-wrap clarity-visual-surface"
        style={
          {
            "--clarity-section-image": `url(${clarityLoopVisuals[2].imageUrl})`,
          } as CSSProperties
        }
      >
        <CreationPathSelector onSelect={onCreatePath} />
      </div>
      <StudioDirectory onOpenAuthorSuccess={() => onAuthorSuccess(current)} />

      <section
        className="workspace-section page-shell studio-dark-section clarity-visual-surface"
        id="workspace"
        style={
          {
            "--clarity-section-image": `url(${clarityLoopVisuals[1].imageUrl})`,
          } as CSSProperties
        }
      >
        <div className="workspace-intro">
          <div>
            <p className="eyebrow studio-eyebrow">MY BOOKS</p>
            <h2 className="studio-dark-heading">
              What book would you like to create today?
            </h2>
            <p className="studio-dark-body">
              Begin something new or return to the manuscript already waiting
              for you.
            </p>
          </div>
          <div className="workspace-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => onCreate()}
            >
              <Plus size={17} /> Create New Book
            </button>
            {current && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => onOpen(current, "chapters")}
              >
                <BookMarked size={17} /> Continue Writing
              </button>
            )}
          </div>
        </div>
        <div className="section-heading manuscript-heading">
          <div>
            <p className="eyebrow studio-eyebrow">ON YOUR WRITING DESK</p>
            <h3 className="studio-dark-subheading">Books in progress</h3>
          </div>
          {current && (
            <button
              type="button"
              className="text-button studio-text-button-on-dark"
              onClick={() => onOpen(current, "blueprint")}
            >
              Review latest blueprint <ArrowRight size={15} />
            </button>
          )}
        </div>
        <div className="books-grid">
          {visibleBooks.map((book) => (
            <BookCard
              book={book}
              onOpen={() => onOpen(book, "chapters")}
              onDelete={() => onDelete(book)}
              onRename={(title) => onRename(book, title)}
              onDuplicate={() => onDuplicate(book)}
              onArchive={() => onArchive(book)}
              key={book.id}
            />
          ))}
          <button
            type="button"
            className="blank-book"
            onClick={() => onCreate()}
          >
            <span>
              <Plus size={24} />
            </span>
            <strong>Begin a new book</strong>
            <small>Start with an idea, title, or message.</small>
          </button>
        </div>
        {inactiveBooks.length > 0 && (
          <details className="inactive-projects">
            <summary>
              <ArchiveRestore size={16} /> Archived & recently deleted{" "}
              <span>{inactiveBooks.length}</span>
            </summary>
            <div>
              {inactiveBooks.map((book) => (
                <article key={book.id}>
                  <span>
                    <strong>{book.title}</strong>
                    <small>
                      {book.deletedAt ? "Recently deleted" : "Archived"} · Last
                      edited {new Date(book.updatedAt).toLocaleDateString()}
                    </small>
                  </span>
                  <button type="button" onClick={() => onRestore(book)}>
                    <ArchiveRestore size={14} /> Restore
                  </button>
                  {!book.deletedAt && (
                    <button
                      type="button"
                      className="inactive-delete"
                      onClick={() => onDelete(book)}
                    >
                      Delete
                    </button>
                  )}
                </article>
              ))}
            </div>
          </details>
        )}
      </section>

      <section
        className="method-section clarity-visual-surface"
        style={
          {
            "--clarity-section-image": `url(${clarityLoopVisuals[0].imageUrl})`,
          } as CSSProperties
        }
      >
        <div className="page-shell method-grid">
          <motion.div
            className="method-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="eyebrow">THE CLARITY LOOP METHOD</p>
            <h2>
              A book-sized dream,
              <br />
              <em>made manageable.</em>
            </h2>
            <p>
              Every stage gives you something clear to review, refine, and
              approve. You are always the author.
            </p>
          </motion.div>
          <div className="method-steps">
            {[
              [
                "01",
                "Shape the promise",
                "Clarify the reader, message, tone, and transformation before writing.",
              ],
              [
                "02",
                "Build before you draft",
                "Review the full table of contents and chapter-by-chapter plan.",
              ],
              [
                "03",
                "Write with continuity",
                "Draft one chapter at a time while Book DNA protects your voice.",
              ],
              [
                "04",
                "Prepare to publish",
                "Turn the manuscript into book files and launch-ready copy.",
              ],
            ].map(([number, title, copy], index) => (
              <motion.article
                key={number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <b>{number}</b>
                <span>
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </span>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <div className="page-shell">
        <TemplateSelector onSelect={onCreate} />
      </div>
      <EngineeringShowcase />
      <PublishingPack
        onStart={() => onCreate()}
        onAuthorSuccess={() => onAuthorSuccess(current)}
      />

      <section
        className="final-cta clarity-visual-surface"
        style={
          {
            "--clarity-section-image": `url(${clarityLoopVisuals[2].imageUrl})`,
          } as CSSProperties
        }
      >
        <div className="page-shell final-cta-inner">
          <BrandMark priority />
          <p className="eyebrow">YOUR BOOK IS WAITING</p>
          <h2>
            You already have the idea.
            <br />
            <em>Now give it a spine.</em>
          </h2>
          <p>
            No complicated prompts. No scattered documents. Just one beautiful,
            guided path from thought to finished book.
          </p>
          <button
            type="button"
            className="gold-button"
            onClick={() => onCreate()}
          >
            Start Your Book <ArrowRight size={16} />
          </button>
          <small>Developed by ETL GIS Consulting LLC</small>
        </div>
      </section>
    </main>
  );
}
