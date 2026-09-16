import { writeFile } from "node:fs/promises";
import { QUESTS } from "../src/data/quests.ts";
import { supportFor } from "../src/data/scaffolds.ts";
import { DOJO_CHALLENGES } from "../src/data/dojo.ts";
import { STARTERS } from "../src/workspace/starters.ts";
import { PROGRAMS } from "../src/workspace/programs.ts";
const cell = (s: unknown) =>
  String(s).replaceAll("|", "/").replaceAll("\n", " ");
const words = (s: string) => s.trim().split(/\s+/).length;
const row = (v: unknown[]) => "| " + v.map(cell).join(" | ") + " |\n";
let text =
  "# Program review register\n\nReview date: 2026-09-16. This register covers every shipped lesson, prompt workshop, starter, lab, credential pathway, and educator flow. Reading counts are descriptive, not reading-age scores. Reading support is independent of age.\n\nAcceptance labels distinguish authored content and automated checks from supervised learner/educator evidence. No supervised walkthrough or physical iPad assessment has been completed in this release session. Those findings remain pending; structural checks do not establish learning effectiveness, accessibility conformance, or mastery.\n\n## Lessons\n\nEach lesson offers a distinct explanation, worked example, hint, optional extension, knowledge-check rationale, and creative evidence. Prerequisites are suggestions, not age locks. Completion is self-recorded; educator review is separate. Learners can write, draw, demonstrate, or link a saved project. The text-length threshold prevents empty submissions, not verifies mastery.\n\n";
text += row([
  "ID / lesson",
  "Objective",
  "Preparation",
  "Reading demand",
  "Activity / evidence",
  "Accessibility / differentiation",
  "Acceptance",
]);
text += "|---|---|---|---|---|---|---|\n";
for (const q of QUESTS) {
  const s = supportFor(q);
  text += row([
    q.id + " — " + q.title,
    s.objective,
    q.prereqs.join(", ") || "None",
    `${words(q.lesson.join(" "))} core words; ${words(s.guided.join(" "))} guided words; optional extension`,
    q.creative.prompt + " Evidence: " + q.creative.checklist.join("; "),
    "Keyboard and touch choices; larger text; guided cards; read-aloud or adult-scribed explanation; extension: " +
      s.stretch,
    "Authored scaffold and prerequisite/quiz structure checked. Human clarity/engagement walkthrough pending.",
  ]);
}
text +=
  "\n## Prompt workshops\n\nProvider accounts are optional. Drafts, example responses, and self-review can be completed locally. Use fictional inputs and review outputs; direct provider links honor the conservative age pathway. Game themes may be replaced by art, stories, sports, or useful tools without changing the objective.\n\n";
text += row([
  "ID / workshop",
  "Objective",
  "Preparation / reading",
  "Activity / evidence",
  "Accessibility",
  "Acceptance",
]);
text += "|---|---|---|---|---|---|\n";
for (const d of DOJO_CHALLENGES)
  text += row([
    d.id + " — " + d.title,
    d.goal,
    `${words(d.scenario + " " + d.goal + " " + d.example)} example/context words; AI Explorer basics suggested`,
    d.scenario +
      " Draft, response, reflection, and self-review: " +
      d.rubric.map((r) => r.label).join("; "),
    "Editable text; explicit worked example; each criterion has a hint; optional oral discussion",
    "All catalog items reviewed for objective/example/rubric presence; shared workshop flow tested. Human walkthrough pending.",
  ]);
text +=
  "\n## Starter projects\n\nAll six run in an opaque-origin sandbox only after Run preview. Imports remain inert. The source is editable and exportable; none requires network access or an AI subscription.\n\n";
text += row([
  "ID / project",
  "Objective",
  "Preparation / reading",
  "Activity / evidence",
  "Accessibility",
  "Acceptance",
]);
text += "|---|---|---|---|---|---|\n";
for (const s of STARTERS)
  text += row([
    s.id + " — " + s.name,
    s.tagline,
    "Basic sequences; guided source comments; " +
      words(s.remixQuests.map((q) => q.title + " " + q.hint).join(" ")) +
      " remix words",
    s.remixQuests.map((q) => q.title).join("; ") +
      "; saved source and test reflection",
    "Touch controls and keyboard path; code editing benefits from external keyboard; preview Stop/restart",
    "Executed in Chromium, Firefox, WebKit without script errors; physical touch/VoiceOver pending.",
  ]);
