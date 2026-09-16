export type AgeBand = "10–12" | "13–15" | "16–17" | "18+";
export type Level = "junior" | "builder" | "legend";
export const LEVELS = {
  junior: "Guided",
  builder: "Independent",
  legend: "Advanced",
} as const;
export const AGES: AgeBand[] = ["10–12", "13–15", "16–17", "18+"];
export interface LessonWork {
  projectId?: string;
  evidenceKind?: "explanation" | "project" | "demonstration";
  reading?: number;
  step: number;
  answers: number[];
  checks: number[];
  evidence: string;
  completedAt?: string;
  attempts: number;
}
export interface Project {
  id: string;
  name: string;
  templateId: string;
  code: string;
  updatedAt: string;
  reflection: string;
  checks: number[];
}
export interface Practice {
  prompt: string;
  response: string;
  reflection: string;
  checks: number[];
  completedAt?: string;
}
export interface CredentialWork {
  checked: string[];
  evidence: string;
  reviewedAt?: string;
}
export interface Assignment {
  id: string;
  title: string;
  lessonIds: string[];
  instructions: string;
  createdAt: string;
}
export interface Review {
  submissionId?: string;
  id: string;
  name: string;
  lessons: Record<string, LessonWork>;
  projects: Project[];
  receivedAt: string;
  feedback: string;
}
export interface WorkspaceData {
  submissions: Submission[];
  feedback: FeedbackRecord[];
  capstones: Record<string, CapstoneWork>;
  schema: 1;
  onboarded: boolean;
  name: string;
  age: AgeBand;
  level: Level;
  pin: string | null;
  lessons: Record<string, LessonWork>;
  projects: Project[];
  practice: Record<string, Practice>;
  credentials: Record<string, CredentialWork>;
  assignments: Assignment[];
  reviews: Review[];
  legacyAwards: Record<string, string>;
  minutes: Record<string, number>;
  largeText: boolean;
}
export const freshData = (): WorkspaceData => ({
  submissions: [],
  feedback: [],
  capstones: {},
  schema: 1,
  onboarded: false,
  name: "Learner",
  age: "10–12",
  level: "junior",
  pin: null,
  lessons: {},
  projects: [],
  practice: {},
  credentials: {},
  assignments: [],
  reviews: [],
  legacyAwards: {},
  minutes: {},
  largeText: false,
});
export const newLesson = (): LessonWork => ({
  step: 0,
  answers: [],
  checks: [],
  evidence: "",
  attempts: 0,
});
export const newPractice = (): Practice => ({
  prompt: "",
  response: "",
  reflection: "",
  checks: [],
});
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function canFinish(
  work: LessonWork,
  answers: number[],
  checklistLength: number,
) {
  return (
    answers.length > 0 &&
    answers.every((answer, i) => work.answers[i] === answer) &&
    Array.from({ length: checklistLength }, (_, i) => i).every((i) =>
      work.checks.includes(i),
    ) &&
    work.evidence.trim().length >= 20
  );
}
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown, max = 10000): v is string =>
  typeof v === "string" && v.length <= max;
const nums = (v: unknown): v is number[] =>
  Array.isArray(v) &&
  v.length <= 100 &&
  v.every((n) => Number.isInteger(n) && n >= -1 && n < 100);
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length <= 200 && v.every((x) => str(x, 2000));
const entriesValid = (
  v: unknown,
  check: (x: unknown) => boolean,
  limit = 500,
) =>
  record(v) &&
  Object.keys(v).length <= limit &&
  Object.entries(v).every(
    ([key, value]) => /^[a-zA-Z0-9_-]{1,100}$/.test(key) && check(value),
  );
