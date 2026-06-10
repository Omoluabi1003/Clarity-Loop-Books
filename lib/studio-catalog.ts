import type { CreationPath, ProjectType } from "./types";

export const CREATION_PATHS: CreationPath[] = [
  { id: "start_from_idea", projectType: "idea", label: "Start From an Idea", description: "Turn a title, concept, or rough idea into a complete book project.", accent: "gold" },
  { id: "nonfiction_book", projectType: "nonfiction", label: "Write a Nonfiction Book", description: "Build an authoritative business, faith, memoir, leadership, or professional book.", accent: "navy" },
  { id: "fiction_book", projectType: "fiction", label: "Write a Fiction Book", description: "Develop characters, world logic, plot, scenes, conflict, and a satisfying ending.", accent: "plum" },
  { id: "upload_manuscript", projectType: "upload", label: "Upload & Improve a Manuscript", description: "Analyze, sharpen, rewrite, expand, or rebuild an existing manuscript.", accent: "sage" },
  { id: "screen_adaptation", projectType: "screenplay", label: "Turn a Book Into a Screenplay", description: "Adapt long-form work into screen-ready story, scene, and pitch assets.", accent: "copper" },
  { id: "publishing_pack", projectType: "publishing_pack", label: "Create a Publishing Pack", description: "Create cover, metadata, back-cover copy, categories, keywords, and exports.", accent: "blue" },
  { id: "movie_pitch_pack", projectType: "movie_pitch_pack", label: "Create a Movie or Series Pitch Pack", description: "Generate a logline, synopsis, treatment, beat sheet, and pitch copy.", accent: "ink" },
];

export const BOOK_TYPES = {
  nonfiction: ["Business & Professional Development", "Self-Help", "Memoir", "Faith & Spiritual Growth", "Leadership", "Technology & Innovation", "Education", "Health & Wellness", "Biography", "Personal Development", "Public Policy & Government", "Consulting / Thought Leadership", "Christian Living", "Spiritual Reflection", "Career Development", "Entrepreneurship", "Organizational Transformation", "Government Modernization"],
  fiction: ["Drama", "Romance", "Thriller", "Mystery", "Crime", "Historical Fiction", "Christian Fiction", "Fantasy", "Science Fiction", "Young Adult", "Children's Story", "Literary Fiction", "Action / Adventure", "Family Saga", "Urban Fiction", "Inspirational Fiction", "Political Fiction", "Speculative Fiction"],
  special: ["Workbook", "Devotional", "Course Book", "Training Manual", "Children's Picture Book", "Poetry Collection", "Short Story Collection", "Audiobook Script", "Movie Screenplay", "TV Pilot", "Documentary Treatment", "Stage Play", "Podcast Series", "Sermon Series", "Corporate Training Script", "YouTube Video Script"],
} as const;

export const COVER_DESIGN_MODES = ["Executive Business", "Luxury Minimalist", "Cinematic Fiction", "Faith-Based Inspirational", "Memoir Emotional", "Thriller Dark", "Romance Elegant", "Children's Illustrated", "Technology Futurist", "African Premium Heritage", "Academic Professional", "Self-Help Bold", "Spiritual Reflective", "Documentary Poster", "Movie Adaptation Poster"] as const;

export const STUDIO_MODULES: { id: string; title: string; eyebrow: string; description: string; outputs: string[]; projectTypes: ProjectType[] }[] = [
  { id: "manuscript", title: "Manuscript Review", eyebrow: "EDITORIAL INTELLIGENCE", description: "Preserve the original, detect structure, and turn editorial findings into chapter-level actions.", outputs: ["Structure map", "Repetition report", "Before & after", "Improvement plan"], projectTypes: ["upload", "nonfiction", "fiction"] },
  { id: "fiction", title: "Fiction Studio", eyebrow: "STORY ARCHITECTURE", description: "Keep character, world, timeline, scene, conflict, and point-of-view decisions coherent.", outputs: ["Story bible", "Character studio", "Plot board", "Continuity check"], projectTypes: ["fiction"] },
  { id: "adaptation", title: "Adaptation Studio", eyebrow: "BOOK TO SCREEN", description: "Translate source material into visual storytelling without losing its central promise.", outputs: ["Logline", "Three-act map", "Beat sheet", "Scene breakdown"], projectTypes: ["screenplay", "movie_pitch_pack"] },
  { id: "cover", title: "Cover Studio", eyebrow: "SHELF POSITIONING", description: "Build a genre-aware brief and a designed cover asset that survives thumbnail viewing.", outputs: ["Cover strategy", "Visual metaphor", "Front preview", "Quality score"], projectTypes: ["idea", "nonfiction", "fiction", "publishing_pack"] },
  { id: "publishing", title: "Publishing Center", eyebrow: "EXPORT READINESS", description: "Gate export on clean content, complete metadata, a real cover asset, and valid files.", outputs: ["PDF & DOCX", "Back-cover copy", "Metadata", "Marketing assets"], projectTypes: ["publishing_pack", "idea", "nonfiction", "fiction"] },
];
