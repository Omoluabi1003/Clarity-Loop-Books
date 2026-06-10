import { ArrowLeft, ArrowRight, Check, ChevronRight, FileText, ShieldCheck, Sparkles, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { AIAssistanceLevel, BookForm, BookTemplate, ChapterSizePreference, CreationPathId } from "@/lib/types";
import { BOOK_TYPES } from "@/lib/studio-catalog";
import { CREATION_PATH_CONFIG } from "@/lib/creation-paths";

const baseForm: BookForm = { projectType: "idea", sourceText: "", sourceUrl: "", title: "", subtitle: "", authorName: "", authorBio: "", authorEmail: "", authorWebsite: "", publisherCredit: "ETL GIS Consulting LLC", idea: "", genre: "Self-Help", targetAudience: "", tone: "Encouraging and clear", writingStyle: "Practical and story-led", chapterCount: 10, targetPageCount: 180, wordsPerPage: 275, chapterSizePreference: "auto", customChapterWords: 2500, aiAssistanceLevel: "guided", coverDirection: "" };
interface Props { initialTemplate?: BookTemplate | null; initialPath?: CreationPathId; onClose: () => void; onCreate: (form: BookForm) => Promise<void> }

const titleKeys = ["workingTitle", "title", "storyTitle", "projectTitle", "sourceTitle", "bookTitle"];
const authorKeys = ["creatorName", "authorName"];
const firstValue = (values: Record<string, string>, keys: string[]) => keys.map((key) => values[key]).find(Boolean) || "";

export function NewBookWizard({ initialTemplate, initialPath = "start_from_idea", onClose, onCreate }: Props) {
  const path = CREATION_PATH_CONFIG[initialPath];
  const genres = path.projectType === "fiction" ? BOOK_TYPES.fiction : path.projectType === "screenplay" || path.projectType === "movie_pitch_pack" ? BOOK_TYPES.special : BOOK_TYPES.nonfiction;
  const [step, setStep] = useState(1);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [pathValues, setPathValues] = useState<Record<string, string>>(() => Object.fromEntries(path.fields.map((field) => [field.name, ""])));
  const [form, setForm] = useState<BookForm>(() => initialTemplate ? { ...baseForm, projectType: path.projectType, genre: initialTemplate.genre, targetAudience: initialTemplate.targetAudience, tone: initialTemplate.tone, writingStyle: initialTemplate.writingStyle, chapterCount: initialTemplate.chapterCount, targetPageCount: initialTemplate.targetPageCount } : { ...baseForm, projectType: path.projectType, genre: genres[0] });
  const update = <K extends keyof BookForm>(key: K, value: BookForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  const updatePath = (key: string, value: string) => setPathValues((current) => ({ ...current, [key]: value }));

  const completedFields = path.fields.filter((field) => pathValues[field.name]?.trim()).length;
  const previewTitle = firstValue(pathValues, titleKeys) || path.label;
  const previewDetails = useMemo(() => {
    const authored = path.fields.filter((field) => pathValues[field.name]?.trim()).slice(0, 4);
    return path.preview.map((label, index) => ({ label, value: authored[index]?.label ? pathValues[authored[index].name] : "Develops as you work" }));
  }, [path, pathValues]);

  const validateStepOne = () => {
    const required = path.fields.filter((field) => !field.optional && field.type !== "file");
    const missingRequired = required.some((field) => !pathValues[field.name]?.trim());
    const missingSource = path.id === "upload_manuscript" && !pathValues.uploadFile?.trim() && !pathValues.sourceLink?.trim();
    if (missingRequired || missingSource) { setError(path.validationMessage); return false; }
    return true;
  };
  const next = () => {
    if (step === 1 && !validateStepOne()) return;
    if (step === 2 && !form.targetAudience.trim()) { setError(`Define the audience before moving into ${path.steps[2].label.toLowerCase()}.`); return; }
    setError(""); setStep((value) => Math.min(4, value + 1));
  };
  const submit = async () => {
    const title = firstValue(pathValues, titleKeys);
    const authorName = firstValue(pathValues, authorKeys);
    const subtitle = pathValues.subtitle || "";
    const sourceUrl = pathValues.sourceLink || form.sourceUrl;
    const narrative = path.fields.filter((field) => !titleKeys.includes(field.name) && !authorKeys.includes(field.name) && field.name !== "subtitle" && pathValues[field.name]).map((field) => `${field.label}: ${pathValues[field.name]}`).join("\n\n");
    const finalized: BookForm = { ...form, projectType: path.projectType, title, authorName, subtitle, sourceUrl, sourceText: pathValues.uploadFile ? `Uploaded manuscript: ${pathValues.uploadFile}` : form.sourceText, idea: narrative, genre: pathValues.genre || form.genre, targetAudience: form.targetAudience || pathValues.targetAudience || "" };
    setWorking(true); setError("");
    try { await onCreate(finalized); } catch { setError("The studio could not create this plan. Your inputs are still here—please try again."); setWorking(false); }
  };
  const currentStep = path.steps[step - 1];

  return <div className={`studio-overlay studio-theme-${path.accent}`}>
    <section className="creation-studio" role="dialog" aria-modal="true" aria-label={`${path.label} creation studio`}>
      <aside className="creation-studio-aside">
        <div className="studio-brand"><span className="brand-mark">CL</span><span><strong>Clarity Loop</strong><small>CREATION ATELIER</small></span></div>
        <div className="studio-aside-copy"><p className="eyebrow">{path.label.toUpperCase()}</p><h2>{path.headline}</h2><p>{path.support}</p></div>
        <ol className="studio-progress">{path.steps.map((item, index) => <li className={step === index + 1 ? "active" : step > index + 1 ? "done" : ""} key={item.label}>
          <span>{step > index + 1 ? <Check size={13} /> : `0${index + 1}`}</span><div><small>{index === 0 ? "FOUNDATION" : index === 3 ? "DELIVERABLE" : "DIRECTION"}</small><strong>{item.label}</strong></div>{step === index + 1 && <ChevronRight size={15} />}
        </li>)}</ol>
        <div className="studio-director-note"><Sparkles size={15} /><div><small>STUDIO NOTE</small><p>{currentStep.directorNote}</p></div></div>
      </aside>

      <main className="creation-studio-main">
        <header className="studio-topbar"><div><span>CREATION WORKSPACE</span><b>Step {step} of 4</b></div><button aria-label="Close creation studio" onClick={onClose}><X size={21} /></button></header>
        <div className="studio-workspace">
          <section className="studio-form-panel">
            <div className="studio-step-intro"><p className="eyebrow">{currentStep.label.toUpperCase()}</p><h1>{step === 1 ? path.firstStepTitle : currentStep.title}</h1><p>{step === 1 ? path.firstStepSubtitle : currentStep.subtitle}</p></div>

            {step === 1 && <div className="path-field-grid">{path.fields.map((field, index) => <label key={field.name} className={field.wide ? "field-wide" : ""}>
              <span>{field.label}{field.optional && <small>Optional</small>}</span>
              {field.type === "textarea" ? <textarea autoFocus={index === 0} value={pathValues[field.name]} onChange={(event) => updatePath(field.name, event.target.value)} placeholder={field.placeholder} /> : field.type === "file" ? <span className={`studio-file-drop ${pathValues[field.name] ? "has-file" : ""}`}><input type="file" accept=".pdf,.doc,.docx,.txt,.md,.epub" onChange={(event) => updatePath(field.name, event.target.files?.[0]?.name || "")} /><Upload size={22} /><b>{pathValues[field.name] || "Choose a manuscript or drop it here"}</b><small>{field.placeholder}</small></span> : <input autoFocus={index === 0} type={field.type === "url" ? "url" : "text"} value={pathValues[field.name]} onChange={(event) => updatePath(field.name, event.target.value)} placeholder={field.placeholder} />}
            </label>)}</div>}

            {step === 2 && <div className="path-field-grid"><label className="field-wide"><span>{path.id === "fiction_book" ? "Core readers" : path.id === "movie_pitch_pack" || path.id === "screen_adaptation" ? "Intended viewers" : path.id === "publishing_pack" ? "Book buyer" : "Primary audience"}</span><textarea autoFocus value={form.targetAudience} onChange={(event) => update("targetAudience", event.target.value)} placeholder={path.id === "fiction_book" ? "Describe the reader drawn to this genre, emotional experience, and story world." : "Describe who this work is for, what they already care about, and why they will choose it."} /></label><label><span>{path.id === "fiction_book" ? "Genre shelf" : "Category or format"}</span><select value={form.genre} onChange={(event) => update("genre", event.target.value)}>{genres.map((genre) => <option key={genre}>{genre}</option>)}</select></label><label><span>Market signal</span><input value={form.coverDirection} onChange={(event) => update("coverDirection", event.target.value)} placeholder="Comparable work, community, platform, or market cue" /></label></div>}

            {step === 3 && <div className="path-field-grid"><label><span>{path.projectType === "fiction" ? "Narrative tone" : path.projectType === "screenplay" || path.projectType === "movie_pitch_pack" ? "Cinematic tone" : "Voice and tone"}</span><input autoFocus value={form.tone} onChange={(event) => update("tone", event.target.value)} placeholder="Confident, intimate, suspenseful, lyrical..." /></label><label><span>{path.projectType === "fiction" ? "Point of view and style" : "Creative style"}</span><input value={form.writingStyle} onChange={(event) => update("writingStyle", event.target.value)} placeholder="Practical, cinematic, story-led, reflective..." /></label><label className="field-wide"><span>Creative direction</span><textarea value={form.coverDirection} onChange={(event) => update("coverDirection", event.target.value)} placeholder={`Describe references, boundaries, visual cues, or qualities that should guide this ${path.label.toLowerCase()}.`} /></label><div className="assistance-choice field-wide"><span>AI collaboration level</span><div>{([['full','Lead the build'],['guided','Create with me'],['assistive','Support my direction']] as [AIAssistanceLevel,string][]).map(([value,label]) => <button type="button" className={form.aiAssistanceLevel === value ? "selected" : ""} onClick={() => update("aiAssistanceLevel", value)} key={value}><b>{label}</b><small>{value === "full" ? "Studio-led" : value === "guided" ? "Balanced" : "Author-led"}</small></button>)}</div></div></div>}

            {step === 4 && <div className="path-field-grid"><label><span>{path.projectType === "screenplay" || path.projectType === "movie_pitch_pack" ? "Sequence or section count" : path.projectType === "publishing_pack" ? "Asset set count" : "Chapter count"}</span><input autoFocus type="number" min="3" max="40" value={form.chapterCount} onChange={(event) => update("chapterCount", Number(event.target.value))} /></label><label><span>Target page scope</span><input type="number" min="20" max="800" value={form.targetPageCount} onChange={(event) => update("targetPageCount", Number(event.target.value))} /></label><div className="size-choice field-wide"><span>Production depth</span><div>{([['short','Focused'],['medium','Standard'],['long','Expansive'],['auto','Studio decides']] as [ChapterSizePreference,string][]).map(([value,label]) => <button type="button" className={form.chapterSizePreference === value ? "selected" : ""} onClick={() => update("chapterSizePreference", value)} key={value}><b>{label}</b><small>{value === "auto" ? "Based on your brief" : `${value} development`}</small></button>)}</div></div><div className="studio-ready-card field-wide"><ShieldCheck size={22} /><div><small>READY TO BUILD</small><h3>{previewTitle}</h3><p>Clarity Loop will create a {path.steps[3].label.toLowerCase()} grounded in your source, audience, and creative direction.</p></div></div></div>}

            {error && <p className="studio-error">{error}</p>}
            <footer className="studio-form-footer"><div>{step === 1 ? <><span>{completedFields} of {path.fields.length} signals captured</span><p>{path.nextPromise}</p></> : <><span>{path.steps[step - 1].label}</span><p>Your decisions remain editable before production.</p></>}</div><div>{step > 1 && <button className="studio-back-button" onClick={() => { setError(""); setStep(step - 1); }}><ArrowLeft size={16} /> Back</button>}{step < 4 ? <button className="studio-next-button" onClick={next}>Continue to {path.steps[step].label} <ArrowRight size={16} /></button> : <button className="studio-next-button" disabled={working} onClick={submit}>{working ? "Building your plan…" : `Build ${path.steps[3].label}`} <Sparkles size={16} /></button>}</div></footer>
          </section>

          <aside className="studio-preview-panel"><div className={`preview-art preview-${path.motif}`}><span /><span /><span /><div><small>LIVE CREATIVE BRIEF</small><strong>{previewTitle}</strong><p>{path.label}</p></div></div><div className="preview-heading"><FileText size={15} /><span><small>INTELLIGENT PREVIEW</small><b>What Clarity Loop is shaping</b></span></div><p className="preview-prompt">{path.previewPrompt}</p><div className="preview-modules">{previewDetails.map((item, index) => <article className={item.value !== "Develops as you work" ? "populated" : ""} key={item.label}><span>0{index + 1}</span><div><small>{item.label}</small><p>{item.value}</p></div></article>)}</div><div className="preview-integrity"><ShieldCheck size={14} /><span><b>Source-safe workspace</b><small>Your original material remains separate from generated plans.</small></span></div></aside>
        </div>
      </main>
    </section>
  </div>;
}
