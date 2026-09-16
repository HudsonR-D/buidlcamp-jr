// Content contracts. Persisted workspace contracts live in workspace/model.ts.
// Legacy catalog field names do not establish age or restrict lesson access.
export type AgeMode = "junior" | "builder" | "legend";
export type TierName = "Bronze" | "Silver" | "Gold" | "Legend";
export type TrackId =
  "code-craft" | "ai-explorer" | "game-design" | "build-together";
export interface Track {
  id: TrackId;
  name: string;
  tagline: string;
  icon: string;
  color: string;
}
export interface QuizQuestion {
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
}
export interface Quest {
  support?: {
    objective: string;
    guided: string[];
    example: string;
    hint: string;
    stretch: string;
  };
  id: string;
  track: TrackId;
  tier: 1 | 2 | 3;
  minAgeMode: AgeMode;
  title: string;
  tagline: string;
  icon: string;
  prereqs: string[];
  /** Historical catalog metadata, unused by the current progression model. */
  xp: number;
  badge?: { id: string; label: string; icon: string };
  brief: string;
  lesson: string[];
  questions: QuizQuestion[];
  creative: { prompt: string; checklist: string[] };
}
export interface DojoChallenge {
  id: string;
  title: string;
  scenario: string;
  badPrompt: string;
  goal: string;
  rubric: { label: string; hint: string }[];
  example: string;
}
export interface ForgeTemplate {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  /** Historical difficulty label, used as guidance only; it never locks a starter. */
  minTier: TierName;
  code: string;
  remixQuests: { title: string; hint: string }[];
}
