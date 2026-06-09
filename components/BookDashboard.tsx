import { ArrowRight, BookOpen, Check, Clock3, MoreHorizontal, Plus, Sparkles } from "lucide-react";
import type { Book } from "@/lib/types";

interface Props { books: Book[]; onOpen: (id: string) => void; onCreate: () => void }

export function BookDashboard({ books, onOpen, onCreate }: Props) {
  return (
    <main className="page-shell dashboard-page">
      <section className="welcome-row">
        <div><p className="eyebrow">YOUR WRITING HOME</p><h1>Good morning, Maya.</h1><p>Pick up where you left off, or begin something new.</p></div>
        <button className="primary-button" onClick={onCreate}><Plus size={18} /> Create a new book</button>
      </section>

      <section className="focus-card" onClick={() => onOpen(books[0].id)}>
        <div className="focus-glow" />
        <div className="focus-icon"><Sparkles size={20} /></div>
        <div className="focus-copy"><p className="eyebrow">YOUR NEXT STEP</p><h2>Chapter 2 is ready for you</h2><p>“The Noise Around the Decision” has its outline and Book DNA in place.</p></div>
        <button className="light-button">Write my chapter <ArrowRight size={17} /></button>
      </section>

      <section className="books-section">
        <div className="section-heading"><div><p className="eyebrow">MY BOOKS</p><h2>Your stories, all in one place</h2></div><button className="text-link" onClick={onCreate}>View all books <ArrowRight size={15} /></button></div>
        <div className="book-grid">
          {books.map((book) => (
            <article className="book-card" key={book.id} onClick={() => onOpen(book.id)}>
              <div className={`book-cover ${book.color}`}><span>CL</span><BookOpen size={30} strokeWidth={1.3} /><small>{book.genre}</small></div>
              <div className="book-details">
                <div className="book-title-row"><span className={`status-dot ${book.status.toLowerCase()}`} /> <small>{book.status}</small><button aria-label="Book menu" onClick={(event) => event.stopPropagation()}><MoreHorizontal size={18} /></button></div>
                <h3>{book.title}</h3><p>{book.subtitle}</p>
                <div className="progress-track"><span style={{ width: `${book.progress}%` }} /></div>
                <div className="book-meta"><span>{book.progress}% complete</span><span><Clock3 size={13} /> {book.updatedAt}</span></div>
              </div>
            </article>
          ))}
          <button className="new-book-card" onClick={onCreate}><span><Plus size={23} /></span><strong>Start a new book</strong><small>Your idea deserves a place to grow.</small></button>
        </div>
      </section>

      <section className="how-it-works">
        <div><p className="eyebrow">THE CLARITY LOOP</p><h2>From first idea to finished manuscript</h2><p>A calm, guided process keeps your book moving without making it feel mechanical.</p></div>
        <ol>
          <li><span><Check size={16} /></span><div><strong>Shape your idea</strong><small>Tell us what you want to write and who it is for.</small></div></li>
          <li><span>2</span><div><strong>Build your blueprint</strong><small>Get a thoughtful chapter plan you can edit.</small></div></li>
          <li><span>3</span><div><strong>Write with support</strong><small>Create and refine each chapter in your voice.</small></div></li>
          <li><span>4</span><div><strong>Share your book</strong><small>Download a clean manuscript when you are ready.</small></div></li>
        </ol>
      </section>
    </main>
  );
}