export function validLesson(v: unknown): v is LessonWork {
  return (
    record(v) &&
    (v.projectId === undefined || str(v.projectId, 100)) &&
    (v.evidenceKind === undefined ||
      ["explanation", "project", "demonstration"].includes(
        String(v.evidenceKind),
      )) &&
    (v.reading === undefined ||
      (Number.isInteger(v.reading) &&
        Number(v.reading) >= 0 &&
        Number(v.reading) < 100)) &&
    Number.isInteger(v.step) &&
    Number(v.step) >= 0 &&
    Number(v.step) <= 4 &&
    nums(v.answers) &&
    nums(v.checks) &&
    str(v.evidence) &&
    (v.completedAt === undefined || str(v.completedAt, 40)) &&
    Number.isInteger(v.attempts) &&
    Number(v.attempts) >= 0
  );
}
export function validProject(v: unknown): v is Project {
  return (
    record(v) &&
    str(v.id, 100) &&
    str(v.name, 100) &&
    str(v.templateId, 100) &&
    str(v.code, 500000) &&
    str(v.updatedAt, 40) &&
    str(v.reflection) &&
    nums(v.checks)
  );
}
export function validAssignment(v: unknown): v is Assignment {
  return (
    record(v) &&
    str(v.id, 100) &&
    str(v.title, 160) &&
    strings(v.lessonIds) &&
    v.lessonIds.length > 0 &&
    str(v.instructions, 5000) &&
    str(v.createdAt, 40)
  );
}
export function parseBackup(raw: string): WorkspaceData {
  if (new TextEncoder().encode(raw).byteLength > 8_000_000)
    throw new Error("This backup is too large (maximum 8 MB).");
  const v: unknown = JSON.parse(raw);
  if (
    !record(v) ||
    v.schema !== 1 ||
    !str(v.name, 80) ||
    !AGES.includes(v.age as AgeBand) ||
    !["junior", "builder", "legend"].includes(String(v.level)) ||
    typeof v.onboarded !== "boolean"
  )
    throw new Error("Choose a BuidlCamp workspace backup.");
  if (
    !entriesValid(v.lessons, validLesson) ||
    !Array.isArray(v.projects) ||
    v.projects.length > 100 ||
    !v.projects.every(validProject)
  )
    throw new Error("The lesson or project data is invalid.");
  if (
    !entriesValid(
      v.practice,
      (x) =>
        record(x) &&
        str(x.prompt) &&
        str(x.response, 30000) &&
        str(x.reflection) &&
        nums(x.checks) &&
        (x.completedAt === undefined || str(x.completedAt, 40)),
    )
  )
    throw new Error("The practice data is invalid.");
  if (
    !entriesValid(
      v.credentials,
      (x) =>
        record(x) &&
        strings(x.checked) &&
        str(x.evidence, 2000) &&
        (x.reviewedAt === undefined || str(x.reviewedAt, 40)),
    )
  )
    throw new Error("The credential data is invalid.");
  if (
    !Array.isArray(v.assignments) ||
    v.assignments.length > 100 ||
    !v.assignments.every(validAssignment)
  )
    throw new Error("The assignment data is invalid.");
  if (
    !Array.isArray(v.reviews) ||
    v.reviews.length > 100 ||
    !v.reviews.every(
      (x) =>
        record(x) &&
        str(x.id, 100) &&
        str(x.name, 80) &&
        entriesValid(x.lessons, validLesson) &&
        Array.isArray(x.projects) &&
        x.projects.length <= 100 &&
        x.projects.every(validProject) &&
        str(x.feedback) &&
        str(x.receivedAt, 40),
    )
  )
    throw new Error("The review data is invalid.");
  if (
    !entriesValid(v.legacyAwards, (x) => str(x, 100)) ||
    !entriesValid(v.minutes, (x) => Number.isFinite(x) && Number(x) >= 0, 40000)
  )
    throw new Error("The activity data is invalid.");
  // Construct an allowlisted object. Never hydrate functions, prototypes, or an imported PIN.
  const submissions = v.submissions ?? [],
    feedback = v.feedback ?? [],
    capstones = v.capstones ?? {};
  if (
    !Array.isArray(submissions) ||
    submissions.length > 100 ||
    !submissions.every(
      (x) =>
        record(x) &&
        str(x.id, 100) &&
        str(x.createdAt, 40) &&
        strings(x.lessonIds) &&
        strings(x.projectIds),
    ) ||
    !Array.isArray(feedback) ||
    feedback.length > 100 ||
    !feedback.every(validFeedback) ||
    !entriesValid(
      capstones,
      (x) =>
        record(x) &&
        str(x.projectId, 100) &&
        str(x.reflection) &&
        (x.completedAt === undefined || str(x.completedAt, 40)),
    )
  )
    throw new Error("The submission, feedback, or capstone data is invalid.");
  return {
    submissions: submissions as Submission[],
    feedback: feedback as FeedbackRecord[],
    capstones: capstones as WorkspaceData["capstones"],
    schema: 1,
    name: v.name,
    age: v.age as AgeBand,
    level: v.level as Level,
    onboarded: v.onboarded,
    pin: null,
    lessons: lessonFields(v.lessons as WorkspaceData["lessons"]),
    projects: v.projects.map(projectFields),
    practice: v.practice as WorkspaceData["practice"],
    credentials: v.credentials as WorkspaceData["credentials"],
    assignments: v.assignments,
    reviews: v.reviews as Review[],
    legacyAwards: v.legacyAwards as Record<string, string>,
    minutes: v.minutes as Record<string, number>,
    largeText: v.largeText === true,
  };
}
export function migrateLegacy(raw: string): WorkspaceData {
  const parsed: unknown = JSON.parse(raw);
  if (!record(parsed)) throw new Error("Invalid legacy data");
  const v = record(parsed.state) ? parsed.state : parsed;
  const result = freshData();
  result.onboarded = v.onboarded === true;
  result.name = str(v.name, 80) && v.name ? v.name : "Learner";
  result.level = ["junior", "builder", "legend"].includes(String(v.ageMode))
    ? (v.ageMode as Level)
    : "junior";
  // Old reading mode did not establish a learner's age. Default to the youngest band.
  if (record(v.questProgress))
    for (const [id, work] of Object.entries(v.questProgress))
      if (record(work))
        result.lessons[id] = {
          ...newLesson(),
          step: work.status === "done" ? 4 : 0,
          attempts: Number.isInteger(work.attempts) ? Number(work.attempts) : 0,
          ...(work.status === "done"
            ? {
                completedAt: str(work.completedAt, 40)
                  ? work.completedAt
                  : new Date().toISOString(),
                evidence:
                  "Completed in the previous BuidlCamp app; original work was not recorded.",
              }
            : {}),
        };
  if (Array.isArray(v.savedGames))
    result.projects = v.savedGames
      .filter(
        (g) =>
          record(g) &&
          str(g.id, 100) &&
          str(g.name, 100) &&
          str(g.code, 500000) &&
          str(g.templateId, 100) &&
          str(g.updatedAt, 40),
      )
      .map((g) =>
        projectFields({ ...g, reflection: "", checks: [] } as Project),
      );
  if (record(v.diplomaEarned))
    for (const [id, date] of Object.entries(v.diplomaEarned))
      if (str(date, 100)) result.legacyAwards[id] = date;
  if (record(v.dojoProgress))
    for (const [id, value] of Object.entries(v.dojoProgress))
      if (record(value))
        result.practice[id] = {
          ...newPractice(),
          ...(value.done === true
            ? {
                completedAt: new Date().toISOString(),
                reflection:
                  "Completed in the previous Prompt Dojo; prompt text was not recorded.",
              }
            : {}),
        };
  if (record(v.certProgress))
    for (const [id, value] of Object.entries(v.certProgress))
      if (record(value))
        result.credentials[id] = {
          checked: strings(value.checked) ? value.checked : [],
          evidence: value.parentConfirmed
            ? "Reported as completed in the previous app. Add the issuer record for review."
            : "",
        };
  if (record(v.timeByDay))
    for (const [day, modules] of Object.entries(v.timeByDay))
      if (record(modules))
        result.minutes[day] = Object.values(modules).reduce<number>(
          (n, val) =>
            n +
            (typeof val === "number" && Number.isFinite(val) && val >= 0
              ? val
              : 0),
          0,
        );
  return result;
}

