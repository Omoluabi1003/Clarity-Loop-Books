import type { CreationPathId, ProjectType } from "./types";

export type CreationFieldType = "text" | "textarea" | "file" | "url";
export type CreationFieldSection = "identity" | "origin" | "creative_direction" | "audience_promise" | "output_goal";

export interface CreationFieldConfig {
  name: string;
  label: string;
  placeholder: string;
  type: CreationFieldType;
  required?: boolean;
  span?: "full" | "half";
  hint?: string;
  section: CreationFieldSection;
}

export interface CreationPathConfig {
  id: CreationPathId;
  projectType: ProjectType;
  label: string;
  shortLabel: string;
  description: string;
  positioning: string;
  bestFor: string;
  sampleOutput: string;
  accent: string;
  icon: "lightbulb" | "nonfiction" | "fiction" | "upload" | "screen" | "publishing" | "pitch";
  motif: string;
  headline: string;
  support: string;
  directorNote: string;
  steps: [string, string, string, string];
  stepOne: { title: string; subtitle: string; fields: CreationFieldConfig[] };
  audience: { title: string; subtitle: string; label: string; placeholder: string; genreLabel: string; genreHint: string };
  voice: { title: string; subtitle: string; toneLabel: string; styleLabel: string; directionLabel: string; directionPlaceholder: string };
  output: { title: string; subtitle: string; primaryLabel: string; promise: string };
  preview: [string, string, string, string];
  previewEmpty: [string, string, string, string];
}

