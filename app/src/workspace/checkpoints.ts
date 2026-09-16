import { validProject } from "./model.ts";
import type { Project, WorkspaceData } from "./model.ts";

export interface MilestoneEvidence {
  id: string;
  title: string;
  evidence: string;
}
export interface ProjectCheckpoint {
  kind: "buidlcamp-checkpoint";
  version: 1;
  id: string;
  createdAt: string;
  message: string;
  project: Project;
  milestones: MilestoneEvidence[];
}
export interface RepositoryBinding {
  version: 1;
  id: number;
  owner: string;
  name: string;
  branch: string;
}
export const MANAGED_ROOT = "buidlcamp";
const identifier = /^[a-zA-Z0-9_-]{1,100}$/;
export const bytes = (value: unknown) =>
  new TextEncoder().encode(JSON.stringify(value)).byteLength;
export function cleanProject(value: unknown): Project {
  if (!value || typeof value !== "object" || !validProject(value))
    throw new Error("This project is invalid.");
  const p = value as Project;
  if (!identifier.test(p.id) || bytes(p.code) > 2_000_000)
    throw new Error("The project ID or size is invalid.");
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
export function secretFindings(text: string): string[] {
  const patterns: [string, RegExp][] = [
    ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
    [
      "GitHub token",
      /\b(?:gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{30,})\b/,
    ],
    [
      "API key",
      /\b(?:sk-(?:proj-|ant-api\d+-)?[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{30,})\b/,
    ],
    ["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
    [
      "assigned credential",
      /(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][^"'\s]{12,}["']/i,
    ],
  ];
  return patterns.filter(([, p]) => p.test(text)).map(([name]) => name);
}
export function parseCheckpoint(value: unknown): ProjectCheckpoint {
  if (!value || typeof value !== "object" || bytes(value) > 3_000_000)
    throw new Error("The checkpoint is invalid or too large.");
  const v = value as ProjectCheckpoint;
  if (
    v.kind !== "buidlcamp-checkpoint" ||
    v.version !== 1 ||
    typeof v.id !== "string" ||
    !identifier.test(v.id) ||
    typeof v.createdAt !== "string" ||
    !Number.isFinite(Date.parse(v.createdAt)) ||
    typeof v.message !== "string" ||
    !v.message.trim() ||
    v.message.length > 200 ||
    !Array.isArray(v.milestones) ||
    v.milestones.length > 100
  )
    throw new Error("Choose a valid BuidlCamp checkpoint.");
  const milestones = v.milestones.map((m) => {
    if (
      !m ||
      typeof m.id !== "string" ||
      !identifier.test(m.id) ||
      typeof m.title !== "string" ||
      m.title.length > 150 ||
      typeof m.evidence !== "string" ||
      m.evidence.length > 10000
    )
      throw new Error("Milestone evidence is invalid.");
    return { id: m.id, title: m.title, evidence: m.evidence };
  });
  return {
    kind: "buidlcamp-checkpoint",
    version: 1,
    id: v.id,
    createdAt: v.createdAt,
    message: v.message.trim(),
    project: cleanProject(v.project),
    milestones,
  };
}
export function makeCheckpoint(
  project: Project,
  message: string,
  milestones: MilestoneEvidence[] = [],
): ProjectCheckpoint {
  return parseCheckpoint({
    kind: "buidlcamp-checkpoint",
    version: 1,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    message,
    project,
    milestones,
  });
}
export function checkpointFiles(
  checkpoint: ProjectCheckpoint,
): Record<string, string> {
  const c = parseCheckpoint(checkpoint);
  const { code, ...metadata } = c.project;
  const root = `${MANAGED_ROOT}/projects/${c.project.id}`;
  const files = {
    [`${root}/index.html`]: code,
    [`${root}/checkpoint.json`]: JSON.stringify(
      { ...c, project: metadata },
      null,
      2,
    ),
  };
  const findings = secretFindings(Object.values(files).join("\n"));
  if (findings.length)
    throw new Error(
      `Remove possible credentials before sharing: ${findings.join(", ")}.`,
    );
  return files;
}
export function availableMilestones(
  data: WorkspaceData,
  titles: Record<string, string>,
): MilestoneEvidence[] {
  return [
    ...Object.entries(data.lessons)
      .filter(([, l]) => l.completedAt)
      .map(([id, l]) => ({
        id,
        title: titles[id] ?? id,
        evidence: l.evidence,
      })),
    ...Object.entries(data.capstones)
      .filter(([, c]) => c.completedAt)
      .map(([id, c]) => ({
        id: "capstone-" + id,
        title: "Capstone: " + id,
        evidence: c.reflection,
      })),
  ];
}
export function compareLines(before: string, after: string) {
  const a = before.split("\n"),
    b = after.split("\n");
  let first = 0;
  while (first < a.length && first < b.length && a[first] === b[first]) first++;
  let endA = a.length,
    endB = b.length;
  while (endA > first && endB > first && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  return {
    unchangedStart: first,
    removed: a.slice(first, endA),
    added: b.slice(first, endB),
    identical: before === after,
  };
}
