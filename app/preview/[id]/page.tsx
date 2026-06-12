"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpenText, Check, Mail, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { decodeBookPreview } from "@/lib/book-preview";

export default function BookPreviewPage() {
  const searchParams = useSearchParams();
  const preview = useMemo(() => decodeBookPreview(searchParams.get("book") || ""), [searchParams]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!preview) return;
    const key = `clarity-preview-metrics-${preview.id}`;
    const metrics = JSON.parse(localStorage.getItem(key) || '{"views":0,"conversions":0}') as { views: number; conversions: number };
    localStorage.setItem(key, JSON.stringify({ ...metrics, views: metrics.views + 1 }));
  }, [preview]);

  const join = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!preview) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const key = `clarity-preview-metrics-${preview.id}`;
    const metrics = JSON.parse(localStorage.getItem(key) || '{"views":1,"conversions":0}') as { views: number; conversions: number };
    localStorage.setItem(key, JSON.stringify({ ...metrics, conversions: metrics.conversions + 1, latestEmail: email }));
    setJoined(true);
  };

  if (!preview) return <main className="public-preview invalid-preview"><BrandMark /><h1>This preview link is incomplete.</h1><p>Ask the author for a new Clarity Loop book preview link.</p></main>;

  return <main className="public-preview">
    <header><Link href="/" className="preview-brand"><BrandMark /><span><strong>Clarity Loop</strong><small>AUTHOR PREVIEW</small></span></Link><span><Sparkles size={14} /> Early reader access</span></header>
    <section className="public-preview-hero">
      <div className="public-preview-cover" style={preview.coverImageUrl ? { backgroundImage: `url(${preview.coverImageUrl})` } : undefined}><small>{preview.genre}</small><BookOpenText size={40} /><h1>{preview.title}</h1><p>{preview.subtitle}</p><strong>{preview.authorName}</strong></div>
      <div className="public-preview-copy"><p className="eyebrow">A NEW BOOK FOR {preview.audience.toUpperCase()}</p><h2>{preview.summary}</h2><p className="preview-byline">A forthcoming book by <strong>{preview.authorName}</strong></p>
        <div className="sample-card"><small>FROM THE MANUSCRIPT</small><p>{preview.sample}</p></div>
        {joined ? <div className="waitlist-success"><Check size={22} /><div><strong>You’re on the early-reader list.</strong><p>Watch your inbox for launch news and reader opportunities.</p></div></div> : <form onSubmit={join}><label htmlFor="reader-email">Get the launch date and a free sample chapter.</label><div><Mail size={18} /><input id="reader-email" name="email" type="email" placeholder="you@example.com" required /><button type="submit">Join reader list <ArrowRight size={16} /></button></div><small>No spam. Unsubscribe whenever you want.</small></form>}
      </div>
    </section>
    {preview.attribution && <footer>Created and published with <Link href="/">Clarity Loop</Link> · The AI Author Operating System</footer>}
  </main>;
}