export function projectFields(p: Project): Project {
  return {
    id: p.id,
    name: p.name,
    templateId: p.templateId,
    code: p.code,
    updatedAt: p.updatedAt,
    reflection: p.reflection,
    checks: [...p.checks],
  };
}
export function lessonFields(
  lessons: Record<string, LessonWork>,
): Record<string, LessonWork> {
  return Object.fromEntries(
    Object.entries(lessons).map(([id, l]) => [
      id,
      {
        step: l.step,
        answers: [...l.answers],
        checks: [...l.checks],
        evidence: l.evidence,
        attempts: l.attempts,
        ...(l.reading !== undefined ? { reading: l.reading } : {}),
        ...(l.completedAt !== undefined ? { completedAt: l.completedAt } : {}),
        ...(l.projectId !== undefined ? { projectId: l.projectId } : {}),
        ...(l.evidenceKind !== undefined
          ? { evidenceKind: l.evidenceKind }
          : {}),
      },
    ]),
  );
}

export function backupJson(data: WorkspaceData) {
  return JSON.stringify({ ...data, pin: null }, null, 2);
}
export function portfolioJson(data: WorkspaceData, submission?: Submission) {
  return JSON.stringify(
    {
      kind: "buidlcamp-portfolio",
      version: submission ? 2 : 1,
      ...(submission ? { submissionId: submission.id } : {}),
      name: data.name,
      lessons: lessonFields(data.lessons),
      projects: data.projects.map(projectFields),
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}
export function parsePortfolio(raw: string): Review {
  if (new TextEncoder().encode(raw).byteLength > 8_000_000)
    throw new Error("Portfolio is too large.");
  const v: unknown = JSON.parse(raw);
  if (
    !record(v) ||
    v.kind !== "buidlcamp-portfolio" ||
    ![1, 2].includes(v.version as number) ||
    (v.version === 2 &&
      (!str(v.submissionId, 100) ||
        !/^[a-zA-Z0-9_-]+$/.test(v.submissionId))) ||
    !str(v.name, 80) ||
    !entriesValid(v.lessons, validLesson) ||
    !Array.isArray(v.projects) ||
    v.projects.length > 100 ||
    !v.projects.every(validProject)
  )
    throw new Error("Choose a BuidlCamp portfolio file.");
  return {
    id: v.version === 2 ? String(v.submissionId) : crypto.randomUUID(),
    ...(v.version === 2 ? { submissionId: String(v.submissionId) } : {}),
    name: v.name,
    lessons: lessonFields(v.lessons as Record<string, LessonWork>),
    projects: v.projects.map(projectFields),
    receivedAt: new Date().toISOString(),
    feedback: "",
  };
}
export function parseAssignment(raw: string): Assignment {
  if (raw.length > 100000) throw new Error("Assignment is too large.");
  const v: unknown = JSON.parse(raw);
  if (
    !record(v) ||
    v.kind !== "buidlcamp-assignment" ||
    v.version !== 1 ||
    !validAssignment(v.assignment)
  )
    throw new Error("Choose a BuidlCamp assignment file.");
  return v.assignment;
}
export const PREVIEW_POLICY =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src 'none'; connect-src 'none'; media-src data: blob:; frame-src 'none'; form-action 'none'; base-uri 'none'";
export function previewDocument(code: string, diagnostics = false) {
  // This policy precedes all learner HTML; later policies cannot relax it.
  const bridge = diagnostics
    ? `<script>(()=>{let sent=0;const report=m=>{if(sent++<20)parent.postMessage({kind:"buidlcamp-preview-error",message:String(m).slice(0,300)},"*")};addEventListener("error",e=>report(e.message||"A resource could not load in this isolated preview."));addEventListener("unhandledrejection",e=>report(e.reason instanceof Error?e.reason.message:"An asynchronous action failed."));})();</script>`
    : "";
  return `<!doctype html><meta http-equiv="Content-Security-Policy" content="${PREVIEW_POLICY}"><meta name="referrer" content="no-referrer">${bridge}${code}`;
}
export interface Submission {
  id: string;
  createdAt: string;
  lessonIds: string[];
  projectIds: string[];
}
export interface FeedbackRecord {
  kind: "buidlcamp-feedback";
  version: 1;
  id: string;
  submissionId: string;
  feedback: string;
  reviewedAt: string;
  lessonIds: string[];
  projectIds: string[];
  response?: string;
  revisedAt?: string;
}
export interface CapstoneWork {
  projectId: string;
  reflection: string;
  completedAt?: string;
}
export function validFeedback(v: unknown): v is FeedbackRecord {
  return (
    record(v) &&
    v.kind === "buidlcamp-feedback" &&
    v.version === 1 &&
    str(v.id, 100) &&
    str(v.submissionId, 100) &&
    str(v.feedback) &&
    str(v.reviewedAt, 40) &&
    strings(v.lessonIds) &&
    strings(v.projectIds) &&
    (v.response === undefined || str(v.response)) &&
    (v.revisedAt === undefined || str(v.revisedAt, 40))
  );
}
export function parseFeedback(
  raw: string,
  submissions: Submission[],
): FeedbackRecord {
  if (new TextEncoder().encode(raw).byteLength > 50000)
    throw new Error("Feedback file is too large.");
  const v: unknown = JSON.parse(raw);
  if (!validFeedback(v))
    throw new Error("Choose a valid BuidlCamp feedback file.");
  const submission = submissions.find((s) => s.id === v.submissionId);
  if (
    !submission ||
    v.projectIds.some((id) => !submission.projectIds.includes(id)) ||
    v.lessonIds.some((id) => !submission.lessonIds.includes(id))
  )
    throw new Error(
      "This feedback belongs to a different or unavailable submission. Import it in the workspace that exported that portfolio.",
    );
  return {
    kind: "buidlcamp-feedback",
    version: 1,
    id: v.id,
    submissionId: v.submissionId,
    feedback: v.feedback,
    reviewedAt: v.reviewedAt,
    lessonIds: [...v.lessonIds],
    projectIds: [...v.projectIds],
  };
}
export function feedbackJson(review: Review) {
  if (!review.submissionId)
    throw new Error(
      "Ask the learner for a new portfolio export to return structured feedback.",
    );
  return JSON.stringify(
    {
      kind: "buidlcamp-feedback",
      version: 1,
      id: crypto.randomUUID(),
      submissionId: review.submissionId,
      feedback: review.feedback,
      reviewedAt: new Date().toISOString(),
      lessonIds: Object.keys(review.lessons),
      projectIds: review.projects.map((p) => p.id),
    },
    null,
    2,
  );
}
export async function pinHash(pin: string, salt: string = crypto.randomUUID()) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return `${salt}:${Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, "0")).join("")}`;
}
export async function checkPin(pin: string, stored: string) {
  return (await pinHash(pin, stored.split(":")[0])) === stored;
}