export const CREATION_PATH_CONFIG: Record<CreationPathId, CreationPathConfig> = {
  start_from_idea: {
    id: "start_from_idea", projectType: "idea", label: "Start From an Idea", shortLabel: "Idea Studio", accent: "gold", icon: "lightbulb", motif: "idea",
    description: "Turn a recurring thought, lesson, or vision into a structured creative direction.", positioning: "A guided discovery room for ideas that have not chosen their final format yet.", bestFor: "Rough concepts & early sparks", sampleOutput: "Creative brief + recommended format",
    headline: "Turn a raw idea into a clear creative plan.", support: "Start with what you know. Clarity Loop will shape the structure, audience, and next move.", directorNote: "Do not force the format too early. The strongest outcome often appears after the idea’s real promise becomes visible.",
    steps: ["Idea Spark", "People & Purpose", "Creative Direction", "Recommended Plan"],
    stepOne: { title: "What idea keeps coming back to you?", subtitle: "Give the idea a name, then describe the message, story, or outcome you want to create.", fields: [
      { name: "workingTitle", label: "Working title", placeholder: "e.g. The Courage to Begin", type: "text", required: true, span: "half", section: "identity" },
      { name: "creatorName", label: "Creator or author name", placeholder: "Name shown on the project", type: "text", required: true, span: "half", section: "identity" },
      { name: "originStory", label: "Where did this idea come from?", placeholder: "Describe the moment, problem, lesson, question, or experience that inspired this idea.", type: "textarea", required: true, section: "origin" },
      { name: "desiredOutcome", label: "What should this become?", placeholder: "A book, screenplay, devotional, course, workbook, documentary, or something else.", type: "textarea", section: "creative_direction" },
      { name: "readerOrViewerImpact", label: "What should people feel, understand, or do after experiencing it?", placeholder: "Describe the transformation or takeaway.", type: "textarea", required: true, section: "audience_promise" },
    ] },
    audience: { title: "Who needs this idea most?", subtitle: "Define the people, moment, and need this work should meet.", label: "Intended reader, viewer, or learner", placeholder: "Describe who they are, what they are facing, and why this idea matters to them.", genreLabel: "Likely creative category", genreHint: "Choose the closest fit; the final format can still evolve." },
    voice: { title: "How should the idea come alive?", subtitle: "Set the emotional register and the kind of creative guidance you want.", toneLabel: "Emotional tone", styleLabel: "Creative approach", directionLabel: "Visual or cover direction", directionPlaceholder: "e.g. a single light opening through deep blue layers" },
    output: { title: "Choose the shape of the first plan.", subtitle: "Set a practical scope. The blueprint remains fully editable.", primaryLabel: "Build My Creative Plan", promise: "Clarity Loop will recommend the strongest format, audience position, and production path." },
    preview: ["Possible formats", "Audience possibilities", "Creative direction", "Next best path"], previewEmpty: ["Book, screen, learning, or hybrid", "Emerges from the impact you define", "Guided by your origin and tone", "Recommended after idea analysis"],
  },
  nonfiction_book: {
    id: "nonfiction_book", projectType: "nonfiction", label: "Nonfiction Book", shortLabel: "Nonfiction Studio", accent: "navy", icon: "nonfiction", motif: "framework",
    description: "Build an authoritative book around a thesis, reader problem, and ownable method.", positioning: "For business, faith, memoir, leadership, education, and thought-leadership books.", bestFor: "Experts, leaders & teachers", sampleOutput: "Book promise + chapter framework",
    headline: "Build a book that teaches, guides, and transforms.", support: "Shape your thesis, audience, framework, and reader promise before drafting.", directorNote: "A credible nonfiction book makes one clear promise and earns it chapter by chapter. Specificity creates authority.",
    steps: ["Book Promise", "Reader & Market", "Authority & Voice", "Chapter Framework"],
    stepOne: { title: "What truth, method, or message are you ready to teach?", subtitle: "Nonfiction begins with a clear promise to the reader.", fields: [
      { name: "title", label: "Book title", placeholder: "e.g. The Clarity Loop", type: "text", required: true, span: "half", section: "identity" },
      { name: "subtitle", label: "Subtitle", placeholder: "e.g. Modern Workflows, AI, and Why Understanding Now Comes After Action", type: "text", span: "half", section: "identity" },
      { name: "authorName", label: "Author name", placeholder: "Name shown on the cover and title page", type: "text", required: true, section: "identity" },
      { name: "centralThesis", label: "Central thesis", placeholder: "What is the main argument or idea this book will prove?", type: "textarea", required: true, section: "origin" },
      { name: "readerProblem", label: "Reader problem", placeholder: "What frustration, confusion, pain, or ambition brings the reader to this book?", type: "textarea", required: true, span: "half", section: "creative_direction" },
      { name: "readerTransformation", label: "Reader transformation", placeholder: "What should the reader understand or become able to do by the end?", type: "textarea", required: true, span: "half", section: "audience_promise" },
      { name: "frameworkOrMethod", label: "Framework, method, or message", placeholder: "Describe the model, process, lessons, or principles the book will organize.", type: "textarea", required: true, section: "creative_direction" },
    ] },
    audience: { title: "Position the book for the right reader.", subtitle: "Clarify the buyer, category, and credible reason they will choose this book.", label: "Primary reader profile", placeholder: "Role, life stage, urgent problem, existing knowledge, and desired result.", genreLabel: "Publishing category", genreHint: "This guides structure, market language, and comparable positioning." },
    voice: { title: "Define your authority on the page.", subtitle: "Choose how expertise, stories, evidence, and instruction should work together.", toneLabel: "Authorial tone", styleLabel: "Teaching style", directionLabel: "Cover positioning", directionPlaceholder: "e.g. executive, decisive, minimal, systems-focused" },
    output: { title: "Build the nonfiction architecture.", subtitle: "Set the publishing scope for a coherent, useful, market-aware manuscript.", primaryLabel: "Build My Book Framework", promise: "Your blueprint will connect the thesis, reader promise, method, and chapter progression." },
    preview: ["Book promise", "Audience fit", "Framework clarity", "Publishing category"], previewEmpty: ["Defined by thesis + transformation", "Refined in the next room", "Method becomes chapter logic", "Matched to reader expectations"],
  },
  fiction_book: {
    id: "fiction_book", projectType: "fiction", label: "Fiction Book", shortLabel: "Fiction Studio", accent: "plum", icon: "fiction", motif: "story",
    description: "Develop a story engine with characters, conflict, world logic, and emotional stakes.", positioning: "For novels, novellas, genre fiction, and character-driven worlds.", bestFor: "Novelists & storytellers", sampleOutput: "Story bible + plot architecture",
    headline: "Create a world readers do not want to leave.", support: "Shape characters, conflict, stakes, setting, and emotional arc before drafting.", directorNote: "Plot is pressure applied to character. Give us a desire worth pursuing and resistance strong enough to change the person pursuing it.",
    steps: ["Story Seed", "Characters & Conflict", "Voice & World", "Plot & Chapter Plan"],
    stepOne: { title: "What story are you ready to tell?", subtitle: "Fiction begins with a character who wants something and a world that resists them.", fields: [
      { name: "storyTitle", label: "Story title", placeholder: "e.g. The Last Door in Lagos", type: "text", required: true, span: "half", section: "identity" },
      { name: "authorName", label: "Author name", placeholder: "Name shown on the cover", type: "text", required: true, span: "half", section: "identity" },
      { name: "genre", label: "Genre", placeholder: "Drama, romance, thriller, mystery, fantasy, Christian fiction...", type: "text", required: true, section: "identity" },
      { name: "mainCharacter", label: "Main character", placeholder: "Who is the story about? What do they believe they need?", type: "textarea", required: true, span: "half", section: "creative_direction" },
      { name: "centralConflict", label: "Central conflict", placeholder: "What do they want, and what stands in their way?", type: "textarea", required: true, span: "half", section: "creative_direction" },
      { name: "setting", label: "Setting and world", placeholder: "Where and when does the story take place? What makes this world distinct?", type: "textarea", required: true, span: "half", section: "creative_direction" },
      { name: "emotionalPromise", label: "Emotional promise", placeholder: "What should readers feel by the end?", type: "textarea", required: true, span: "half", section: "audience_promise" },
    ] },
    audience: { title: "Find the readers who will enter this world.", subtitle: "Genre expectations and emotional appetite shape pace, stakes, and payoff.", label: "Ideal reader and emotional appetite", placeholder: "Who reads this kind of story, and what experience are they hoping to have?", genreLabel: "Story genre", genreHint: "Genre is a promise to the reader, not a creative restriction." },
    voice: { title: "Set the camera, voice, and atmosphere.", subtitle: "Define how the world feels and how closely readers live inside the characters.", toneLabel: "Story atmosphere", styleLabel: "Narrative style", directionLabel: "World and cover motif", directionPlaceholder: "e.g. rain-lit Lagos, one impossible red door, intimate cinematic realism" },
    output: { title: "Map the pressure of the plot.", subtitle: "Choose a scope that gives the character arc room to earn its ending.", primaryLabel: "Build My Story Bible", promise: "Your plan will connect character desire, escalating conflict, world rules, and emotional resolution." },
    preview: ["Story engine", "Character arc", "Conflict strength", "Series potential"], previewEmpty: ["Desire + resistance + stakes", "Built from the protagonist", "Tested across the plot", "Assessed from world depth"],
  },
  upload_manuscript: {
    id: "upload_manuscript", projectType: "upload", label: "Upload Manuscript", shortLabel: "Editorial Review", accent: "sage", icon: "upload", motif: "manuscript",
    description: "Bring an existing draft into an editorial workspace for diagnosis and improvement.", positioning: "For manuscripts, PDFs, DOCX drafts, EPUBs, and book project links.", bestFor: "Authors with a working draft", sampleOutput: "Editorial report + revision plan",
    headline: "Bring your draft. We will help sharpen it.", support: "Upload a manuscript for structure, repetition, tone, publishing, and adaptation analysis.", directorNote: "The original remains the source of truth. Analysis should reveal what to preserve—not only what to change.",
    steps: ["Upload Source", "Detected Audience", "Review Goals", "Improvement Plan"],
    stepOne: { title: "What existing work should we analyze?", subtitle: "Upload a file or provide a link. Clarity Loop will preserve the original and create an improvement report.", fields: [
      { name: "projectTitle", label: "Project title", placeholder: "Name this manuscript project", type: "text", required: true, span: "half", section: "identity" },
      { name: "authorName", label: "Author name", placeholder: "Original author or project owner", type: "text", required: true, span: "half", section: "identity" },
      { name: "uploadFile", label: "Upload manuscript", placeholder: "PDF, DOCX, TXT, Markdown, or EPUB", type: "file", hint: "Accepted for intake: PDF, DOCX, TXT, MD, and EPUB.", section: "origin" },
      { name: "sourceLink", label: "Source link", placeholder: "Paste a website, cloud document, or project link", type: "url", section: "origin" },
      { name: "analysisGoal", label: "What should Clarity Loop focus on?", placeholder: "Repetition, structure, clarity, tone, market fit, screenplay potential, publishing readiness...", type: "textarea", required: true, section: "creative_direction" },
    ] },
    audience: { title: "Confirm who the manuscript is serving.", subtitle: "Give the editorial review a market and reader lens—not only a grammar lens.", label: "Known or intended audience", placeholder: "Who is this draft for, and what should it deliver for them?", genreLabel: "Manuscript category", genreHint: "The category helps calibrate structure, pace, and reader expectations." },
    voice: { title: "Set the editorial brief.", subtitle: "Tell the review desk what must remain intact and where intervention is welcome.", toneLabel: "Existing or intended tone", styleLabel: "Preferred editorial approach", directionLabel: "Non-negotiables to preserve", directionPlaceholder: "e.g. keep personal stories, faith language, and conversational warmth" },
    output: { title: "Choose the depth of the review.", subtitle: "The first pass creates an editable improvement plan before any rewrite begins.", primaryLabel: "Create Editorial Report", promise: "Clarity Loop will map structure, risks, strengths, and prioritized revision opportunities." },
    preview: ["Detected structure", "Analysis goals", "Improvement options", "Publishing readiness"], previewEmpty: ["Available after source intake", "Driven by your editorial brief", "Prioritized by impact", "Scored after analysis"],
  },
  screen_adaptation: {
    id: "screen_adaptation", projectType: "screenplay", label: "Screen Adaptation", shortLabel: "Adaptation Studio", accent: "copper", icon: "screen", motif: "cinema",
    description: "Translate books, memoirs, sermons, and reports into visual story architecture.", positioning: "For feature films, pilots, documentaries, docuseries, stage, and short-form screen work.", bestFor: "Rights holders & producers", sampleOutput: "Logline + treatment plan",
    headline: "Turn the page into scenes.", support: "Transform source material into a screenplay, documentary, pilot, or visual treatment.", directorNote: "Adaptation is not transcription. Find the visible action, human tension, and sequence the audience can experience on screen.",
    steps: ["Source Material", "Audience & Format", "Cinematic Tone", "Treatment Plan"],
    stepOne: { title: "What source should become screen content?", subtitle: "Start with the source, then choose the format: film, TV, documentary, stage, or video.", fields: [
      { name: "sourceTitle", label: "Source title", placeholder: "Title of the book, memoir, article, sermon, or report", type: "text", required: true, span: "half", section: "identity" },
      { name: "creatorName", label: "Creator or author name", placeholder: "Name attached to the source material", type: "text", required: true, span: "half", section: "identity" },
      { name: "sourceSummary", label: "Source summary", placeholder: "What is the story, message, or central idea?", type: "textarea", required: true, section: "origin" },
      { name: "adaptationFormat", label: "Adaptation format", placeholder: "Feature film, TV pilot, docuseries, documentary, short film, stage play...", type: "text", required: true, span: "half", section: "creative_direction" },
      { name: "screenTone", label: "Screen tone", placeholder: "Cinematic, emotional, educational, suspenseful, inspirational, corporate...", type: "text", required: true, span: "half", section: "creative_direction" },
    ] },
    audience: { title: "Place the adaptation in its viewing market.", subtitle: "Format, runtime, audience, and platform determine what the source must become.", label: "Target viewer and platform", placeholder: "Who is watching, where are they watching, and what keeps them engaged?", genreLabel: "Screen format / category", genreHint: "Choose the closest production lane for structure and pacing." },
    voice: { title: "Direct the screen experience.", subtitle: "Translate the source voice into image, rhythm, performance, and sound.", toneLabel: "Cinematic tone", styleLabel: "Visual storytelling style", directionLabel: "Signature visual direction", directionPlaceholder: "e.g. intimate handheld realism opening into expansive archival imagery" },
    output: { title: "Commission the treatment plan.", subtitle: "Set the development scope for a screen-ready adaptation blueprint.", primaryLabel: "Build Adaptation Treatment", promise: "Your plan will surface the logline, act structure, scene opportunities, and adaptation risks." },
    preview: ["Logline", "Act structure", "Scene potential", "Pitch strength"], previewEmpty: ["Distilled from the source", "Matched to chosen format", "Found in visible turning points", "Measured after treatment"],
  },
  publishing_pack: {
    id: "publishing_pack", projectType: "publishing_pack", label: "Publishing Pack", shortLabel: "Publishing Desk", accent: "blue", icon: "publishing", motif: "publishing",
    description: "Prepare a finished book for credible listing, discovery, launch, and distribution.", positioning: "For authors preparing metadata, cover direction, store copy, keywords, and launch assets.", bestFor: "Books nearing release", sampleOutput: "Metadata + launch asset pack",
    headline: "Prepare the book for the marketplace.", support: "Generate the assets that help a finished book look credible, searchable, and launch-ready.", directorNote: "Publishing metadata is part positioning, part invitation. It should make the right reader recognize the book immediately.",
    steps: ["Book Details", "Market Position", "Cover & Metadata", "Publishing Assets"],
    stepOne: { title: "What book are we preparing to publish?", subtitle: "Bring the book details, then generate cover assets, metadata, description, keywords, and launch copy.", fields: [
      { name: "bookTitle", label: "Book title", placeholder: "Title shown on the publishing listing", type: "text", required: true, span: "half", section: "identity" },
      { name: "subtitle", label: "Subtitle", placeholder: "Optional subtitle", type: "text", span: "half", section: "identity" },
      { name: "authorName", label: "Author name", placeholder: "Name shown on the cover and listing", type: "text", required: true, section: "identity" },
      { name: "bookDescription", label: "Book description", placeholder: "Paste the current description or describe the book.", type: "textarea", required: true, section: "origin" },
      { name: "publishingPlatform", label: "Publishing platform", placeholder: "Amazon KDP, IngramSpark, EPUB, PDF, audiobook...", type: "text", required: true, span: "half", section: "creative_direction" },
      { name: "launchGoal", label: "Launch goal", placeholder: "Sell, build authority, teach, minister, promote a service, attract speaking opportunities...", type: "textarea", required: true, span: "half", section: "output_goal" },
    ] },
    audience: { title: "Position the book on the shelf.", subtitle: "Define the buyer, category neighborhood, and search language around the book.", label: "Primary book buyer", placeholder: "Who is most likely to buy, recommend, or gift this book—and what are they searching for?", genreLabel: "Retail category", genreHint: "This becomes the basis for categories, keywords, and comparable positioning." },
    voice: { title: "Set the storefront presentation.", subtitle: "Align cover language, metadata tone, and launch copy into one credible signal.", toneLabel: "Listing tone", styleLabel: "Marketing copy style", directionLabel: "Cover and thumbnail direction", directionPlaceholder: "e.g. bold authority title, warm gold signal, highly legible at thumbnail size" },
    output: { title: "Assemble the publishing assets.", subtitle: "Choose the manuscript scope used to calibrate description length and production details.", primaryLabel: "Create Publishing Pack", promise: "The pack will organize back-cover copy, keywords, categories, metadata, and launch messaging." },
    preview: ["Back cover copy", "Keywords", "Categories", "Marketing blurb"], previewEmpty: ["Built from the reader promise", "Matched to search intent", "Aligned to retail fit", "Written for the launch goal"],
  },
  movie_pitch_pack: {
    id: "movie_pitch_pack", projectType: "movie_pitch_pack", label: "Movie or Series Pitch Pack", shortLabel: "Pitch Room", accent: "ink", icon: "pitch", motif: "pitch",
    description: "Shape screen material into a persuasive producer, studio, or investor-facing package.", positioning: "For films, limited series, pilots, documentaries, and docuseries seeking support.", bestFor: "Creators entering the pitch room", sampleOutput: "Logline + treatment + deck logic",
    headline: "Shape the concept for the screen industry.", support: "Create loglines, treatments, character summaries, pitch copy, and poster direction.", directorNote: "A pitch is not the whole story. It is the sharpest evidence that this concept has an audience, an engine, and a reason to exist now.",
    steps: ["Screen Concept", "Audience & Market", "Tone & Comparables", "Pitch Package"],
    stepOne: { title: "What screen concept are we pitching?", subtitle: "Define the premise, audience, format, tone, and why this story deserves to be seen.", fields: [
      { name: "projectTitle", label: "Project title", placeholder: "Title of the film, series, or documentary", type: "text", required: true, span: "half", section: "identity" },
      { name: "creatorName", label: "Creator name", placeholder: "Writer, producer, or owner of the concept", type: "text", required: true, span: "half", section: "identity" },
      { name: "premise", label: "Premise", placeholder: "What is the core story or concept?", type: "textarea", required: true, section: "origin" },
      { name: "format", label: "Format", placeholder: "Feature film, limited series, TV pilot, documentary, docuseries...", type: "text", required: true, span: "half", section: "creative_direction" },
      { name: "targetAudience", label: "Target audience", placeholder: "Who would watch this and why?", type: "textarea", required: true, span: "half", section: "audience_promise" },
      { name: "whyNow", label: "Why now?", placeholder: "Why does this story matter in this moment?", type: "textarea", required: true, section: "output_goal" },
    ] },
    audience: { title: "Make the market case.", subtitle: "Identify the audience, buyer, platform, and cultural opening for this project.", label: "Audience and buyer logic", placeholder: "Who watches, who buys, where it fits, and what conversation it enters.", genreLabel: "Pitch category", genreHint: "This helps frame comparables, format expectations, and commercial language." },
    voice: { title: "Give the project a pitch-room identity.", subtitle: "Set the cinematic promise and the language that makes the concept memorable.", toneLabel: "Pitch tone", styleLabel: "Presentation style", directionLabel: "Poster or key-art direction", directionPlaceholder: "e.g. prestige ensemble drama, one iconic silhouette, restrained gold typography" },
    output: { title: "Package the case for the screen.", subtitle: "Choose the development scale for a focused, persuasive pitch blueprint.", primaryLabel: "Build My Pitch Pack", promise: "Your package will connect logline, audience, comparables, why-now logic, and visual positioning." },
    preview: ["Logline", "Comparable titles", "Pitch angle", "Poster concept"], previewEmpty: ["One sentence with a story engine", "Calibrated by tone and market", "Built from audience + why now", "Directed by the visual promise"],
  },
};

export const CREATION_PATHS = Object.values(CREATION_PATH_CONFIG);
