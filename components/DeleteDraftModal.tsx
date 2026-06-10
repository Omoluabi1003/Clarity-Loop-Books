import { AlertTriangle, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Book } from "@/lib/types";

interface Props { book: Book; onCancel: () => void; onConfirm: (permanent: boolean) => void }

export function DeleteDraftModal({ book, onCancel, onConfirm }: Props) {
  const [permanent, setPermanent] = useState(false);
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
    <section className="delete-draft-modal" role="dialog" aria-modal="true" aria-labelledby="delete-draft-title">
      <button className="modal-close" aria-label="Cancel deletion" onClick={onCancel}><X size={18} /></button>
      <span className="delete-warning-icon"><AlertTriangle size={22} /></span>
      <p className="eyebrow">PROJECT MANAGEMENT</p>
      <h2 id="delete-draft-title">Delete this book draft?</h2>
      <p>This will remove <strong>{book.title}</strong> from Books in Progress. This action cannot be undone unless recovery is enabled.</p>
      <label className="permanent-delete-option"><input type="checkbox" checked={permanent} onChange={(event) => setPermanent(event.target.checked)} /><span><strong>Permanently delete local data</strong><small>Otherwise the draft is soft deleted and hidden for possible recovery.</small></span></label>
      <div className="delete-modal-actions"><button className="secondary-button" onClick={onCancel}>Cancel</button><button className="danger-button" onClick={() => onConfirm(permanent)}><Trash2 size={16} /> Delete Draft</button></div>
    </section>
  </div>;
}
