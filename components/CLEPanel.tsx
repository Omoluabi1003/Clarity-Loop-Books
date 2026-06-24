import type { Book } from "@/lib/types";

interface CLEPanelProps {
  book: Book;
  onBack: () => void;
}

export function CLEPanel({ book, onBack }: CLEPanelProps) {
  return (
    <main className="author-success-shell studio-dark-surface">
      <section className="page-shell success-hero">
        <button className="back-link" type="button" onClick={onBack}>Back to workspace</button>
        <p className="eyebrow">Book-to-Market Engine</p>
        <h1>Clarity Launch Engine</h1>
        <p>{book.title}</p>
      </section>
    </main>
  );
}
