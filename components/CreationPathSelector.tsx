import {
  ArrowUpRight,
  BookOpenText,
  Clapperboard,
  FileSearch,
  Lightbulb,
  PackageCheck,
  PenTool,
  Presentation,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { CREATION_PATHS } from "@/lib/creation-paths";
import type { CreationPathId } from "@/lib/types";

const icons = {
  lightbulb: Lightbulb,
  nonfiction: BookOpenText,
  fiction: PenTool,
  upload: FileSearch,
  screen: Clapperboard,
  publishing: PackageCheck,
  pitch: Presentation,
};

export function CreationPathSelector({ onSelect }: { onSelect: (path: CreationPathId) => void }) {
  return (
    <section className="creation-path-section" id="create">
      <div className="creation-path-ambient" aria-hidden="true" />
      <div className="page-shell">
        <div className="creation-path-heading">
          <div>
            <p className="eyebrow"><Sparkles size={13} /> THE CREATION ATELIER</p>
            <h2>Seven distinct rooms.<br /><em>One ambitious studio.</em></h2>
          </div>
          <div className="creation-heading-note">
            <span>Choose by starting point</span>
            <p>Every room has its own questions, creative logic, and production promise—because a novel should never begin like a publishing pack.</p>
          </div>
        </div>
        <div className="creation-path-grid">
          {CREATION_PATHS.map((path, index) => {
            const Icon = icons[path.icon];
            return (
              <motion.button
                key={path.id}
                className={`creation-path-card premium-card path-card accent-${path.accent}`}
                onClick={() => onSelect(path.id)}
                type="button"
                aria-label={`Enter ${path.label}: ${path.bestFor}`}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: .45, delay: index * .055 }}
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -7 }}
              >
                <span className="path-card-top">
                  <span className="path-icon"><Icon size={21} /></span>
                  <span className="path-card-sigil" aria-hidden="true"><i /><i /><i /></span>
                  <small>0{index + 1}</small>
                </span>
                <span className="path-best-for">Best for · {path.bestFor}</span>
                <strong>{path.label}</strong>
                <p>{path.description}</p>
                <span className="path-output"><b>Studio output</b>{path.sampleOutput}</span>
                <em>Enter {path.shortLabel} <ArrowUpRight size={15} /></em>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
