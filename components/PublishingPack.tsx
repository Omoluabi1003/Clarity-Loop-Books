"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BookCopy, Check, FileText, Search, Tags, UserRound } from "lucide-react";

const assets = [
  { icon: BookCopy, label: "Amazon description", state: "Positioned to sell" },
  { icon: FileText, label: "Back cover copy", state: "Clear reader promise" },
  { icon: UserRound, label: "Author biography", state: "Professional & personal" },
  { icon: Search, label: "Discovery keywords", state: "Search-aware" },
  { icon: Tags, label: "Category suggestions", state: "Market aligned" },
];

export function PublishingPack({ onStart, onAuthorSuccess }: { onStart: () => void; onAuthorSuccess?: () => void }) {
  return (
    <section className="publishing-pack page-shell">
      <motion.div className="publishing-pack-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }}>
        <div className="pack-copy">
          <p className="eyebrow">BEYOND THE MANUSCRIPT</p>
          <h2>Your book needs more than a file.<br /><em>It needs a launch-ready story.</em></h2>
          <p>Build the essential copy that positions your book, introduces you as the author, and helps the right readers discover it.</p>
          <div className="pack-cta-row"><button className="gold-button" onClick={onStart}>Build your publishing pack <ArrowUpRight size={16} /></button>{onAuthorSuccess && <button className="pack-success-link" onClick={onAuthorSuccess}>Open Author Success Hub <ArrowUpRight size={16} /></button>}</div>
        </div>
        <div className="pack-assets">
          <div className="pack-status"><span><Check size={13} /> PUBLISHING PACK</span><small>5 assets included</small></div>
          {assets.map(({ icon: Icon, label, state }, index) => <motion.div key={label} initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: index * .07 }} viewport={{ once: true }}><span><Icon size={17} /></span><strong>{label}</strong><small>{state}</small><Check size={14} /></motion.div>)}
        </div>
      </motion.div>
    </section>
  );
}
