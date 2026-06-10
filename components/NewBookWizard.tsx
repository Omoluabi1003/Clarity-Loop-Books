import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  CheckCircle2,
  Clapperboard,
  FileSearch,
  Lightbulb,
  PackageCheck,
  PenTool,
  Presentation,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { AIAssistanceLevel, BookForm, BookTemplate, ChapterSizePreference, CreationPathId } from "@/lib/types";
import { BOOK_TYPES } from "@/lib/studio-catalog";
import { CREATION_PATH_CONFIG, type CreationFieldSection } from "@/lib/creation-paths";

const baseForm: BookForm = {
  projectType: "idea", sourceText: "", sourceUrl: "", title: "", subtitle: "", authorName: "", authorBio: "", authorEmail: "", authorWebsite: "", publisherCredit: "ETL GIS Consulting LLC", idea: "", genre: "Self-Help", targetAudience: "", tone: "Encouraging and clear", writingStyle: "Practical and story-led", chapterCount: 10, targetPageCount: 180, wordsPerPage: 275, chapterSizePreference: "auto", customChapterWords: 2500, aiAssistanceLevel: "guided", coverDirection: "",
};

const pathIcons = {
  lightbulb: Lightbulb,
  nonfiction: BookOpenText,
  fiction: PenTool,
  upload: FileSearch,
  screen: Clapperboard,
  publishing: PackageCheck,
  pitch: Presentation,
};

const titleFields = ["workingTitle", "title", "storyTitle", "projectTitle", "sourceTitle", "bookTitle"];
const authorFields = ["creatorName", "authorName"];

const fieldSectionDetails: { id: CreationFieldSection; label: string; description: string }[] = [
  { id: "identity", label: "Identity", description: "Name the work and the person shaping it." },
  { id: "origin", label: "Origin", description: "Give the studio the source material and context behind the project." },
  { id: "creative_direction", label: "Creative direction", description: "Define the central engine, approach, and choices that will guide development." },
  { id: "audience_promise", label: "Audience promise", description: "Clarify the experience, value, or transformation the work should deliver." },
  { id: "output_goal", label: "Output goal", description: "Set the practical result and the reason this project needs to exist now." },
];

interface Props {
  initialTemplate?: BookTemplate | null;
  initialPath?: CreationPathId;
  onClose: () => void;
  onCreate: (form: BookForm) => Promise<void>;
}

function firstValue(data: Record<string, string>, keys: string[]) {
  return keys.map((key) => data[key]?.trim()).find(Boolean) || "";
}

