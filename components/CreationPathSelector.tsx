import { ArrowRight, BookOpen, Clapperboard, FileSearch, Lightbulb, PackageCheck, PenTool, Presentation } from "lucide-react";
import { CREATION_PATHS } from "@/lib/studio-catalog";
import type { CreationPathId } from "@/lib/types";

const icons = [Lightbulb, BookOpen, PenTool, FileSearch, Clapperboard, PackageCheck, Presentation];
export function CreationPathSelector({ onSelect }: { onSelect: (path: CreationPathId) => void }) {
  return <section className="creation-path-section page-shell" id="create">
    <div className="creation-path-heading"><div><p className="eyebrow">CREATE YOUR WAY</p><h2>One studio. Seven ways to begin.</h2></div><p>Choose the outcome you need. Clarity Loop adapts the questions, intelligence, and deliverables to the work.</p></div>
    <div className="creation-path-grid">{CREATION_PATHS.map((path, index) => { const Icon = icons[index]; return <button key={path.id} className={`creation-path-card accent-${path.accent}`} onClick={() => onSelect(path.id)}><span className="path-icon"><Icon size={20} /></span><small>0{index + 1}</small><strong>{path.label}</strong><p>{path.description}</p><em>Open workflow <ArrowRight size={14} /></em></button>; })}</div>
  </section>;
}
