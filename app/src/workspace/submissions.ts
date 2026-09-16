import { portfolioJson } from "./model";
import type { Submission } from "./model";
import { useWorkspace } from "./store";
export function exportSubmission() {
  const { data, update } = useWorkspace.getState();
  const submission: Submission = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    lessonIds: Object.keys(data.lessons),
    projectIds: data.projects.map((p) => p.id),
  };
  update((d) => ({
    ...d,
    submissions: [submission, ...d.submissions].slice(0, 100),
  }));
  if (
    !useWorkspace
      .getState()
      .data.submissions.some((s) => s.id === submission.id)
  )
    throw new Error(
      "Make space in your workspace before exporting a tracked submission.",
    );
  return portfolioJson(data, submission);
}