export function NewBookWizard({ initialTemplate, initialPath = "start_from_idea", onClose, onCreate }: Props) {
  const path = CREATION_PATH_CONFIG[initialPath];
  const Icon = pathIcons[path.icon];
  const genreOptions = path.projectType === "fiction" ? BOOK_TYPES.fiction : path.projectType === "screenplay" || path.projectType === "movie_pitch_pack" ? BOOK_TYPES.special : BOOK_TYPES.nonfiction;
  const initialData = useMemo(() => {
    const data: Record<string, string> = {};
    if (initialTemplate) data.genre = initialTemplate.genre;
    return data;
  }, [initialTemplate]);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Record<string, string>>(initialData);
  const [form, setForm] = useState<BookForm>(() => ({
    ...baseForm,
    projectType: path.projectType,
    genre: initialTemplate?.genre || genreOptions[0],
    targetAudience: initialTemplate?.targetAudience || "",
    tone: initialTemplate?.tone || baseForm.tone,
    writingStyle: initialTemplate?.writingStyle || baseForm.writingStyle,
    chapterCount: initialTemplate?.chapterCount || baseForm.chapterCount,
    targetPageCount: initialTemplate?.targetPageCount || baseForm.targetPageCount,
  }));

  const update = <K extends keyof BookForm>(key: K, value: BookForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  const updateData = (name: string, value: string) => {
    setData((current) => ({ ...current, [name]: value }));
    if (name === "targetAudience") setForm((current) => ({ ...current, targetAudience: value }));
    if (name === "genre") setForm((current) => ({ ...current, genre: value }));
    if (name === "screenTone") setForm((current) => ({ ...current, tone: value }));
  };
  const goTo = (nextStep: number) => { setDirection(nextStep > step ? 1 : -1); setStep(nextStep); setError(""); };

  const requiredMissing = path.stepOne.fields.filter((field) => field.required && !data[field.name]?.trim());
  const hasUploadSource = path.id !== "upload_manuscript" || Boolean(data.uploadFile?.trim() || data.sourceLink?.trim());

  const next = () => {
    if (step === 1 && (requiredMissing.length || !hasUploadSource)) {
      const message = !hasUploadSource
        ? "Add a manuscript file or a source link so the editorial review has material to analyze."
        : `Complete ${requiredMissing.slice(0, 2).map((field) => field.label.toLowerCase()).join(" and ")} before continuing.`;
      setError(message);
      return;
    }
    if (step === 2 && !form.targetAudience.trim()) {
      setError(`Add ${path.audience.label.toLowerCase()} before moving into creative direction.`);
      return;
    }
    goTo(Math.min(4, step + 1));
  };

  const canonicalIdea = path.stepOne.fields
    .filter((field) => !titleFields.includes(field.name) && !authorFields.includes(field.name) && field.name !== "subtitle" && field.name !== "uploadFile")
    .map((field) => `${field.label}: ${data[field.name] || "Not provided"}`)
    .join("\n\n");

  const submit = async () => {
    const title = firstValue(data, titleFields) || "Untitled project";
    const authorName = firstValue(data, authorFields) || "Creator name needed";
    const derived: BookForm = {
      ...form,
      projectType: path.projectType,
      title,
      subtitle: data.subtitle || "",
      authorName,
      idea: canonicalIdea,
      sourceUrl: data.sourceLink || "",
      sourceText: data.uploadFile ? `Manuscript intake file: ${data.uploadFile}\n\n${canonicalIdea}` : canonicalIdea,
      genre: data.genre || data.adaptationFormat || data.format || data.publishingPlatform || form.genre,
    };
    setWorking(true);
    setError("");
    try {
      await onCreate(derived);
    } catch {
      setError(`We could not create the ${path.output.primaryLabel.toLowerCase()}. Please try again.`);
      setWorking(false);
    }
  };

  const previewValues = [
    firstValue(data, ["desiredOutcome", "centralThesis", "mainCharacter", "analysisGoal", "sourceSummary", "bookDescription", "premise"]),
    data.targetAudience || form.targetAudience,
    firstValue(data, ["frameworkOrMethod", "centralConflict", "screenTone", "launchGoal", "whyNow", "readerOrViewerImpact"]),
    step >= 3 ? `${form.tone} · ${form.writingStyle}` : "",
  ];

  const stepOneSections = fieldSectionDetails
    .map((section) => ({ ...section, fields: path.stepOne.fields.filter((field) => field.section === section.id) }))
    .filter((section) => section.fields.length > 0);

  return (
    <div className={`creation-studio-overlay studio-accent-${path.accent}`} role="dialog" aria-modal="true" aria-label={`${path.label} setup studio`}>
      <header className="creation-studio-header">
        <button type="button" className="studio-brand" onClick={onClose} aria-label="Close creation studio">
          <span className="brand-mark">CL</span>
          <span><strong>Clarity Loop</strong><small>CREATION ATELIER</small></span>
        </button>
        <div className="studio-path-identity"><Icon size={15} /><span>{path.shortLabel}</span><i /><small><b>Studio Mode</b> · Private working session</small></div>
        <button type="button" className="studio-close" onClick={onClose} aria-label="Close creation studio"><X size={20} /></button>
      </header>

      <div className="creation-studio-shell">
        <div className="studio-background-motif" aria-hidden="true"><span /><span /><span /><i /></div>
        <aside className="creation-studio-aside">
          <div className={`path-motif motif-${path.motif}`} aria-hidden="true"><span /><span /><span /><Icon size={34} /></div>
          <p className="eyebrow">{path.label.toUpperCase()}</p>
          <h2>{path.headline}</h2>
          <p className="studio-support">{path.support}</p>
          <ol className="studio-progress">
            {path.steps.map((label, index) => {
              const number = index + 1;
              return (
                <li className={step === number ? "active" : step > number ? "done" : ""} key={label}>
                  <button type="button" onClick={() => number < step && goTo(number)} disabled={number > step} aria-current={step === number ? "step" : undefined}>
                    <span>{step > number ? <Check size={13} /> : number}</span>
                    <em><small>0{number}</small>{label}</em>
                  </button>
                </li>
              );
            })}
          </ol>
          <blockquote><Sparkles size={14} /><span><b>Creative director’s note</b>{path.directorNote}</span></blockquote>
        </aside>

        <main className="creation-studio-main">
          <div className="studio-stage-bar">
            <span>Stage 0{step} <i /> {path.steps[step - 1]}</span>
            <div><b style={{ width: `${step * 25}%` }} /></div>
            <small>{step * 25}% framed</small>
          </div>

          <div className="studio-workspace studio-workspace-grid">
            <section className="studio-stage-shell studio-form-panel studio-form-canvas">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  className="studio-step"
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -18 }}
                  transition={{ duration: .24, ease: "easeOut" }}
                >
                  {step === 1 && <>
                    <div className="studio-step-heading"><p className="eyebrow">SOURCE ROOM</p><h1>{path.stepOne.title}</h1><p>{path.stepOne.subtitle}</p></div>
                    <div className="studio-form-sections">
                      {stepOneSections.map((section, sectionIndex) => (
                        <section className="studio-form-section" key={section.id} aria-labelledby={`studio-section-${section.id}`}>
                          <header className="studio-section-header">
                            <span>0{sectionIndex + 1}</span>
                            <div><h2 id={`studio-section-${section.id}`}>{section.label}</h2><p>{section.description}</p></div>
                          </header>
                          <div className="studio-field-grid path-field-grid">
                            {section.fields.map((field) => (
                              <label className={field.span === "half" || (!field.span && field.type === "text") ? "field-half" : "studio-field-full field-full"} key={field.name}>
                                <span>{field.label}{field.required && <b>Required</b>}</span>
                                {field.type === "textarea" ? (
                                  <textarea required={field.required} aria-required={field.required} value={data[field.name] || ""} onChange={(event) => updateData(field.name, event.target.value)} placeholder={field.placeholder} />
                                ) : field.type === "file" ? (
                                  <span className={`studio-file-drop ${data[field.name] ? "has-file" : ""}`}>
                                    <input type="file" accept=".pdf,.docx,.txt,.md,.epub" aria-label={field.label} onChange={(event) => updateData(field.name, event.target.files?.[0]?.name || "")} />
                                    <UploadCloud size={24} />
                                    <strong>{data[field.name] || "Choose a manuscript or drop it here"}</strong>
                                    <small>{field.hint || field.placeholder}</small>
                                  </span>
                                ) : (
                                  <input type={field.type === "url" ? "url" : "text"} required={field.required} aria-required={field.required} value={data[field.name] || ""} onChange={(event) => updateData(field.name, event.target.value)} placeholder={field.placeholder} />
                                )}
                                {field.hint && field.type !== "file" && <small>{field.hint}</small>}
                              </label>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </>}

                  {step === 2 && <>
                    <div className="studio-step-heading"><p className="eyebrow">POSITIONING ROOM</p><h1>{path.audience.title}</h1><p>{path.audience.subtitle}</p></div>
                    <div className="studio-form-sections">
                      <section className="studio-form-section" aria-labelledby="audience-promise-heading">
                        <header className="studio-section-header"><span>01</span><div><h2 id="audience-promise-heading">Audience promise</h2><p>Define who this work is for and the experience or transformation it should deliver.</p></div></header>
                        <label className="studio-field studio-field-full"><span>{path.audience.label}<b>Required</b></span><textarea required aria-required="true" value={form.targetAudience} onChange={(event) => update("targetAudience", event.target.value)} placeholder={path.audience.placeholder} /></label>
                      </section>
                      <section className="studio-form-section" aria-labelledby="market-position-heading">
                        <header className="studio-section-header"><span>02</span><div><h2 id="market-position-heading">Market position</h2><p>Place the project in the right creative and commercial conversation.</p></div></header>
                        <label className="studio-field studio-field-full"><span>{path.audience.genreLabel}</span><select value={form.genre} onChange={(event) => update("genre", event.target.value)}>{genreOptions.map((genre) => <option key={genre}>{genre}</option>)}</select><small>{path.audience.genreHint}</small></label>
                        <div className="intelligence-card"><Sparkles size={17} /><span><b>Positioning lens</b>Clarity Loop will use this audience definition to calibrate structure, language, examples, pacing, and the final production plan.</span></div>
                      </section>
                    </div>
                  </>}

                  {step === 3 && <>
                    <div className="studio-step-heading"><p className="eyebrow">DIRECTION ROOM</p><h1>{path.voice.title}</h1><p>{path.voice.subtitle}</p></div>
                    <div className="studio-form-sections">
                      <section className="studio-form-section" aria-labelledby="creative-direction-heading">
                        <header className="studio-section-header"><span>01</span><div><h2 id="creative-direction-heading">Creative direction</h2><p>Set the voice, visual language, and editorial choices that should remain consistent.</p></div></header>
                        <div className="studio-field-grid path-field-grid">
                          <label className="studio-field field-half"><span>{path.voice.toneLabel}</span><input value={form.tone} onChange={(event) => update("tone", event.target.value)} placeholder="Describe the emotional register" /></label>
                          <label className="studio-field field-half"><span>{path.voice.styleLabel}</span><input value={form.writingStyle} onChange={(event) => update("writingStyle", event.target.value)} placeholder="Describe the creative or editorial approach" /></label>
                          <label className="studio-field studio-field-full field-full"><span>{path.voice.directionLabel}<b>Optional</b></span><textarea value={form.coverDirection} onChange={(event) => update("coverDirection", event.target.value)} placeholder={path.voice.directionPlaceholder} /></label>
                        </div>
                      </section>
                      <section className="studio-form-section" aria-labelledby="collaboration-heading">
                        <header className="studio-section-header"><span>02</span><div><h2 id="collaboration-heading">Studio collaboration</h2><p>Choose how actively Clarity Loop should shape the creative plan around your decisions.</p></div></header>
                        <p className="studio-field-label">AI collaboration level</p>
                        <div className="studio-assistance-grid">
                      {([[
                        "full", "Studio leads", "Clarity Loop proposes the structure and fills creative gaps."], ["guided", "Co-create", "You make key decisions while the studio develops the plan."], ["assistive", "Creator leads", "The studio organizes and polishes the direction you provide."]
                      ] as [AIAssistanceLevel, string, string][]).map(([value, label, copy]) => (
                        <button type="button" className={form.aiAssistanceLevel === value ? "selected" : ""} onClick={() => update("aiAssistanceLevel", value)} key={value}><span>{form.aiAssistanceLevel === value && <Check size={12} />}</span><strong>{label}</strong><small>{copy}</small></button>
                      ))}
                        </div>
                      </section>
                    </div>
                  </>}

                  {step === 4 && <>
                    <div className="studio-step-heading"><p className="eyebrow">PRODUCTION ROOM</p><h1>{path.output.title}</h1><p>{path.output.subtitle}</p></div>
                    <div className="studio-form-sections">
                      <section className="studio-form-section" aria-labelledby="output-goal-heading">
                        <header className="studio-section-header"><span>01</span><div><h2 id="output-goal-heading">Output goal</h2><p>Set a realistic production scale for the manuscript or asset package you want to build.</p></div></header>
                        <div className="production-controls">
                          <label><span>Number of sections / chapters</span><div className="studio-number-control"><button type="button" aria-label="Decrease chapter count" onClick={() => update("chapterCount", Math.max(5, form.chapterCount - 1))}>−</button><strong aria-live="polite">{form.chapterCount}</strong><button type="button" aria-label="Increase chapter count" onClick={() => update("chapterCount", Math.min(30, form.chapterCount + 1))}>+</button></div></label>
                          <label><span>Target page count</span><input type="number" min="40" max="600" value={form.targetPageCount} onChange={(event) => update("targetPageCount", Number(event.target.value))} /></label>
                          <label><span>Words per page</span><input type="number" min="250" max="300" value={form.wordsPerPage} onChange={(event) => update("wordsPerPage", Number(event.target.value))} /></label>
                        </div>
                      </section>
                      <section className="studio-form-section" aria-labelledby="publishing-assets-heading">
                        <header className="studio-section-header"><span>02</span><div><h2 id="publishing-assets-heading">Publishing assets</h2><p>Choose the cadence that best fits the reading experience and final deliverable.</p></div></header>
                        <p className="studio-field-label">Production cadence</p>
                        <div className="studio-size-options">
                      {([['short', 'Concise'], ['medium', 'Standard'], ['long', 'Expansive'], ['auto', 'Studio decides']] as [ChapterSizePreference, string][]).map(([value, label]) => <button type="button" className={form.chapterSizePreference === value ? "selected" : ""} onClick={() => update("chapterSizePreference", value)} key={value}><CheckCircle2 size={14} />{label}</button>)}
                        </div>
                        <div className="studio-plan-summary"><span><small>Estimated manuscript</small><strong>{(form.targetPageCount * form.wordsPerPage).toLocaleString()} words</strong></span><i /><span><small>Average section</small><strong>{Math.round((form.targetPageCount * form.wordsPerPage) / form.chapterCount).toLocaleString()} words</strong></span><i /><span><small>Studio deliverable</small><strong>{path.shortLabel} blueprint</strong></span></div>
                      </section>
                    </div>
                  </>}
                </motion.div>
              </AnimatePresence>

              {error && <motion.p className="studio-form-error" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.p>}
              <div className="studio-footer-actions studio-actions-row">
                <button type="button" className="studio-back-button" onClick={() => step === 1 ? onClose() : goTo(step - 1)}><ArrowLeft size={16} /> {step === 1 ? "Exit studio" : "Back"}</button>
                {step < 4 ? <button type="button" className="studio-primary-button" onClick={next}>Continue to {path.steps[step]} <ArrowRight size={16} /></button> : <button type="button" className="studio-primary-button" onClick={submit} disabled={working}><Sparkles size={16} /> {working ? "Building the studio plan…" : path.output.primaryLabel}</button>}
              </div>
            </section>

            <aside className="studio-preview-panel studio-live-preview">
              <div className="preview-header"><span><Sparkles size={13} /> LIVE STUDIO READ</span><small>Updates as you write</small></div>
              <div className={`preview-art preview-art-${path.motif}`} aria-hidden="true"><Icon size={25} /><span>{firstValue(data, titleFields) || path.shortLabel}</span></div>
              <div className="preview-intro"><small>CREATIVE SIGNALS</small><h3>{firstValue(data, titleFields) || "Your direction is taking shape."}</h3><p>{path.output.promise}</p></div>
              <div className="preview-modules">
                {path.preview.map((label, index) => <article key={label}><span>0{index + 1}</span><div><small>{label}</small><p>{previewValues[index] || path.previewEmpty[index]}</p></div></article>)}
              </div>
              <div className="preview-confidence"><span><i style={{ width: `${Math.min(100, 18 + Object.values(data).filter(Boolean).length * 8 + (step - 1) * 14)}%` }} /></span><small>Creative brief confidence rises as details become specific.</small></div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
