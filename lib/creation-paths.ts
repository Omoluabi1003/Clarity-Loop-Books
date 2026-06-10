import type { CreationPathId, ProjectType } from "./types";

export type PathIconName = "idea" | "nonfiction" | "fiction" | "upload" | "adaptation" | "publishing" | "pitch";
export type PathFieldType = "text" | "textarea" | "file" | "url";

export interface CreationPathField {
  name: string;
  label: string;
  placeholder: string;
  type?: PathFieldType;
  optional?: boolean;
  wide?: boolean;
}

export interface CreationPathStep {
  label: string;
  title: string;
  subtitle: string;
  directorNote: string;
}

export interface CreationPathConfig {
  id: CreationPathId;
  projectType: ProjectType;
  label: string;
  cardLabel: string;
  positioning: string;
  bestFor: string;
  sampleOutput: string;
  icon: PathIconName;
  accent: string;
  motif: string;
  headline: string;
  support: string;
  firstStepTitle: string;
  firstStepSubtitle: string;
  fields: CreationPathField[];
  steps: CreationPathStep[];
  preview: string[];
  previewPrompt: string;
  validationMessage: string;
  nextPromise: string;
}

export const CREATION_PATH_CONFIG: Record<CreationPathId, CreationPathConfig> = {
  start_from_idea: {
    id: "start_from_idea", projectType: "idea", label: "Start From an Idea", cardLabel: "Start From an Idea",
    positioning: "For a rough concept, message, lesson, or vision that needs shape.", bestFor: "Early-stage concepts", sampleOutput: "Creative direction brief", icon: "idea", accent: "gold", motif: "spark",
    headline: "Turn a raw idea into a clear creative plan.", support: "Start with what you know. Clarity Loop will shape the structure, audience, and next move.",
    firstStepTitle: "What idea keeps coming back to you?", firstStepSubtitle: "Give the idea a name, then describe the message, story, or outcome you want to create.",
    fields: [
      { name: "workingTitle", label: "Working title", placeholder: "e.g. The Courage to Begin" },
      { name: "creatorName", label: "Creator or author name", placeholder: "Name shown on the project" },
      { name: "originStory", label: "Where did this idea come from?", placeholder: "Describe the moment, problem, lesson, question, or experience that inspired this idea.", type: "textarea", wide: true },
      { name: "desiredOutcome", label: "What should this become?", placeholder: "A book, screenplay, devotional, course, workbook, documentary, or something else.", type: "textarea" },
      { name: "readerOrViewerImpact", label: "What should people feel, understand, or do?", placeholder: "Describe the transformation or takeaway.", type: "textarea" },
    ],
    steps: [
      { label: "Idea Spark", title: "What idea keeps coming back to you?", subtitle: "Capture the source and intended transformation.", directorNote: "Do not polish the idea yet. Give us the honest version with energy in it." },
      { label: "Audience Possibility", title: "Who could this idea serve best?", subtitle: "Find the audience with the strongest need for this message.", directorNote: "A precise audience gives an open-ended idea somewhere meaningful to land." },
      { label: "Creative Direction", title: "What form and feeling fit the idea?", subtitle: "Choose the voice and format that can carry it.", directorNote: "We are looking for alignment—not trend chasing." },
      { label: "Path Recommendation", title: "Choose the strongest way forward.", subtitle: "Set the scale and let the studio recommend the next production path.", directorNote: "You will receive a practical brief, not just a brainstorm." },
    ], preview: ["Possible formats", "Audience possibilities", "Creative direction", "Next best path"], previewPrompt: "Your raw concept becomes a format-aware creative brief as you add detail.", validationMessage: "Name the idea, identify its creator, and tell us where it began.", nextPromise: "Next, we will identify the audience most likely to connect with this idea.",
  },
  nonfiction_book: {
    id: "nonfiction_book", projectType: "nonfiction", label: "Nonfiction Book", cardLabel: "Write a Nonfiction Book",
    positioning: "For business, faith, memoir, leadership, education, and thought-leadership books.", bestFor: "Experts & change-makers", sampleOutput: "Book thesis + framework", icon: "nonfiction", accent: "navy", motif: "columns",
    headline: "Build a book that teaches, guides, and transforms.", support: "Shape your thesis, audience, framework, and reader promise before drafting.",
    firstStepTitle: "What truth, method, or message are you ready to teach?", firstStepSubtitle: "Nonfiction begins with a clear promise to the reader.",
    fields: [
      { name: "title", label: "Book title", placeholder: "e.g. The Clarity Loop" }, { name: "subtitle", label: "Subtitle", placeholder: "e.g. Modern Workflows, AI, and Why Understanding Now Comes After Action", optional: true },
      { name: "authorName", label: "Author name", placeholder: "Name shown on the cover and title page" },
      { name: "centralThesis", label: "Central thesis", placeholder: "What is the main argument or idea this book will prove?", type: "textarea", wide: true },
      { name: "readerProblem", label: "Reader problem", placeholder: "What frustration, confusion, pain, or ambition brings the reader here?", type: "textarea" },
      { name: "readerTransformation", label: "Reader transformation", placeholder: "What should the reader understand or become able to do?", type: "textarea" },
      { name: "frameworkOrMethod", label: "Framework, method, or message", placeholder: "Describe the model, process, lessons, or principles the book will organize.", type: "textarea", wide: true },
    ],
    steps: [
      { label: "Thesis & Promise", title: "What truth are you ready to stand behind?", subtitle: "Define the argument and transformation at the heart of the book.", directorNote: "Authority starts with a promise the manuscript can actually fulfill." },
      { label: "Reader & Market", title: "Who needs this book—and what are they trying to solve?", subtitle: "Position the promise for a specific reader and shelf.", directorNote: "The best market position names both the reader and the tension they already feel." },
      { label: "Voice & Authority", title: "How should your expertise sound on the page?", subtitle: "Set a credible, human voice for the teaching.", directorNote: "Choose the voice you can sustain for an entire manuscript." },
      { label: "Framework & Chapters", title: "Turn the method into a teachable journey.", subtitle: "Set the book scale and shape the chapter architecture.", directorNote: "Every chapter should move the reader closer to the promised result." },
    ], preview: ["Book promise", "Audience fit", "Framework clarity", "Publishing category"], previewPrompt: "Your thesis and framework will become the spine of an authoritative book blueprint.", validationMessage: "Add a title, author, central thesis, and the reader problem this book solves.", nextPromise: "Next, we will sharpen the reader promise and market position.",
  },
  fiction_book: {
    id: "fiction_book", projectType: "fiction", label: "Fiction Book", cardLabel: "Write a Fiction Book",
    positioning: "For novels, novellas, short stories, genre fiction, and character-driven worlds.", bestFor: "Novelists & storytellers", sampleOutput: "Story bible + plot map", icon: "fiction", accent: "plum", motif: "moon",
    headline: "Create a world readers do not want to leave.", support: "Shape characters, conflict, stakes, setting, and emotional arc before drafting.",
    firstStepTitle: "What story are you ready to tell?", firstStepSubtitle: "Fiction begins with a character who wants something and a world that resists them.",
    fields: [
      { name: "storyTitle", label: "Story title", placeholder: "e.g. The Last Door in Lagos" }, { name: "authorName", label: "Author name", placeholder: "Name shown on the cover" },
      { name: "genre", label: "Genre", placeholder: "Drama, romance, thriller, mystery, fantasy, Christian fiction..." },
      { name: "mainCharacter", label: "Main character", placeholder: "Who is the story about?", type: "textarea" },
      { name: "centralConflict", label: "Central conflict", placeholder: "What do they want, and what stands in their way?", type: "textarea" },
      { name: "setting", label: "Setting and world", placeholder: "Where and when does the story take place?", type: "textarea" },
      { name: "emotionalPromise", label: "Emotional promise", placeholder: "What should readers feel by the end?", type: "textarea", wide: true },
    ],
    steps: [
      { label: "Story Seed", title: "What story are you ready to tell?", subtitle: "Find the character, desire, resistance, and emotional promise.", directorNote: "A compelling story seed contains motion: someone wants something, and getting it will cost them." },
      { label: "Characters & Conflict", title: "Who collides—and what is at stake?", subtitle: "Deepen character desire, opposition, and consequence.", directorNote: "Plot becomes memorable when external conflict puts internal identity under pressure." },
      { label: "Voice & World", title: "What makes this world unmistakably yours?", subtitle: "Define genre, atmosphere, point of view, and story texture.", directorNote: "World-building is not decoration. It should intensify every choice the character makes." },
      { label: "Plot & Chapter Plan", title: "Build the escalation readers will follow.", subtitle: "Set the story scale and map its turning points.", directorNote: "A strong plan protects discovery while preventing the middle from losing momentum." },
    ], preview: ["Story engine", "Character arc", "Conflict strength", "Series potential"], previewPrompt: "Character desire, resistance, and setting will combine into a living story engine.", validationMessage: "Add the story title, author, main character, and central conflict.", nextPromise: "Next, we will pressure-test the character, opposition, and stakes.",
  },
  upload_manuscript: {
    id: "upload_manuscript", projectType: "upload", label: "Upload Manuscript", cardLabel: "Upload a Manuscript",
    positioning: "For an existing manuscript, PDF, DOCX, draft, or book project.", bestFor: "Authors with a draft", sampleOutput: "Editorial improvement report", icon: "upload", accent: "sage", motif: "pages",
    headline: "Bring your draft. We will help sharpen it.", support: "Upload a manuscript for structure, repetition, tone, publishing, and adaptation analysis.",
    firstStepTitle: "What existing work should we analyze?", firstStepSubtitle: "Upload a file or provide a link. Clarity Loop will preserve the original and create an improvement report.",
    fields: [
      { name: "projectTitle", label: "Project title", placeholder: "Name this manuscript project" }, { name: "authorName", label: "Author name", placeholder: "Original author or project owner" },
      { name: "uploadFile", label: "Upload manuscript", placeholder: "PDF, DOCX, TXT, Markdown, or EPUB", type: "file", wide: true },
      { name: "sourceLink", label: "Source link", placeholder: "Paste a website, document, or project link", type: "url", optional: true },
      { name: "analysisGoal", label: "What should Clarity Loop focus on?", placeholder: "Repetition, structure, clarity, tone, market fit, screenplay potential, publishing readiness...", type: "textarea", wide: true },
    ],
    steps: [
      { label: "Upload Source", title: "What existing work should we analyze?", subtitle: "Secure the source and define editorial intent.", directorNote: "The original remains preserved. Recommendations become a separate, reviewable layer." },
      { label: "Detected Audience", title: "Who does the manuscript appear to serve?", subtitle: "Confirm or correct the audience and market signal.", directorNote: "A manuscript can be well written and still be unclear about who it is for." },
      { label: "Review Goals", title: "What kind of editorial intervention is useful?", subtitle: "Prioritize structure, clarity, repetition, voice, or adaptation potential.", directorNote: "Choose the most important editorial lens first. We can expand the review later." },
      { label: "Improvement Plan", title: "Set the depth of the manuscript review.", subtitle: "Choose the analysis scale and the assets you need next.", directorNote: "Your report will separate diagnosis from suggested revisions." },
    ], preview: ["Detected structure", "Analysis goals", "Improvement options", "Publishing readiness"], previewPrompt: "The manuscript source and editorial goal will shape a focused, non-destructive review.", validationMessage: "Name the project and author, then add a manuscript file or source link plus an analysis goal.", nextPromise: "Next, we will confirm the manuscript’s apparent reader and market.",
  },
  screen_adaptation: {
    id: "screen_adaptation", projectType: "screenplay", label: "Screen Adaptation", cardLabel: "Adapt for the Screen",
    positioning: "For turning books, memoirs, sermons, articles, or reports into screen-ready assets.", bestFor: "Source-to-screen projects", sampleOutput: "Treatment + scene map", icon: "adaptation", accent: "copper", motif: "frames",
    headline: "Turn the page into scenes.", support: "Transform source material into a screenplay, documentary, pilot, or visual treatment.",
    firstStepTitle: "What source should become screen content?", firstStepSubtitle: "Start with the source, then choose the format: film, TV, documentary, stage, or video.",
    fields: [
      { name: "sourceTitle", label: "Source title", placeholder: "Title of the book, memoir, article, sermon, or report" }, { name: "creatorName", label: "Creator or author name", placeholder: "Name attached to the source material" },
      { name: "sourceSummary", label: "Source summary", placeholder: "What is the story, message, or central idea?", type: "textarea", wide: true },
      { name: "adaptationFormat", label: "Adaptation format", placeholder: "Feature film, TV pilot, docuseries, documentary, short film, stage play...", type: "textarea" },
      { name: "screenTone", label: "Screen tone", placeholder: "Cinematic, emotional, educational, suspenseful, inspirational, corporate...", type: "textarea" },
    ],
    steps: [
      { label: "Source Material", title: "What source should become screen content?", subtitle: "Identify the dramatic core worth translating visually.", directorNote: "Adaptation is interpretation. We preserve the source promise while changing how the audience experiences it." },
      { label: "Audience & Format", title: "Where should this story live on screen?", subtitle: "Choose the format, runtime logic, and intended viewer.", directorNote: "A feature, pilot, and documentary ask different questions of the same source." },
      { label: "Cinematic Tone", title: "What should the camera make us feel?", subtitle: "Set visual language, pace, atmosphere, and emotional temperature.", directorNote: "Name sensory references and emotional qualities—not only genres." },
      { label: "Treatment Plan", title: "Plan the screen-ready adaptation package.", subtitle: "Set scope for the treatment, structure, and scene assets.", directorNote: "The output will focus on playable moments, visual stakes, and dramatic progression." },
    ], preview: ["Logline", "Act structure", "Scene potential", "Pitch strength"], previewPrompt: "The source promise and screen format will become a cinematic adaptation strategy.", validationMessage: "Add the source title, creator, summary, and intended adaptation format.", nextPromise: "Next, we will align the screen format with its audience and runtime logic.",
  },
  publishing_pack: {
    id: "publishing_pack", projectType: "publishing_pack", label: "Publishing Pack", cardLabel: "Build a Publishing Pack",
    positioning: "For preparing a finished book for listing, launch, marketing, and distribution.", bestFor: "Launch-ready authors", sampleOutput: "Metadata + launch assets", icon: "publishing", accent: "blue", motif: "shelf",
    headline: "Prepare the book for the marketplace.", support: "Generate the assets that help a finished book look credible, searchable, and launch-ready.",
    firstStepTitle: "What book are we preparing to publish?", firstStepSubtitle: "Bring the book details, then generate cover assets, metadata, description, keywords, and launch copy.",
    fields: [
      { name: "bookTitle", label: "Book title", placeholder: "Title shown on the publishing listing" }, { name: "subtitle", label: "Subtitle", placeholder: "Optional subtitle", optional: true }, { name: "authorName", label: "Author name", placeholder: "Name shown on the cover and listing" },
      { name: "bookDescription", label: "Book description", placeholder: "Paste the current description or describe the book.", type: "textarea", wide: true },
      { name: "publishingPlatform", label: "Publishing platform", placeholder: "Amazon KDP, IngramSpark, EPUB, PDF, audiobook...", type: "textarea" },
      { name: "launchGoal", label: "Launch goal", placeholder: "Sell, build authority, teach, minister, promote a service, attract speaking opportunities...", type: "textarea" },
    ],
    steps: [
      { label: "Book Details", title: "What book are we preparing to publish?", subtitle: "Establish the source metadata and current positioning.", directorNote: "Accurate metadata is part of the reader experience, not administrative cleanup." },
      { label: "Market Position", title: "Where should this book compete and connect?", subtitle: "Clarify the buyer, category, keywords, and launch objective.", directorNote: "Discoverability improves when market language remains faithful to the actual book." },
      { label: "Cover & Metadata", title: "How should the book present itself at a glance?", subtitle: "Set the visual and verbal storefront direction.", directorNote: "The cover, title, description, and categories should make one coherent promise." },
      { label: "Publishing Assets", title: "Assemble the marketplace-ready package.", subtitle: "Choose the production scope for launch and distribution.", directorNote: "The final pack will be organized for practical use across publishing platforms." },
    ], preview: ["Back cover copy", "Keywords", "Categories", "Marketing blurb"], previewPrompt: "Book details and launch intent will become a coherent storefront and metadata system.", validationMessage: "Add the book title, author, description, and intended publishing platform.", nextPromise: "Next, we will clarify the book’s buyer, category, and launch position.",
  },
  movie_pitch_pack: {
    id: "movie_pitch_pack", projectType: "movie_pitch_pack", label: "Movie or Series Pitch Pack", cardLabel: "Create a Pitch Pack",
    positioning: "For investor, producer, network, or studio-facing screen concepts.", bestFor: "Writers & producers", sampleOutput: "Logline + pitch treatment", icon: "pitch", accent: "ink", motif: "spotlight",
    headline: "Shape the concept for the screen industry.", support: "Create loglines, treatments, character summaries, pitch copy, and poster direction.",
    firstStepTitle: "What screen concept are we pitching?", firstStepSubtitle: "Define the premise, audience, format, tone, and why this story deserves to be seen.",
    fields: [
      { name: "projectTitle", label: "Project title", placeholder: "Title of the film, series, or documentary" }, { name: "creatorName", label: "Creator name", placeholder: "Writer, producer, or owner of the concept" },
      { name: "premise", label: "Premise", placeholder: "What is the core story or concept?", type: "textarea", wide: true }, { name: "format", label: "Format", placeholder: "Feature film, limited series, TV pilot, documentary, docuseries...", type: "textarea" },
      { name: "targetAudience", label: "Target audience", placeholder: "Who would watch this and why?", type: "textarea" }, { name: "whyNow", label: "Why now?", placeholder: "Why does this story matter in this moment?", type: "textarea", wide: true },
    ],
    steps: [
      { label: "Premise", title: "What screen concept are we pitching?", subtitle: "Define the hook, format, audience, and cultural urgency.", directorNote: "A pitch opens a door by making the central promise easy to repeat and hard to forget." },
      { label: "Audience & Market", title: "Who will champion—and watch—this project?", subtitle: "Connect the concept to a specific viewer and industry opportunity.", directorNote: "Comparable titles should clarify the market without making the project feel derivative." },
      { label: "Tone & Positioning", title: "What makes the pitch feel production-ready?", subtitle: "Set tone, visual identity, and the pitch-room language.", directorNote: "Decision-makers need to see both the emotional experience and the commercial frame." },
      { label: "Pitch Assets", title: "Build the package that carries the room.", subtitle: "Choose the treatment, character, poster, and presentation scope.", directorNote: "Every asset should reinforce one persuasive reason this project deserves to exist now." },
    ], preview: ["Logline", "Comparable titles", "Pitch angle", "Poster concept"], previewPrompt: "Premise, audience, and urgency will converge into a concise industry-facing pitch angle.", validationMessage: "Add the project title, creator, premise, format, and why this story matters now.", nextPromise: "Next, we will sharpen the audience, market opportunity, and comparable titles.",
  },
};

export const CREATION_PATHS = Object.values(CREATION_PATH_CONFIG);
