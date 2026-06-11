import { calculateBookBudget, countWords } from "./book-budget";
import { analyzeChapterQuality, cleanManuscriptContent, normalizeParagraphCasing } from "./quality";
import { buildBookDna } from "./book-dna";
import { buildChapterTitleContext, generateChapterTitleOptions, titleQuality, validateChapterTitles } from "./chapter-title-intelligence";
import type { Book, BookDNA, BookForm, Chapter, ChapterGenerationContext, OpeningStyle } from "./types";

const openingStyles: OpeningStyle[] = ["scenario", "question", "direct_claim", "contrast", "observation", "case_example", "problem_statement"];

const CLARITY_LOOP_STRUCTURE = [
  { part: "Part I: The Old Operating Model", chapters: ["The Cost of Waiting for Certainty", "Why Modern Work Stalls", "The Limits of Linear Planning"] },
  { part: "Part II: The Shift", chapters: ["When Action Creates Understanding", "Kidlin’s Law and the Written Problem", "Vibe Coding and Discovery Through Building"] },
  { part: "Part III: The Clarity Loop", chapters: ["The Four Movements of Clarity", "From Feedback to Better Decisions", "Modernization as a Way of Thinking"] },
  { part: "Part IV: The Future of Work", chapters: ["Leading in the Age of Intelligent Systems"] },
];

const exampleBanks = [
  ["a defining moment drawn from the book's subject", "a relationship that changes the direction", "a concrete consequence of the central tension"],
  ["an opening scene grounded in place", "a choice made under pressure", "a revealing contrast between expectation and reality"],
  ["a chapter-specific story", "an audience-relevant example", "a moment that earns the chapter's closing insight"],
];

function clarityLoopBlueprint(form: BookForm): boolean {
  return /clarity loop/i.test(form.title) && form.chapterCount === 10 && buildBookDna(form).creativeMode === "framework_instruction";
}

function chapterIntent(bookDna: BookDNA, form: BookForm, index: number): string {
  const element = bookDna.requiredElements?.[index % Math.max(1, bookDna.requiredElements.length)] || "a distinct movement in the reader's journey";
  const pattern = bookDna.genreProfile?.preferredChapterPatterns[index % Math.max(1, bookDna.genreProfile.preferredChapterPatterns.length)] || "development";
  return `Develop ${element} through a ${pattern}-centered chapter that advances ${form.idea.replace(/[.!?]+$/, "")}.`;
}

export function buildBlueprint(form: BookForm, bookDna = buildBookDna(form, form.confirmedCreativeIntent)): Chapter[] {
  const budget = calculateBookBudget(form);
  const structured = clarityLoopBlueprint(form) ? CLARITY_LOOP_STRUCTURE.flatMap((part) => part.chapters.map((title) => ({ partTitle: part.part, title }))) : [];
  return budget.chapterBudgets.map((targetWordCount, index) => {
    const intention = chapterIntent(bookDna, form, index);
    const titleOptions = generateChapterTitleOptions(bookDna, intention, index);
    const selectedTitle = structured[index]?.title || titleOptions[0].title;
    const titleContext = buildChapterTitleContext(selectedTitle, bookDna, intention);
    const openingStyle = titleContext.suggestedOpeningStyle || bookDna.openingStyleOptions?.[index % Math.max(1, bookDna.openingStyleOptions.length)] || openingStyles[index % openingStyles.length];
    const outline = (bookDna.requiredElements || []).slice(0, 5).map((element) => element.charAt(0).toUpperCase() + element.slice(1));
    return {
      id: `chapter-${Date.now()}-${index}`,
      chapterNumber: index + 1,
      title: selectedTitle,
      selectedTitle,
      titleOptions,
      titleLocked: false,
      titleContext,
      titleQuality: titleQuality(selectedTitle, bookDna, intention),
      chapterPromise: titleContext.chapterPromise,
      suggestedOpeningStyle: titleContext.suggestedOpeningStyle,
      emotionalDirection: titleContext.emotionalDirection,
      partTitle: structured[index]?.partTitle,
      thesis: intention,
      objective: bookDna.genreProfile?.chapterPurposeStyle || intention,
      exampleBank: exampleBanks[index % exampleBanks.length],
      readerTakeaway: titleContext.chapterPromise,
      summary: intention,
      outline: outline.length ? outline : ["Opening movement", "Central development", "Turning point", "Meaning or application", "Closing movement"],
      openingStyle,
      targetWordCount,
      actualWordCount: 0,
      cleanWordCount: 0,
      estimatedPages: Math.ceil(targetWordCount / budget.wordsPerPage),
      content: "",
      qualityFlags: [],
      qualityScore: 100,
      status: "pending",
      locked: false,
    };
  });
}

