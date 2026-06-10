import { ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { STUDIO_MODULES } from "@/lib/studio-catalog";

export function StudioDirectory() {
  return <section className="studio-directory"><div className="page-shell">
    <div className="directory-heading"><div><p className="eyebrow">THE PUBLISHING OPERATING SYSTEM</p><h2>Specialized studios, one creative record.</h2></div><div className="integrity-promise"><ShieldCheck size={22}/><span><strong>Content Integrity Gate</strong><small>Clean words—not padded words—determine readiness.</small></span></div></div>
    <div className="studio-module-grid">{STUDIO_MODULES.map((module) => <article key={module.id}><p className="eyebrow">{module.eyebrow}</p><h3>{module.title}</h3><p>{module.description}</p><ul>{module.outputs.map((output) => <li key={output}><CheckCircle2 size={13}/>{output}</li>)}</ul><button>Explore module <ArrowUpRight size={14}/></button></article>)}</div>
  </div></section>;
}
