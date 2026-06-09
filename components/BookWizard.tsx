import { ArrowLeft, ArrowRight, Check, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { templates } from "@/lib/templates";
import type { BookForm, BookTemplate } from "@/lib/types";

const initialForm: BookForm = { title: "", subtitle: "", genre: "Self-Help", audience: "", tone: "Encouraging", writingStyle: "Practical and story-led", bookLength: "Standard · 30,000 words", chapterCount: 10, autoMode: false };

interface Props { initialTemplate?: BookTemplate | null; onClose: () => void; onCreate: (form: BookForm) => Promise<void> }

export function BookWizard({ initialTemplate, onClose, onCreate }: Props) {
  const [step, setStep] = useState(1);
  const [working, setWorking] = useState(false);
  const [form, setForm] = useState<BookForm>(() => initialTemplate ? { ...initialForm, genre: initialTemplate.genre, audience: initialTemplate.audience, tone: initialTemplate.tone, writingStyle: initialTemplate.writingStyle, chapterCount: initialTemplate.chapterCount, bookLength: initialTemplate.length } : initialForm);
  const update = <K extends keyof BookForm>(key: K, value: BookForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => { setWorking(true); await onCreate(form); setWorking(false); };

  return (
    <div className="modal-backdrop">
      <section className="wizard-modal" role="dialog" aria-modal="true" aria-label="Create a new book">
        <aside className="wizard-aside">
          <button className="brand brand-light" onClick={onClose}><span className="brand-mark"><Sparkles size={17} /></span><span>Clarity <b>Loop</b></span></button>
          <div className="wizard-message"><p className="eyebrow">YOUR BOOK BEGINS HERE</p><h2>Let’s shape your idea together.</h2><p>There are no wrong answers. Everything can be changed later.</p></div>
          <ol className="wizard-steps">
            {["The big idea", "Your reader", "Your writing style", "Book plan"].map((label, index) => <li className={step === index + 1 ? "active" : step > index + 1 ? "done" : ""} key={label}><span>{step > index + 1 ? <Check size={14} /> : index + 1}</span>{label}</li>)}
          </ol>
          <blockquote>“You don’t have to see the whole staircase. Just take the first step.”<cite>— Martin Luther King Jr.</cite></blockquote>
        </aside>
        <div className="wizard-content">
          <div className="wizard-top"><span>Step {step} of 4</span><button aria-label="Close" onClick={onClose}><X /></button></div>
          {step === 1 && <div className="wizard-form"><p className="eyebrow">THE BIG IDEA</p><h2>What book are you ready to write?</h2><p>Give your idea a working title. It does not need to be perfect.</p><label>Book title<input autoFocus value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. The Courage to Begin" /></label><label>Subtitle <small>Optional</small><input value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} placeholder="A simple guide to moving forward" /></label><label>What kind of book is it?<div className="choice-grid compact">{templates.map((template) => <button className={form.genre === template.genre ? "selected" : ""} onClick={() => update("genre", template.genre)} key={template.id}>{template.name}</button>)}</div></label></div>}
          {step === 2 && <div className="wizard-form"><p className="eyebrow">YOUR READER</p><h2>Who are you writing this for?</h2><p>Picture one person who most needs the message in this book.</p><label>My ideal reader is…<textarea autoFocus value={form.audience} onChange={(e) => update("audience", e.target.value)} placeholder="e.g. A busy professional who knows something needs to change, but is not sure where to begin." /></label><div className="prompt-card"><Sparkles size={18} /><span><strong>A helpful thought</strong>The more specific you are, the more personal and useful your book will feel.</span></div></div>}
          {step === 3 && <div className="wizard-form"><p className="eyebrow">YOUR WRITING STYLE</p><h2>How should your book feel?</h2><p>Choose the voice that sounds most like you.</p><label>Tone<select value={form.tone} onChange={(e) => update("tone", e.target.value)}><option>Encouraging</option><option>Warm and hopeful</option><option>Confident and clear</option><option>Personal and honest</option><option>Playful and kind</option></select></label><label>Writing style<select value={form.writingStyle} onChange={(e) => update("writingStyle", e.target.value)}><option>Practical and story-led</option><option>Reflective and accessible</option><option>Narrative and vivid</option><option>Insightful and example-driven</option><option>Simple and visual</option></select></label></div>}
          {step === 4 && <div className="wizard-form"><p className="eyebrow">YOUR BOOK PLAN</p><h2>Choose a comfortable starting shape.</h2><p>We will build an editable chapter blueprint around these choices.</p><label>Book length<select value={form.bookLength} onChange={(e) => update("bookLength", e.target.value)}><option>Short · 15,000 words</option><option>Standard · 30,000 words</option><option>Long · 50,000 words</option></select></label><label>Number of chapters<div className="number-control"><button onClick={() => update("chapterCount", Math.max(5, form.chapterCount - 1))}>−</button><strong>{form.chapterCount}</strong><button onClick={() => update("chapterCount", Math.min(20, form.chapterCount + 1))}>+</button></div></label><label className="toggle-row"><span><strong>Let Clarity Loop balance chapter sizes</strong><small>We will suggest a helpful word count for each chapter.</small></span><input type="checkbox" checked={form.autoMode} onChange={(e) => update("autoMode", e.target.checked)} /></label></div>}
          <div className="wizard-actions"><button className="secondary-button" onClick={() => step === 1 ? onClose() : setStep(step - 1)}><ArrowLeft size={17} /> {step === 1 ? "Cancel" : "Back"}</button>{step < 4 ? <button className="primary-button" disabled={step === 1 && !form.title.trim() || step === 2 && !form.audience.trim()} onClick={() => setStep(step + 1)}>Continue <ArrowRight size={17} /></button> : <button className="primary-button" disabled={working} onClick={submit}><Sparkles size={17} /> {working ? "Creating your blueprint…" : "Create my book blueprint"}</button>}</div>
        </div>
      </section>
    </div>
  );
}