export function validateBlueprintGenreAlignment(chapters: Chapter[], bookDna: BookDNA) {
  return validateChapterTitles(chapters, bookDna);
}

export function buildBlueprintPrompt(form: BookForm, bookDna = buildBookDna(form, form.confirmedCreativeIntent)): string {
  const budget = calculateBookBudget(form);
  return `Create a ${bookDna.genreProfile?.label} publishing blueprint for ${form.title}. The selected book type is authoritative. Follow ${bookDna.chapterStructureHint}; include ${bookDna.requiredElements?.join(", ")}; avoid ${bookDna.forbiddenPatterns?.join(", ")}. Use genre-aware chapter titles in the style of ${form.confirmedCreativeIntent?.chapterNamingStyle || bookDna.genreProfile?.preferredChapterPatterns.join(", ")}. Every chapter requires a unique creative promise, title context, examples, reader takeaway, and opening strategy. Target ${budget.targetWords} clean words across ${budget.chapterCount} chapters for ${form.targetAudience}.`;
}

export function buildChapterGenerationContext(book: Book, chapter: Chapter): ChapterGenerationContext {
  const previousChapterSummaries = book.chapters.filter((candidate) => candidate.chapterNumber < chapter.chapterNumber).sort((a, b) => a.chapterNumber - b.chapterNumber).map((candidate) => candidate.summary);
  const phrasesToAvoid = book.chapters.filter((candidate) => candidate.chapterNumber !== chapter.chapterNumber && candidate.content).map((candidate) => candidate.content.split(/\s+/).slice(0, 16).join(" "));
  const selectedTitle = chapter.selectedTitle || chapter.title;
  const titleContext = chapter.titleContext || buildChapterTitleContext(selectedTitle, book.bookDna, chapter.thesis || chapter.summary);
  return { bookThesis: book.bookDna.thesis || book.idea, audienceProfile: book.targetAudience, tone: book.tone, writingStyle: book.writingStyle, bookDna: book.bookDna, chapterIntention: chapter.thesis || chapter.summary, chapterOutline: chapter.outline, previousChapterSummaries, openingStyle: titleContext.suggestedOpeningStyle || chapter.openingStyle, phrasesToAvoid, selectedTitle, titleContext, genreProfile: book.bookDna.genreProfile };
}

export function buildChapterPrompt(book: Book, chapter: Chapter): string {
  const context = buildChapterGenerationContext(book, chapter);
  return `SYSTEM: The GENERATION_CONTEXT below is private editorial guidance. Never quote, label, summarize, or restate it in MANUSCRIPT_CONTENT.
Return only publishable chapter prose. Do not include instructions, audience descriptions, Book DNA, metadata labels, numbered filler, or commentary about the writing task.
Build length through genre-appropriate development, specific evidence or scenes, emotional and intellectual progression, and a meaningful transition—not repeated paragraph structures. Do not use business/professional structure unless the genre profile calls for it.
The selected chapter title is the creative anchor for this chapter. Let it influence the opening, examples, pacing, tone, emotional direction, and closing insight. Do not treat it as a decorative heading only.

<GENERATION_CONTEXT>
${JSON.stringify(context)}
</GENERATION_CONTEXT>

<MANUSCRIPT_REQUIREMENTS>
Chapter title: ${chapter.selectedTitle || chapter.title}
Unique thesis: ${chapter.thesis || chapter.summary}
Examples reserved for this chapter: ${(chapter.exampleBank || []).join("; ")}
Target clean word count: ${chapter.targetWordCount}; meet at least 85 percent and aim for the full target.
Use prior chapter summaries to avoid repeating claims, openings, examples, and conclusions.
Return only publishable prose without wrapper tags.
</MANUSCRIPT_REQUIREMENTS>`;
}

