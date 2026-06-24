import type { ProjectType } from "./types";
export { CREATION_PATHS } from "./creation-paths";

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
  { id: "author_success_hub", title: "Clarity Launch Engine", eyebrow: "FROM MANUSCRIPT TO MARKET", description: "Position, launch, market, and extend your finished book with a practical book-to-market operating plan.", outputs: ["Page builder preview", "Reader promise", "Audience channels", "Launch action snapshot"], projectTypes: ["idea", "nonfiction", "fiction", "upload", "publishing_pack"] },
];
