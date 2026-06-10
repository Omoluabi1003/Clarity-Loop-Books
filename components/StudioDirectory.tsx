import { ArrowUpRight, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import { STUDIO_MODULES } from "@/lib/studio-catalog";

export function StudioDirectory({ onUpgrade = () => undefined }: { onUpgrade?: () => void }) {
  return <section className="studio-directory"><div className="page-shell">
    <div className="directory-heading"><div><p className="eyebrow">THE PUBLISHING OPERATING SYSTEM</p><h2>Specialized studios, one creative record.</h2></div><div className="integrity-promise"><ShieldCheck size={22}/><span><strong>Content Integrity Gate</strong><small>Clean words—not padded words—determine readiness.</small></span></div></div>
    <div className="studio-module-grid">{STUDIO_MODULES.map((module) => <article className="module-locked" key={module.id}>
      <div className="module-title-row"><p className="eyebrow">{module.eyebrow}</p><span><LockKeyhole size={12} /> LOCKED</span></div>
      <h3>{module.title}</h3><p>{module.description}</p>
      <ul>{module.outputs.map((output) => <li key={output}><CheckCircle2 size={13}/>{output}</li>)}</ul>
      <button onClick={onUpgrade}>View upgrade options <ArrowUpRight size={14}/></button>
      <small className="module-lock-copy">Part of Author Pro or Studio. Stripe activation is coming soon.</small>
    </article>)}</div>
  </div></section>;
}