const lenses = [
  "operating reality", "decision evidence", "human behavior", "workflow design", "public value", "technical modernization", "leadership responsibility", "implementation discipline",
];
const actions = [
  "name the constraint before selecting a tool", "convert assumptions into a visible test", "invite the people closest to the work into discovery", "record what changed after the intervention",
  "separate reversible choices from irreversible commitments", "use a small prototype to expose hidden requirements", "treat feedback as operating data", "connect the next investment to a measurable learning goal",
];
const consequences = [
  "less rework and a clearer basis for the next decision", "a shared account of the problem rather than competing private interpretations", "faster learning without lowering professional standards",
  "a modernization path grounded in service outcomes", "more useful governance because evidence arrives before certainty is claimed", "a team that can adjust without treating adjustment as failure",
];
const transitions = [
  "That distinction changes the next conversation.", "The result is not certainty; it is a better-informed commitment.", "This is where disciplined iteration becomes more rigorous than delay.",
  "The lesson travels beyond one project because it changes how the organization learns.", "The practical value appears when the method survives contact with real constraints.",
];

const openingLead: Record<OpeningStyle, (book: Book, chapter: Chapter) => string> = {
  scenario: (_book, chapter) => `${chapter.title} becomes concrete on a Tuesday morning, when a routine decision exposes the chapter’s central tension. The team has expertise, urgency, and incomplete information; what it lacks is a responsible way to learn before the cost of waiting becomes invisible.`,
  question: (_book, chapter) => `What changes when ${chapter.title.toLowerCase()} is treated as an operating capability rather than an idea to admire? The answer begins with the evidence a team can create through its next well-designed move.`,
  direct_claim: (_book, chapter) => `${chapter.title} determines whether insight becomes useful action. It is not a secondary concern, because the quality of the next decision depends on how the organization turns uncertainty into evidence.`,
  contrast: (_book, chapter) => `Many organizations approach ${chapter.title.toLowerCase()} as a planning problem. In practice, it is a learning-design problem: the work must reveal enough truth to improve the decision that follows.`,
  observation: (_book, chapter) => `Watch a team at the moment certainty disappears and a revealing pattern emerges: familiar activity increases just as useful learning slows. ${chapter.title} offers a different way to organize that moment.`,
  case_example: (_book, chapter) => `A modernization team discovered the cost of misunderstanding ${chapter.title.toLowerCase()} only after a carefully governed initiative stalled in plain sight. Its recovery began when leaders asked what the work itself could teach them.`,
  problem_statement: (_book, chapter) => `The central problem in ${chapter.title.toLowerCase()} is not a lack of information. It is the failure to convert available information into a specific claim, a responsible action, and evidence that can guide what happens next.`,
};

function genreOpening(book: Book, chapter: Chapter): string {
  const mode = book.bookDna.creativeMode;
  const anchor = chapter.titleContext?.creativeAnchor || `The promise inside “${chapter.title}” guides the opening.`;
  if (mode === "life_story" || mode === "memory_journey") return `${anchor} Begin with a remembered place, a human relationship, and the small detail that reveals why this period mattered before explaining what it came to mean.`;
  if (mode === "story_world" || mode === "screen_story" || mode === "imaginative_story") return `${anchor} The scene opens in motion: a character wants something, the setting resists, and a fresh consequence enters before anyone has time to explain it away.`;
  if (mode === "spiritual_growth") return `${anchor} The honest beginning is not certainty but need—the quiet place where struggle, grace, and the possibility of calling meet.`;
  if (mode === "applied_practice") return `${anchor} Start with the real situation the learner must handle, then make the first useful action visible and achievable.`;
  return openingLead[chapter.openingStyle || "observation"](book, chapter);
}

