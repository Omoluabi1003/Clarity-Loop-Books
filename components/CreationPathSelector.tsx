import { ArrowUpRight, BookOpen, Clapperboard, FileSearch, Lightbulb, PackageCheck, PenTool, Presentation, Sparkles } from "lucide-react";
import { CREATION_PATHS } from "@/lib/creation-paths";
import type { CreationPathId } from "@/lib/types";

const icons = { idea: Lightbulb, nonfiction: BookOpen, fiction: PenTool, upload: FileSearch, adaptation: Clapperboard, publishing: PackageCheck, pitch: Presentation };

export function CreationPathSelector({ onSelect }: { onSelect: (path: CreationPathId) => void }) {
  return <section className="creation-path-section" id="create">
    <div className="creation-path-atmosphere" />
    <div className="page-shell">
      <div className="creation-path-heading">
        <div><p className="eyebrow"><Sparkles size={12} /> THE CREATION ATELIER</p><h2>Begin with the studio<br />built for your outcome.</h2></div>
        <div className="creation-path-intro"><span>7 DISTINCT WORKFLOWS</span><p>Every path asks different questions, surfaces different intelligence, and prepares a purpose-built creative plan.</p></div>
      </div>
      <div className="creation-path-grid">{CREATION_PATHS.map((path, index) => { const Icon = icons[path.icon]; return <button key={path.id} className={`creation-path-card accent-${path.accent}`} onClick={() => onSelect(path.id)}>
        <span className={`path-card-motif motif-${path.motif}`} aria-hidden="true" />
        <span className="path-card-top"><span className="path-icon"><Icon size={21} /></span><small>STUDIO 0{index + 1}</small></span>
        <span className="path-best-for">BEST FOR · {path.bestFor}</span>
        <strong>{path.cardLabel}</strong><p>{path.positioning}</p>
        <span className="path-output"><small>SAMPLE OUTPUT</small><b>{path.sampleOutput}</b></span>
        <em>Enter this studio <ArrowUpRight size={15} /></em>
      </button>; })}</div>
    </div>
  </section>;
}
