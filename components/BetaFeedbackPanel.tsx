"use client";

import { Bug, MessageSquarePlus, Send, X } from "lucide-react";
import { useState } from "react";
import type { BetaFeedback, Book, FeedbackSeverity, FeedbackType } from "@/lib/types";

export function BetaFeedbackPanel({ books, onSubmit }: { books: Book[]; onSubmit: (feedback: BetaFeedback) => void }) {
  const [open, setOpen] = useState(false);
  const [bookId, setBookId] = useState(books[0]?.id || "");
  const [type, setType] = useState<FeedbackType>("bug");
  const [severity, setSeverity] = useState<FeedbackSeverity>("medium");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const submit = () => {
    if (!bookId || message.trim().length < 10) return;
    onSubmit({ id: `feedback-${Date.now()}`, bookId, type, severity, message: message.trim(), createdAt: new Date().toISOString() });
    setMessage(""); setSent(true); window.setTimeout(() => setSent(false), 2500);
  };
  if (!open) return <button className="feedback-launcher" onClick={() => setOpen(true)}><MessageSquarePlus size={17} /> Beta feedback</button>;
  return <aside className="feedback-panel" aria-label="Beta feedback" tabIndex={-1}><div><strong><Bug size={17} /> Report beta feedback</strong><button aria-label="Close feedback" onClick={() => setOpen(false)}><X size={17} /></button></div><label>Book<select value={bookId} onChange={(event) => setBookId(event.target.value)}>{books.map((book) => <option value={book.id} key={book.id}>{book.title}</option>)}</select></label><label>Type<select value={type} onChange={(event) => setType(event.target.value as FeedbackType)}><option value="bug">Report a Bug</option><option value="export_issue">Report Export Issue</option><option value="content_quality">Content Quality</option><option value="feature_request">Suggest Improvement</option><option value="general">General</option></select></label><label>Severity<select value={severity} onChange={(event) => setSeverity(event.target.value as FeedbackSeverity)}><option>low</option><option>medium</option><option>high</option><option>critical</option></select></label><label>What happened?<textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Include the chapter, action, expected result, and what happened." /></label><button className="primary-button" disabled={!bookId || message.trim().length < 10} onClick={submit}><Send size={15} /> {sent ? "Feedback saved" : "Submit feedback"}</button><small>Stored with the project so the beta team can reproduce the issue.</small></aside>;
}