function genreDevelopedParagraph(book: Book, chapter: Chapter, index: number): string {
  const mode = book.bookDna.creativeMode;
  const focus = chapter.outline[index % Math.max(1, chapter.outline.length)] || "the chapter's central movement";
  const example = (chapter.exampleBank || exampleBanks[0])[index % (chapter.exampleBank?.length || exampleBanks[0].length)];
  const promise = chapter.titleContext?.chapterPromise || chapter.chapterPromise || chapter.summary;
  const emotional = chapter.titleContext?.emotionalDirection || chapter.emotionalDirection || "Move toward earned insight.";
  if (mode === "life_story" || mode === "memory_journey") return `${focus} is best understood through a specific human moment rather than a summary of accomplishments. Consider ${example}: the place, the people present, what could not yet be known, and the choice that followed. The scene should preserve contradiction and dignity while showing how family, community, adversity, or affection shaped the person becoming visible here. Reflection arrives only after the lived detail has earned it. ${promise} ${emotional}`;
  if (mode === "story_world" || mode === "screen_story" || mode === "imaginative_story") return `${focus} changes the situation on the page. Through ${example}, the character acts under pressure, another desire collides with that action, and the setting contributes a physical obstacle or revealing opportunity. Dialogue and sensory detail carry what exposition would otherwise explain. By the end of this movement, a choice has created a consequence that cannot simply be reset. ${promise} ${emotional}`;
  if (mode === "spiritual_growth") return `${focus} begins with honest spiritual tension, illustrated through ${example}. The movement does not rush past doubt or pain; it notices where grace, testimony, scripture-aware reflection, restoration, or calling becomes personally meaningful. The reader is invited to recognize a faithful response without being handed a shallow guarantee. ${promise} ${emotional}`;
  if (mode === "applied_practice") return `${focus} turns the idea into practice. Using ${example}, define the desired result, model one clear example, and ask the reader to complete a bounded exercise. Add a short checklist, a reflection prompt, and one application step that can be reviewed. ${promise} ${emotional}`;
  return developedParagraph(book, chapter, index);
}

function developedParagraph(book: Book, chapter: Chapter, index: number): string {
  const lens = lenses[(index + chapter.chapterNumber) % lenses.length];
  const secondaryLens = lenses[(index * 2 + chapter.chapterNumber + 3) % lenses.length];
  const action = actions[(index * 3 + chapter.chapterNumber) % actions.length];
  const consequence = consequences[(index * 5 + chapter.chapterNumber) % consequences.length];
  const examples = chapter.exampleBank || exampleBanks[chapter.chapterNumber % exampleBanks.length];
  const example = examples[index % examples.length];
  const focus = chapter.outline[index % Math.max(1, chapter.outline.length)] || "implementation";
  const bridge = `${transitions[(index + chapter.chapterNumber) % transitions.length].replace(/[.!?]+$/, "")} as the team examines ${focus.toLowerCase()} through ${lens}.`;
  const variants = [
    `${focus} becomes easier to evaluate when a team separates ${lens} from ${secondaryLens}. Consider ${example} while evaluating ${focus.toLowerCase()} through ${lens}. Instead of debating the entire initiative, the people closest to the work can ${action}. That ${lens} move creates a bounded result they can inspect together. The result may confirm an assumption, expose a dependency, or show that the original question was too broad. For ${focus.toLowerCase()}, each outcome replaces private confidence with shared evidence. In an AI-assisted environment, ${secondaryLens} increases the value of this discipline: generating options is inexpensive, but selecting a responsible direction still requires context and judgment. The immediate benefit is ${consequence}. ${bridge}`,
    `A practical test of ${focus.toLowerCase()} starts with the conditions people actually face. In ${example}, ${lens} shapes the available choices, while ${secondaryLens} determines whether those choices will survive implementation. Leaders can respond by choosing to ${action}. For ${lens}, this is not a shortcut around rigor. It is a way to place rigor where it can change the decision. The team records what it expected, what happened, who was affected, and which assumption now deserves revision. AI can accelerate analysis and prototyping around ${secondaryLens}, yet accountability remains human and specific. When the evidence is reviewed without defending the original plan, the work produces ${consequence}. ${bridge}`,
    `The distinction between activity and learning matters here. A group may spend weeks discussing ${focus.toLowerCase()} without improving its understanding of ${lens}. ${example} offers a more grounded alternative. The team begins by making ${secondaryLens} explicit, then agrees to ${action}. Because the intervention is visible, disagreement becomes productive: participants can point to an outcome rather than restating preferences. This approach is especially valuable in modernization work, where legacy constraints, public responsibilities, and new technical capabilities arrive together. The aim in ${focus.toLowerCase()} is not motion for its own sake. It is a deliberate cycle that yields ${consequence} and gives the next investment a defensible basis. ${bridge}`,
    `Imagine reviewing ${example} after the first implementation cycle. The most valuable question is not whether every prediction was correct. It is whether the work clarified ${focus.toLowerCase()} enough to improve the next choice. Evidence about ${lens} may support the original direction, while evidence about ${secondaryLens} may require a redesign. A capable team can hold both findings without calling the effort a failure. It can ${action}, document the effect, and invite affected people to interpret the result. Used this way for ${lens}, AI supports comparison, synthesis, and rapid experimentation without replacing professional judgment. The practical payoff is ${consequence}. ${bridge}`,
    `For a leader, ${focus.toLowerCase()} is a governance responsibility as much as a design challenge. ${example} shows why broad encouragement is insufficient. Someone must define the decision, identify whose experience counts as evidence, and make room for correction. One responsible next step is to ${action}. That choice connects ${lens} to ${secondaryLens} without pretending the two are interchangeable. It also gives the team a record of what changed and why. Over time, records about ${secondaryLens} become organizational memory: future teams can see which assumptions held, which risks appeared, and which safeguards mattered. The resulting capability is ${consequence}. ${bridge}`,
    `Readers can apply this part of the framework by returning to ${example} and writing three short statements: what is known about ${lens}, what remains uncertain about ${secondaryLens}, and what action could produce relevant evidence within the current constraints. For ${focus.toLowerCase()}, the third statement should be concrete enough that a team can ${action} and review the result at a named time. This ${lens} practice prevents an attractive strategy from floating above everyday work. It also keeps AI-generated recommendations about ${secondaryLens} in their proper place—as proposals to examine, not conclusions to obey. A well-chosen experiment does more than create momentum; it creates ${consequence}. ${bridge}`,
  ];
  return variants[index % variants.length];
}

