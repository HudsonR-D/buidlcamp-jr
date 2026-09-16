import { download, readFile } from "./files";
import { useState } from "react";
import { QUESTS, TRACKS } from "../data/quests";
import { parsePortfolio, feedbackJson } from "./model";
import { exportSubmission } from "./submissions";
import { supportFor } from "../data/scaffolds";
import { useWorkspace } from "./store";
import {
  AdultGate,
  Button,
  CheckRow,
  Empty,
  Heading,
  Notice,
  RichText,
  Tabs,
} from "./ui";
function Desk() {
  const { data, update, lock } = useWorkspace();
  const [tab, setTab] = useState("overview");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ids, setIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [lessonId, setLessonId] = useState(QUESTS[0].id);
  const plan = QUESTS.find((q) => q.id === lessonId)!;
  const done = Object.entries(data.lessons).filter(
    ([, work]) => work.completedAt,
  );
  return (
    <>
      <div className="toolbar no-print">
        <Tabs
          options={[
            { id: "overview", label: "Learner overview" },
            { id: "plans", label: "Lesson plans" },
            { id: "assign", label: "Assignments" },
            { id: "review", label: "Portfolio review" },
          ]}
          value={tab}
          onChange={setTab}
        />
        <Button variant="quiet" onClick={lock}>
          Lock desk
        </Button>
      </div>
      {notice && <Notice>{notice}</Notice>}
      <details className="no-print">
        <summary>Classroom workflow and shared devices</summary>
        <p>
          Create an assignment file, let the learner import it, then ask for a
          portfolio export. Import that portfolio here, write feedback, and
          return the feedback file. The learner imports it in Settings and
          records a revision.
        </p>
        <p>
          Each browser profile has one workspace. Use separate trusted profiles
          or devices for separate learners. The local PIN is a convenience lock,
          not account authentication or verified consent. Export and remove
          learner records according to your school’s arrangements before
          reassigning a device.
        </p>
        <p>
          For ages 10–12, keep GitHub exercises local. Adults prepare external
          AI examples and handle any repository upload in their own separate
          accounts. Do not share logins or upload private student records.
        </p>
      </details>
      {tab === "overview" && (
        <>
          <section className="report panel">
            <div className="section-title">
              <h2>{data.name}’s learning record</h2>
              <Button
                className="no-print"
                variant="secondary"
                onClick={() => window.print()}
              >
                Print report
              </Button>
            </div>
            <p className="muted">
              Local records from this device · {new Date().toLocaleDateString()}
            </p>
            <div className="report-stats">
              <div>
                <strong>{done.length}</strong> completed lessons
              </div>
              <div>
                <strong>{data.projects.length}</strong> saved projects
              </div>
              <div>
                <strong>
                  {
                    Object.values(data.practice).filter((p) => p.completedAt)
                      .length
                  }
                </strong>{" "}
                recorded practices
              </div>
              <div>
                <strong>
                  {Object.values(data.minutes).reduce(
                    (total, n) => total + n,
                    0,
                  )}
                </strong>{" "}
                estimated active minutes
              </div>
            </div>
            <p className="small muted">
              Completion reflects checks and learner self-assessment, not an
              independent grade. Active time is an estimate from visible,
              recently used pages.
            </p>
            {TRACKS.map((t) => (
              <div className="list-row" key={t.id}>
                <h3>{t.name}</h3>
                <span>
                  {
                    done.filter(
                      ([id]) => QUESTS.find((q) => q.id === id)?.track === t.id,
                    ).length
                  }{" "}
                  lessons completed
                </span>
              </div>
            ))}
            <h3 className="section">Work to discuss</h3>
            {done.length ? (
              done.map(([id, work]) => (
                <details key={id}>
                  <summary>
                    {QUESTS.find((q) => q.id === id)?.title ?? id}
                  </summary>
                  <p className="evidence">{work.evidence}</p>
                </details>
              ))
            ) : (
              <p>
                No completed lessons yet. Start small and ask the learner to
                explain what they made.
              </p>
            )}
            <div className="section">
              <h3>Projects</h3>
              {data.projects.map((p) => (
                <p key={p.id}>
                  <strong>{p.name}</strong> —{" "}
                  {p.reflection || "Reflection not recorded yet."}
                </p>
              ))}
            </div>
            <div className="button-row no-print">
              <Button
                variant="secondary"
                onClick={() =>
                  download("buidlcamp-portfolio.json", exportSubmission())
                }
              >
                Export learner portfolio
              </Button>
            </div>
          </section>
          <section className="notice">
            This desk works without student accounts. To review another learner,
            ask them to export their portfolio and import that file here. Files
            do not sync automatically.
          </section>
        </>
      )}
      {tab === "plans" && (
        <section className="panel lesson-plan">
          <label className="no-print">
            Choose a lesson
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
            >
              {QUESTS.map((q) => (
                <option value={q.id} key={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </label>
          <h2>{plan.title}</h2>
          <p>
            <RichText text={plan.brief} />
          </p>
          <h3>Learning intention</h3>
          <p>{supportFor(plan).objective}</p>
          <h3>Worked example</h3>
          <p>{supportFor(plan).example}</p>
          <h3>Scaffold</h3>
          <p>{supportFor(plan).hint}</p>
          <h3>Extension</h3>
          <p>{supportFor(plan).stretch}</p>
          <h3>Suggested session: 20–35 minutes, flexible</h3>
          <ol className="prose">
            <li>Invite the learner to explain the idea in their own words.</li>
            <li>Read together or independently. Model one small example.</li>
            <li>Use the knowledge checks as discussion prompts.</li>
            <li>
              Make the creative project and record the learner’s reasoning.
            </li>
            <li>Choose a next step together. Stop sooner if needed.</li>
          </ol>
          <h3>Adaptations</h3>
          <p>
            Offer shorter reading steps, read aloud, pair programming, drawing
            on paper, or a verbal explanation recorded by an adult. Advanced
            learners can add edge cases and tests. An AI account is optional.
          </p>
          <h3>Creative task</h3>
          <p>
            <RichText text={plan.creative.prompt} />
          </p>
          <h3>Evidence checklist</h3>
          <ul>
            {plan.creative.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Printable evidence rubric</h3>
          <table className="rubric-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Beginning</th>
                <th>Developing</th>
                <th>Independent example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Explain</th>
                <td>Names an idea with help</td>
                <td>Explains a choice with a prompt</td>
                <td>Explains the choice and its limits</td>
              </tr>
              <tr>
                <th>Make</th>
                <td>Changes a worked example</td>
                <td>Builds a small working result</td>
                <td>Adapts the result to a chosen purpose</td>
              </tr>
              <tr>
                <th>Test</th>
                <td>Tries the happy path with help</td>
                <td>Checks a normal and unusual input</td>
                <td>Predicts, tests, and explains differences</td>
              </tr>
              <tr>
                <th>Improve</th>
                <td>Identifies a next step together</td>
                <td>Uses feedback for one revision</td>
                <td>Shows why a revision improved the work</td>
              </tr>
            </tbody>
          </table>
          <p className="small muted">
            Discuss the evidence for each row. This rubric is a teaching aid,
            not a certified score.
          </p>
          <h3>Assessment conversation</h3>
          <p>
            Can the learner explain a choice, test an example, and improve their
            work after feedback? Review the process as well as the result. This
            plan does not claim alignment or accreditation from a school
            standards body.
          </p>
          <Button
            className="no-print"
            variant="secondary"
            onClick={() => window.print()}
          >
            Print lesson plan
          </Button>
        </section>
      )}
      {tab === "assign" && (
        <>
          <form
            className="panel"
            onSubmit={(e) => {
              e.preventDefault();
              const assignment = {
                id: crypto.randomUUID(),
                title: title.trim(),
                instructions: instructions.trim(),
                lessonIds: ids,
                createdAt: new Date().toISOString(),
              };
              update((d) => ({
                ...d,
                assignments: [...d.assignments, assignment],
              }));
              setIds([]);
              setTitle("");
              setInstructions("");
              setNotice(
                "Assignment saved. Download its file for learners to import in Settings.",
              );
            }}
          >
            <h2>Create a self-paced assignment</h2>
            <label>
              Assignment title
              <input
                maxLength={160}
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              Instructions
              <textarea
                maxLength={5000}
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="What should learners explore, make, and explain?"
              />
            </label>
            <fieldset>
              <legend>Choose lessons</legend>
              <div className="assignment-lessons">
                {QUESTS.map((q) => (
                  <CheckRow
                    key={q.id}
                    checked={ids.includes(q.id)}
                    onChange={() =>
                      setIds(
                        ids.includes(q.id)
                          ? ids.filter((id) => id !== q.id)
                          : [...ids, q.id],
                      )
                    }
                  >
                    {q.title}
                  </CheckRow>
                ))}
              </div>
            </fieldset>
            <Button
              type="submit"
              disabled={
                !title.trim() || !ids.length || data.assignments.length >= 100
              }
            >
              Save assignment
            </Button>
          </form>
          <section className="section">
            <h2>Saved assignments</h2>
            {data.assignments.map((a) => (
              <div className="list-row" key={a.id}>
                <div>
                  <h3>{a.title}</h3>
                  <p>
                    {a.lessonIds.length} lessons · {a.instructions}
                  </p>
                </div>
                <div className="button-row">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      download(
                        "buidlcamp-assignment.json",
                        JSON.stringify(
                          {
                            kind: "buidlcamp-assignment",
                            version: 1,
                            assignment: a,
                          },
                          null,
                          2,
                        ),
                      )
                    }
                  >
                    Download
                  </Button>
                  <Button
                    variant="quiet"
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        assignments: d.assignments.filter((x) => x.id !== a.id),
                      }))
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
      {tab === "review" && (
        <>
          <section className="panel">
            <h2>Review learner portfolios</h2>
            <p>
              Import files shared with you by learners or their families. Only
              their nickname, lesson evidence, and project work are included.
              Keep these files on a trusted device.
            </p>
            <label className="file-label">
              Import portfolio
              <input
                type="file"
                accept=".json,application/json"
                onChange={async (e) => {
                  try {
                    const review = parsePortfolio(
                      await readFile(e.target.files?.[0]),
                    );
                    if (data.reviews.length >= 100)
                      throw new Error(
                        "Remove a portfolio before adding another.",
                      );
                    update((d) => ({
                      ...d,
                      reviews: [
                        ...d.reviews.filter((r) => r.id !== review.id),
                        review,
                      ],
                    }));
                    setNotice(`Imported ${review.name}’s portfolio.`);
                  } catch (err) {
                    setNotice(
                      err instanceof Error
                        ? err.message
                        : "Could not import portfolio.",
                    );
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </section>
          {data.reviews.length ? (
            data.reviews.map((r) => (
              <section className="panel section" key={r.id}>
                <div className="section-title">
                  <h2>{r.name}</h2>
                  <Button
                    variant="quiet"
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        reviews: d.reviews.filter((x) => x.id !== r.id),
                      }))
                    }
                  >
                    Remove local copy
                  </Button>
                </div>
                <p className="small muted">
                  Imported {new Date(r.receivedAt).toLocaleDateString()} ·{" "}
                  {r.projects.length} projects
                </p>
                {Object.entries(r.lessons).map(([id, w]) => (
                  <details key={id}>
                    <summary>
                      {QUESTS.find((q) => q.id === id)?.title ?? id} ·{" "}
                      {w.completedAt ? "Completed" : "In progress"}
                    </summary>
                    <p className="evidence">
                      {w.evidence || "No reflection yet."}
                    </p>
                  </details>
                ))}
                {r.projects.map((p) => (
                  <details key={p.id}>
                    <summary>Project: {p.name}</summary>
                    <p>{p.reflection}</p>
                    <pre className="review-code">{p.code}</pre>
                  </details>
                ))}
                <label>
                  Your feedback
                  <textarea
                    rows={3}
                    maxLength={10000}
                    value={r.feedback}
                    onChange={(e) =>
                      update((d) => ({
                        ...d,
                        reviews: d.reviews.map((x) =>
                          x.id === r.id
                            ? { ...x, feedback: e.target.value }
                            : x,
                        ),
                      }))
                    }
                  />
                </label>
                <Button
                  variant="secondary"
                  onClick={() =>
                    download(
                      r.submissionId
                        ? "buidlcamp-feedback.json"
                        : "buidlcamp-feedback.txt",
                      r.submissionId
                        ? feedbackJson(r)
                        : `Feedback for ${r.name}\n\n${r.feedback}`,
                      "text/plain",
                    )
                  }
                >
                  Download feedback
                </Button>
              </section>
            ))
          ) : (
            <Empty title="Ready for their work">
              Import a portfolio to read reflections and source code. Imported
              code is displayed as text and is never run here.
            </Empty>
          )}
        </>
      )}
    </>
  );
}
export default function Educator() {
  return (
    <>
      <Heading title="Educator desk">
        A clear view of the learning, with room for your judgment.
      </Heading>
      <AdultGate>
        <Desk />
      </AdultGate>
    </>
  );
}
