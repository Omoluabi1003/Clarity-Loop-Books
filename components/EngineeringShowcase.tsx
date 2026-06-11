"use client";

import { motion } from "framer-motion";
import { Braces, Dna, FileStack, Layers3, ShieldCheck } from "lucide-react";

const systems = [
  { icon: Braces, name: "AI Blueprint Generator", copy: "Turns the book promise into a complete, editable writing plan." },
  { icon: Dna, name: "Book DNA Engine", copy: "Carries voice, audience, themes, and style through every chapter." },
  { icon: ShieldCheck, name: "Consistency Engine", copy: "Keeps ideas aligned and reduces contradiction as the manuscript grows." },
  { icon: Layers3, name: "Publishing Pipeline", copy: "Moves the finished manuscript into professional publishing assets." },
  { icon: FileStack, name: "Multi-format Export", copy: "Prepares flexible PDF, DOCX, and EPUB paths from one source." },
];

export function EngineeringShowcase() {
  return (
    <section className="engineering-section studio-dark-surface" id="engineering">
      <div className="page-shell engineering-grid">
        <motion.div className="engineering-copy" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .4 }}>
          <p className="eyebrow studio-eyebrow">THE INTELLIGENCE BEHIND THE PAGE</p>
          <h2 className="studio-dark-heading">Beautifully simple<br />on the surface.<br /><em>Deeply engineered</em><br />underneath.</h2>
          <p className="studio-dark-body">Clarity Loop coordinates a set of purpose-built publishing systems so authors can focus on the message—not the machinery.</p>
          <div className="developer-signature"><span>ETL</span><div><small>ENGINEERED BY</small><strong>ETL GIS Consulting LLC</strong></div></div>
        </motion.div>
        <div className="system-stack">
          {systems.map(({ icon: Icon, name, copy }, index) => (
            <motion.article key={name} initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: index * .08 }} viewport={{ once: true, amount: .5 }}>
              <span><Icon size={20} /></span><div><small>0{index + 1}</small><strong className="studio-readable-card-title">{name}</strong><p className="studio-readable-card-body">{copy}</p></div><i />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
