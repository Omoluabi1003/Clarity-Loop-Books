"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  BookOpenText,
  CheckCircle2,
  Clapperboard,
  FileSearch,
  ImageIcon,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { STUDIO_MODULES } from "@/lib/studio-catalog";
import { BrandLogo } from "./BrandLogo";

const moduleDetails = {
  manuscript: {
    purpose: "Upload or analyze an existing manuscript, then turn editorial findings into a practical revision plan.",
    icon: FileSearch,
    actions: [
      ["Upload manuscript", "Open a secure manuscript intake and prepare the file for structural review."],
      ["Analyze sample", "Start a focused editorial analysis using a representative chapter or excerpt."],
      ["View report", "Open the report workspace for structure, repetition, and revision findings."],
    ],
  },
  fiction: {
    purpose: "Build the connected story system behind character arcs, plot turns, continuity, and scenes.",
    icon: BookOpenText,
    actions: [
      ["Create story bible", "Define the world, rules, themes, timeline, and core narrative promise."],
      ["Build characters", "Shape character goals, wounds, relationships, contradictions, and arcs."],
      ["Start plot board", "Arrange major beats and scene cards into a coherent story architecture."],
    ],
  },
  adaptation: {
    purpose: "Convert books or source material into screen-ready story assets without losing the central promise.",
    icon: Clapperboard,
    actions: [
      ["Create logline", "Distill protagonist, goal, stakes, and dramatic engine into a pitch-ready line."],
      ["Build beat sheet", "Translate the source into visual beats with clear escalation and turning points."],
      ["Generate treatment", "Open a treatment brief for tone, structure, character, and cinematic direction."],
    ],
  },
  cover: {
    purpose: "Create a genre-aware cover strategy, visual brief, and production-ready asset direction.",
    icon: ImageIcon,
    actions: [
      ["Create cover brief", "Define shelf position, visual metaphor, typography, palette, and audience signal."],
      ["Preview cover", "Open the cover preview stage and test the concept at full size and thumbnail scale."],
      ["Upload cover", "Prepare a finished cover file for quality checks and publishing assembly."],
    ],
  },
  publishing: {
    purpose: "Prepare clean book files, metadata, back-cover copy, keywords, and launch-ready assets.",
    icon: PackageCheck,
    actions: [
      ["Check readiness", "Run the publishing gate across manuscript quality, cover, metadata, and files."],
      ["Generate metadata", "Build the title, description, categories, keywords, and contributor record."],
      ["Export package", "Open the export plan for PDF, DOCX, and the supporting launch asset bundle."],
    ],
  },
} as const;

type ModuleId = keyof typeof moduleDetails;

export function StudioDirectory() {
  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const selectedStudio = selectedModule ? STUDIO_MODULES.find((item) => item.id === selectedModule) : null;
  const details = selectedModule ? moduleDetails[selectedModule] : null;

  const openModule = (id: string) => {
    setSelectedModule(id as ModuleId);
    setSelectedAction(null);
  };

  const closeModule = () => {
    setSelectedModule(null);
    setSelectedAction(null);
  };

  return (
    <section className="studio-directory studio-dark-surface" id="specialized-studios" aria-label="Specialized publishing studios">
      <div className="page-shell">
        {selectedStudio && details ? (
          <div className="module-workspace" aria-live="polite">
            <button className="module-back-button" type="button" onClick={closeModule}>
              <ArrowLeft size={15} /> Back to studios
            </button>
            <div className="module-workspace-brand"><BrandLogo context={selectedStudio.title} /></div>
            <div className="module-workspace-hero">
              <span className="module-workspace-icon"><details.icon size={28} /></span>
              <div>
                <p className="eyebrow"><Sparkles size={13} /> {selectedStudio.eyebrow}</p>
                <h2 className="studio-dark-heading">{selectedStudio.title}</h2>
                <p className="studio-dark-body">{details.purpose}</p>
              </div>
              <span className="module-status"><i /> Workspace ready</span>
            </div>

            <div className="module-workspace-grid">
              <div className="module-action-list">
                <p className="module-kicker">Choose a starting action</p>
                {details.actions.map(([label, description], index) => (
                  <button
                    className={selectedAction === label ? "active" : ""}
                    type="button"
                    onClick={() => setSelectedAction(label)}
                    key={label}
                    aria-pressed={selectedAction === label}
                  >
                    <span>0{index + 1}</span>
                    <span><strong>{label}</strong><small>{description}</small></span>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </div>

              <aside className="module-activity-panel">
                <p className="module-kicker">Active workspace</p>
                {selectedAction ? (
                  <>
                    <span className="activity-mark"><CheckCircle2 size={22} /></span>
                    <h3 className="studio-readable-card-title">{selectedAction}</h3>
                    <p>{details.actions.find(([label]) => label === selectedAction)?.[1]}</p>
                    <div className="module-placeholder-note">
                      <ShieldCheck size={17} />
                      <span><strong>Project-safe placeholder</strong><small>This workspace is connected and ready for the next production release. Your current studio record remains intact.</small></span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="activity-mark"><details.icon size={22} /></span>
                    <h3 className="studio-readable-card-title">Your {selectedStudio.title} desk</h3>
                    <p>Select an action to open its focused setup panel. Nothing here is decorative or disconnected.</p>
                    <ul>{selectedStudio.outputs.map((output) => <li key={output}><CheckCircle2 size={13} /> {output}</li>)}</ul>
                  </>
                )}
              </aside>
            </div>
          </div>
        ) : (
          <>
            <div className="directory-brand"><BrandLogo context="Connected Creative Studios" /></div>
            <div className="directory-heading">
              <div><p className="eyebrow">THE PUBLISHING OPERATING SYSTEM</p><h2 className="studio-dark-heading" id="studio-directory-title">Specialized studios, one creative record.</h2></div>
              <div className="integrity-promise"><ShieldCheck size={22}/><span><strong>Content Integrity Gate</strong><small>Clean words—not padded words—determine readiness.</small></span></div>
            </div>
            <div className="studio-module-grid">
              {STUDIO_MODULES.map((item) => (
                <article key={item.id}>
                  <p className="eyebrow">{item.eyebrow}</p>
                  <h3 className="studio-readable-card-title">{item.title}</h3>
                  <p className="studio-readable-card-body">{item.description}</p>
                  <ul>{item.outputs.map((output) => <li key={output}><CheckCircle2 size={13}/>{output}</li>)}</ul>
                  <button type="button" onClick={() => openModule(item.id)} aria-label={`Explore ${item.title}`}>
                    <span className="studio-text-button-on-dark">Explore module</span> <ArrowUpRight size={14}/>
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