export function writeSampleChapter(book: Book, chapter: Chapter, existingContent = ""): string {
  const activeTitle = chapter.selectedTitle || chapter.title;
  const anchoredChapter = { ...chapter, title: activeTitle, openingStyle: chapter.titleContext?.suggestedOpeningStyle || chapter.openingStyle };
  let content = existingContent.trim() || `# ${activeTitle}\n\n${genreOpening(book, anchoredChapter)}`;
  let index = 0;
  while (countWords(content) < chapter.targetWordCount) {
    const outlinePoint = chapter.outline[index % Math.max(1, chapter.outline.length)] || "Implementation";
    const heading = index < chapter.outline.length ? outlinePoint : `${outlinePoint}: ${lenses[(index + chapter.chapterNumber) % lenses.length]}`;
    content += `\n\n## ${heading}\n\n${genreDevelopedParagraph(book, anchoredChapter, index)}`;
    index += 1;
  }
  const normalized = normalizeParagraphCasing(content);
  const analysis = analyzeChapterQuality({ ...chapter, content: normalized }, book.chapters.map((item) => item.id === chapter.id ? { ...item, content: normalized } : item));
  return analysis.flags.some((flag) => flag === "padding_filler" || flag === "prompt_leakage" || flag === "duplicate_paragraph") ? cleanManuscriptContent(normalized) : analysis.content;
}

export function generateCoverPrompt(input: Pick<Book, "title" | "subtitle" | "authorName" | "genre" | "targetAudience" | "idea" | "bookDna" | "coverDirection">): string {
  const direction = input.coverDirection?.trim() || "a refined golden loop becoming a clear roadmap across a midnight blue field";
  return `Professional designed book cover for “${input.title}”${input.subtitle ? `, subtitle “${input.subtitle}”` : ""}, by ${input.authorName}. ${input.genre} for ${input.targetAudience}. Visual concept: ${direction}. Executive, intelligent, modern, premium, and authoritative. Midnight blue field, warm gold accents, ivory typography, abstract loop-to-roadmap geometry. Avoid robots, circuit boards, generic AI imagery, cartoon styling, raw prompt text, and plain text-only composition.`;
}
