import { useState } from "react";
import { Link } from "react-router-dom";
import { QUESTS, TRACKS } from "../data/quests";
import { useWorkspace } from "./store";
import { Button, Modal } from "./ui";
const CAPSTONES = {
  "code-craft": {
    title: "Build a useful little tool",
    task: "Create a counter, checklist, or drawing tool. Explain one function, test a boundary input, and show a revision that improved it.",
  },
  "ai-explorer": {
    title: "Teach an idea and test the explanation",
    task: "Build a small learning page using your own explanation or a reviewed AI draft. Identify a claim you checked, a limitation, and a change made after testing. An AI account is optional.",
  },
  "game-design": {
    title: "Make one playable level",
    task: "Build a small game with clear controls, a reachable goal, and restart. Test with touch and keyboard, record feedback, and improve one thing.",
  },
  "build-together": {
    title: "Prepare a responsible release",
    task: "Save two project versions, compare them, write a README and permission inventory, and prepare a reviewed local release. Public sharing is optional and separate.",
  },
};
export default function Milestones() {
  const { data, update } = useWorkspace(),
    [selected, setSelected] = useState<string | null>(null);
  const cap = selected ? CAPSTONES[selected as keyof typeof CAPSTONES] : null;
  const work = selected
    ? (data.capstones[selected] ?? { projectId: "", reflection: "" })
    : null;
  return (
    <section className="section">
      <h2>Skills you can show</h2>
      <p>
        Build evidence over time. These are your learning milestones, ready for
        a conversation with an educator.
      </p>
      <div className="path-list">
        {TRACKS.map((t) => {
          const complete = QUESTS.filter(
            (q) => q.track === t.id && data.lessons[q.id]?.completedAt,
          ).length;
          return (
            <div className="list-row" key={t.id}>
              <div>
                <h3>{t.name}</h3>
                <p>
                  {complete
                    ? `${complete} learning records`
                    : "Your first example is a good beginning"}
                  {data.capstones[t.id]?.completedAt
                    ? " · capstone recorded"
                    : ""}
                </p>
                <p className="small muted">{CAPSTONES[t.id].title}</p>
              </div>
              <Button variant="secondary" onClick={() => setSelected(t.id)}>
                Open capstone
              </Button>
            </div>
          );
        })}
      </div>
      {selected && cap && work && (
        <Modal title={cap.title} onClose={() => setSelected(null)}>
          <p>{cap.task}</p>
          <label>
            Link your project
            <select
              value={work.projectId}
              onChange={(e) =>
                update((d) => ({
                  ...d,
                  capstones: {
                    ...d.capstones,
                    [selected]: {
                      ...work,
                      projectId: e.target.value,
                      completedAt: undefined,
                    },
                  },
                }))
              }
            >
              <option value="">Choose a saved project</option>
              {data.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <p>
            <Link to="/forge" onClick={() => setSelected(null)}>
              Build or revise a project
            </Link>
          </p>
          <label>
            Explain your tests, evidence, and one improvement
            <textarea
              rows={5}
              maxLength={10000}
              value={work.reflection}
              onChange={(e) =>
                update((d) => ({
                  ...d,
                  capstones: {
                    ...d.capstones,
                    [selected]: {
                      ...work,
                      reflection: e.target.value,
                      completedAt: undefined,
                    },
                  },
                }))
              }
            />
          </label>
          <p>
            Explain the result in your own words. This records your completion;
            it is not an independent grade or an external certificate.
          </p>
          <Button
            disabled={
              !work.projectId ||
              !data.projects.some((p) => p.id === work.projectId) ||
              work.reflection.trim().length < 20
            }
            onClick={() =>
              update((d) => ({
                ...d,
                capstones: {
                  ...d.capstones,
                  [selected]: {
                    ...work,
                    completedAt: new Date().toISOString(),
                  },
                },
              }))
            }
          >
            {work.completedAt ? "Capstone recorded" : "Record my capstone"}
          </Button>
        </Modal>
      )}
    </section>
  );
}