text += "\n## Interactive labs\n\n";
text += row([
  "Lab",
  "Objective / preparation",
  "Reading / activity / evidence",
  "Accessibility",
  "Acceptance",
]);
text += "|---|---|---|---|---|\n";
text += row([
  "If-then soccer",
  "Apply a condition and sequence; start after cc1-sequences",
  "Three short scenarios with explanations; choose a rule, then save editable experiment and explain a test",
  "Radio choices, keyboard/touch; no timed penalty",
  "Browser interaction and saved-project execution pass; learner walkthrough pending",
]);
text += row([
  "Stadium rules",
  "Connect parameters and repeated output; loops suggested",
  "Change rows and gaps, observe seat count, save generated HTML",
  "Labeled sliders, text counts supplement visual pattern",
  "Browser interaction and saved-project execution pass; physical iPad pending",
]);
text += row([
  "Pixel animation",
  "Explain frames and playback; no prerequisite",
  "Tap pixels, copy frames, play/stop, save animation source",
  "Named pixel buttons and pressed states; keyboard path; manual playback; reduced motion preference",
  "Browser interaction and saved-project execution pass; VoiceOver and creative usability pending",
]);
text += row([
  "Tiny classifier (additional AI experiment)",
  "Distinguish training examples from predictions; AI Explorer suggested",
  "Change labeled numeric examples and compare nearest-example prediction; discuss limitations",
  "Labeled sliders and text predictions; all-local, no personal dataset",
  "Shared practice browser flow passes; explanation and engagement need learner walkthrough",
]);
text +=
  "\n## Credential pathways\n\nNo partnership, accreditation, professional certification, or automatic university credit is claimed. BuidlCamp records are self-reported, outside completion records come from the issuer, and professional credentials require their own issuer assessment. Recheck provider terms before enrollment.\n\n";
text += row([
  "Pathway",
  "Evidence / requirements",
  "Eligibility / cost",
  "Reading / accessibility / acceptance",
]);
text += "|---|---|---|---|\n";
for (const p of PROGRAMS)
  text += row([
    p.issuer + " — " + p.title,
    p.type + ": " + p.steps.join("; ") + ". Source: " + p.source,
    p.ageNote + " " + p.price,
    "External course demands and accessibility vary. Official source checked " +
      p.checked +
      "; enrollment/paid completion not tested.",
  ]);
text += "\n## Educator cycle and capstones\n\n";
text += row([
  "Feature",
  "Objective / preparation",
  "Activity / evidence",
  "Accessibility",
  "Acceptance",
]);
text += "|---|---|---|---|\n";
for (const r of [
  [
    "Portable assignment",
    "Choose a meaningful goal and suitable preparation",
    "Select stable lesson IDs, write instructions, export JSON, import into learner workspace",
    "Plain text; flexible pace; optional oral/drawn work",
    "Assignment export/import exercised in browser",
  ],
  [
    "Portfolio submission",
    "Share deliberate learning evidence",
    "Version-2 submission ID, learner explanation, project source; no age/PIN/AI conversation or other reviews",
    "Source shown as inert text; large-text option",
    "Export/import and identifier checks pass",
  ],
  [
    "Returned feedback and revision",
    "Use formative feedback to improve work",
    "Educator exports linked feedback; original workspace imports, records a response and revision",
    "Editable explanation; verbal response may be transcribed",
    "Complete file roundtrip exercised; mismatched feedback rejected",
  ],
  [
    "Printable plans and rubric",
    "Discuss evidence without implying a certified grade",
    "Lesson objective, example, hint, extension; Explain/Make/Test/Improve rubric; print on light background",
    "Independent reading support, paired work, extra challenge, paper alternative",
    "Browser print layout checked; educator classroom walkthrough pending",
  ],
  [
    "Shared-device guide",
    "Prevent accidental cross-learner disclosure",
    "Export, disconnect, clear local data, separate browser profiles; PIN is only a local adult-controls speed bump",
    "Plain-language setup steps; no account required for core work",
    "Implementation reviewed; managed-school deployment walkthrough pending",
  ],
  [
    "Four path capstones",
    "Make, test, explain, improve a chosen result",
    "Useful tool; checked explanation; playable level; responsible release. Link a saved project plus reflection",
    "Choice of theme and expression; no streaks/rankings",
    "Capstone record and linked project exercised; educator assessment pending",
  ],
])
  text += row(r);
text +=
  "\n## Required supervised review\n\nFor each age band (10–12, 13–15, 16–17, adult), observe a learner choosing a path, explaining a worked example, making a project, recovering a version, and acting on feedback. Record where they pause, request help, misread controls, or lose interest. Review reading support independently of age. Include an educator using a shared iPad, an external keyboard user, and VoiceOver. Ask whether milestones reflect what the learner can explain. Record consent and any research observations outside this public repository; use only de-identified findings here.\n";
await writeFile(new URL("../../docs/PROGRAM_REVIEW.md", import.meta.url), text);
console.log(
  `Recorded ${QUESTS.length} lessons, ${DOJO_CHALLENGES.length} workshops, ${STARTERS.length} starters, four experiments, ${PROGRAMS.length} credential pathways, and educator flows.`,
);
