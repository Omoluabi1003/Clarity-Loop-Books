"use client";

import { useReducedMotion } from "framer-motion";
import {
  BookCheck,
  BookOpenText,
  Check,
  ChevronRight,
  Download,
  FileText,
  PenLine,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

const stages = [
  { label: "Idea", detail: "The Courage to Begin" },
  { label: "Synopsis", detail: "A practical guide to moving forward before you feel ready." },
  { label: "Structure", detail: "8 chapters designed" },
  { label: "Manuscript", detail: "42,600 words shaped" },
  { label: "Publish", detail: "PDF · DOCX · EPUB" },
];

export function HeroBookDemo({ onStart }: { onStart: () => void }) {
  const reduceMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState(0);
  const [title, setTitle] = useState("The Courage to Begin");

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % stages.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const advance = () => setActiveStage((current) => Math.min(current + 1, stages.length - 1));

  return (
    <div className="hero-demo" aria-label="Interactive demonstration of a book being built">
      <div className="demo-window-bar">
        <span className="demo-dots"><i /><i /><i /></span>
        <span>CLARITY LOOP / NEW BOOK</span>
        <span className="demo-live"><i /> LIVE DEMO</span>
      </div>

      <div className="demo-progress" aria-label={`Book creation stage: ${stages[activeStage].label}`}>
        {stages.map((stage, index) => (
          <button
            className={index <= activeStage ? "complete" : ""}
            key={stage.label}
            onClick={() => setActiveStage(index)}
            aria-label={`Show ${stage.label} stage`}
          >
            <span>{index < activeStage ? <Check size={11} /> : index + 1}</span>
            <small>{stage.label}</small>
          </button>
        ))}
      </div>

      <div className="demo-stage">
        <div className="demo-stage-content" key={activeStage}>
          {activeStage === 0 && (
            <div className="demo-idea">
              <span className="demo-stage-icon"><PenLine size={18} /></span>
              <small>WHAT WOULD YOU LIKE TO WRITE?</small>
              <input aria-label="Demo book title" value={title} onChange={(event) => setTitle(event.target.value)} />
              <button onClick={advance}>Build my book <Sparkles size={14} /></button>
            </div>
          )}

          {activeStage === 1 && (
            <div className="demo-synopsis">
              <div className="demo-section-label"><Sparkles size={14} /> AI BLUEPRINT</div>
              <h3>{title || "Your Book Title"}</h3>
              <p>A practical, encouraging guide for people who are ready to stop waiting for perfect confidence and begin making meaningful progress.</p>
              <div className="typing-lines"><i /><i /><i /></div>
            </div>
          )}

          {activeStage === 2 && (
            <div className="demo-structure">
              <div className="demo-section-label"><BookOpenText size={14} /> TABLE OF CONTENTS</div>
              <div className="demo-chapters">
                {["The Myth of Ready", "Name What Matters", "Make the First Move", "Build Brave Momentum"].map((chapter, index) => (
                  <div key={chapter} style={{ animationDelay: `${index * 80}ms` }}>
                    <span>0{index + 1}</span><strong>{chapter}</strong><Check size={13} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStage === 3 && (
            <div className="demo-manuscript">
              <div className="mini-book-cover"><small>CLARITY LOOP EDITION</small><strong>{title || "Your Book"}</strong><i /><span>YOUR NAME</span></div>
              <div className="mini-pages">
                <div className="demo-section-label"><FileText size={14} /> MANUSCRIPT</div>
                <small>CHAPTER FOUR</small><h3>Build Brave Momentum</h3>
                <p>Progress rarely arrives as one dramatic act. More often, it begins with a small honest move...</p>
                <div className="manuscript-count"><strong>42,600</strong><span>words written</span></div>
              </div>
            </div>
          )}

          {activeStage === 4 && (
            <div className="demo-export">
              <span className="export-seal"><BookCheck size={24} /></span>
              <small>YOUR BOOK IS READY</small>
              <h3>Publication-ready in every format.</h3>
              <div>{["PDF", "DOCX", "EPUB"].map((format) => <button key={format} type="button" disabled title="Available after your manuscript passes publishing readiness"><FileText size={16} /><strong>{format}</strong><Download size={14} /></button>)}</div>
              <button className="demo-start" onClick={onStart}>Start your own book <ChevronRight size={15} /></button>
            </div>
          )}
        </div>
      </div>

      <div className="demo-caption">
        <span><Sparkles size={13} /> Building with Book DNA</span>
        <p>{stages[activeStage].detail}</p>
      </div>
    </div>
  );
}
