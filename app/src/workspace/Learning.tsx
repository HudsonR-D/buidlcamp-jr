import { toggle } from "./files";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { QUESTS, TRACKS } from "../data/quests";
import { supportFor } from "../data/scaffolds";
import type { Quest } from "../types";
import { canFinish, LEVELS, newLesson } from "./model";
import { useWorkspace } from "./store";
import { Button, CheckRow, Heading, Icon, Notice, RichText, Tabs } from "./ui";
const STEPS = [
  "Explore",
  "Learn",
  "Check understanding",
  "Make something",
  "Complete",
];
function Lesson({ quest, onClose }: { quest: Quest; onClose: () => void }) {
  const { data, update } = useWorkspace();
  const work = data.lessons[quest.id] ?? newLesson();
  const support = supportFor(quest);
  const reading = data.level === "junior" ? support.guided : quest.lesson;
  const page = Math.min(work.reading ?? 0, reading.length - 1);
  const save = (patch: Partial<typeof work>) =>
    update((d) => ({
      ...d,
      lessons: {
        ...d.lessons,
        [quest.id]: { ...(d.lessons[quest.id] ?? newLesson()), ...patch },
      },
    }));
  const correct = quest.questions.every((q, i) => work.answers[i] === q.answer);
  const checklist = quest.creative.checklist;
  return (
    <>
      <Button variant="quiet" onClick={onClose}>
        Back to learning paths
      </Button>
      <Heading title={quest.title}>{quest.tagline}</Heading>
      <div className="lesson-layout">
        <aside className="lesson-steps">
          <ol>
            {STEPS.map((name, i) => (
              <li className={i === work.step ? "current" : ""} key={name}>
                <span>{i + 1}</span>
                {name}
              </li>
            ))}
          </ol>
          <p className="small muted">
            Your work saves as you go. Pause whenever you need.
          </p>
        </aside>
        <article className="lesson-content panel">
          {work.step === 0 && (
            <>
              <h2>What you’ll explore</h2>
              <p className="prose">
                <RichText text={quest.brief} />
              </p>
              <div className="notice">
                You can write, draw on paper, or build your answer. At the end,
                describe your work in your own words.
              </div>
              {quest.prereqs.length > 0 && (
                <p className="small muted">
                  Suggested preparation:{" "}
                  {quest.prereqs
                    .map((id) => QUESTS.find((q) => q.id === id)?.title)
                    .join(", ")}
                  . You can still explore this lesson now.
                </p>
              )}
              <Button
                onClick={() => save({ step: 1, attempts: work.attempts + 1 })}
              >
                Start lesson <Icon />
              </Button>
            </>
          )}
          {work.step === 1 && (
            <>
              <h2>Take it one step at a time</h2>
              {data.level === "junior" ? (
                <>
                  <p className="small muted">
                    Reading {page + 1} of {reading.length}
                  </p>
                  <p className="prose">
                    <RichText text={reading[page]} />
                  </p>
                  <div className="button-row">
                    <Button
                      variant="secondary"
                      disabled={page === 0}
                      onClick={() => save({ reading: page - 1 })}
                    >
                      Previous reading
                    </Button>
                    {page < reading.length - 1 ? (
                      <Button onClick={() => save({ reading: page + 1 })}>
                        Next reading <Icon />
                      </Button>
                    ) : (
                      <Button onClick={() => save({ step: 2 })}>
                        Check my understanding <Icon />
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {quest.lesson.map((p, i) => (
                    <p key={i} className="prose">
                      <RichText text={p} />
                    </p>
                  ))}
                  <Button onClick={() => save({ step: 2 })}>
                    Check my understanding <Icon />
                  </Button>
                </>
              )}
              <details>
                <summary>A worked example and a hint</summary>
                <h3>Example</h3>
                <p>{support.example}</p>
                <h3>Try this</h3>
                <p>{support.hint}</p>
              </details>
              <details open={data.level === "legend"}>
                <summary>Go further when you’re ready</summary>
                <p>{support.stretch}</p>
              </details>
              <Button variant="quiet" onClick={() => save({ step: 0 })}>
                Back to introduction
              </Button>
            </>
          )}
          {work.step === 2 && (
            <>
              <h2>Try, check, and try again</h2>
              <p className="muted">
                These checks help you learn. There is no timer and no penalty
                for another try.
              </p>
              {quest.questions.map((q, i) => (
                <fieldset className="question" key={q.prompt}>
                  <legend>
                    <RichText text={q.prompt} />
                  </legend>
                  {q.options.map((opt, j) => (
                    <label
                      key={opt}
                      className={`answer ${work.answers[i] === j ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`question-${i}`}
                        checked={work.answers[i] === j}
                        onChange={() => {
                          const answers = quest.questions.map((_, index) =>
                            index === i ? j : (work.answers[index] ?? -1),
                          );
                          save({ answers });
                        }}
                      />
                      <RichText text={opt} />
                    </label>
                  ))}
                  {work.answers[i] !== undefined && work.answers[i] >= 0 && (
                    <Notice error={work.answers[i] !== q.answer}>
                      {work.answers[i] === q.answer
                        ? "That’s right. "
                        : "Try another answer. "}
                      <RichText text={q.explain} />
                    </Notice>
                  )}
                </fieldset>
              ))}
              <div className="button-row">
                <Button variant="secondary" onClick={() => save({ step: 1 })}>
                  Revisit the lesson
                </Button>
                <Button disabled={!correct} onClick={() => save({ step: 3 })}>
                  Make something <Icon />
                </Button>
              </div>
            </>
          )}
          {work.step === 3 && (
            <>
              <h2>Show what you understand</h2>
              <label>
                Evidence format
                <select
                  value={work.evidenceKind ?? "explanation"}
                  onChange={(e) =>
                    save({
                      evidenceKind: e.target.value as
                        "explanation" | "project" | "demonstration",
                    })
                  }
                >
                  <option value="explanation">My explanation</option>
                  <option value="project">A saved project</option>
                  <option value="demonstration">
                    A demonstration or paper activity
                  </option>
                </select>
              </label>
              {work.evidenceKind === "project" && (
                <label>
                  Project used in this lesson
                  <select
                    value={work.projectId ?? ""}
                    onChange={(e) => save({ projectId: e.target.value })}
                  >
                    <option value="">Choose a saved project</option>
                    {data.projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <p className="notice">
                Record what you tried, what happened, and why. This is your
                learning evidence; an educator can review it separately.
              </p>
              <p className="prose">
                <RichText text={quest.creative.prompt} />
              </p>
              <label>
                Your work or reflection
                <textarea
                  rows={6}
                  maxLength={10000}
                  value={work.evidence}
                  placeholder="Write your answer, paste your code, or explain what you made and tested."
                  onChange={(e) => save({ evidence: e.target.value })}
                />
              </label>
              <p className="small muted">
                Use at least 20 characters. Leave out names, school details, and
                other private information.
              </p>
              <h3>Check your work</h3>
              {checklist.map((item, i) => (
                <CheckRow
                  key={item}
                  checked={work.checks.includes(i)}
                  onChange={() => save({ checks: toggle(work.checks, i) })}
                >
                  {item}
                </CheckRow>
              ))}
              <div className="button-row">
                <Button variant="secondary" onClick={() => save({ step: 2 })}>
                  Back to checks
                </Button>
                <Button
                  disabled={
                    (work.evidenceKind === "project" &&
                      !data.projects.some((p) => p.id === work.projectId)) ||
                    !canFinish(
                      work,
                      quest.questions.map((q) => q.answer),
                      checklist.length,
                    )
                  }
                  onClick={() =>
                    save({
                      step: 4,
                      completedAt: work.completedAt ?? new Date().toISOString(),
                    })
                  }
                >
                  Complete lesson <Icon name="check" />
                </Button>
              </div>
            </>
          )}
          {work.step === 4 && (
            <>
              <span className="success-icon">
                <Icon name="check" size={32} />
              </span>
              <h2>You made progress.</h2>
              <p>
                You checked your understanding and recorded your work. This is a
                BuidlCamp learning record, ready to discuss with a teacher or
                family member.
              </p>
              <div className="evidence">
                <h3>Your reflection</h3>
                <p>{work.evidence}</p>
              </div>
              <div className="button-row">
                <Button onClick={onClose}>
                  Choose your next lesson <Icon />
                </Button>
                <Button variant="secondary" onClick={() => save({ step: 1 })}>
                  Revisit this lesson
                </Button>
              </div>
            </>
          )}
        </article>
      </div>
    </>
  );
}
export default function Learning() {
  const { data } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const track = params.get("track") ?? "code-craft";
  const quest = QUESTS.find((q) => q.id === params.get("quest"));
  const visible = QUESTS.filter(
    (q) =>
      q.track === track &&
      `${q.title} ${q.tagline}`.toLowerCase().includes(query.toLowerCase()),
  );
  if (quest)
    return (
      <Lesson
        key={quest.id}
        quest={quest}
        onClose={() => setParams({ track: quest.track })}
      />
    );
  return (
    <>
      <Heading title="Learning paths">
        Follow your curiosity. Build understanding at your own pace.
      </Heading>
      <div className="toolbar">
        <Tabs
          options={TRACKS.map((t) => ({ id: t.id, label: t.name }))}
          value={track}
          onChange={(id) => setParams({ track: id })}
        />
        <label className="search-label">
          <span className="sr-only">Find a lesson</span>
          <input
            type="search"
            placeholder="Find a lesson…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p className="muted">
        Start with the foundations or explore ahead. Suggested reading level:{" "}
        {LEVELS[data.level].toLowerCase()}. Lessons open without XP
        requirements.
      </p>
      {[1, 2, 3].map((tier) => {
        const lessons = visible.filter((q) => q.tier === tier);
        return lessons.length ? (
          <section className="section" key={tier}>
            <div className="section-title">
              <h2>
                {["Foundations", "Build your skills", "Go deeper"][tier - 1]}
              </h2>
              <span className="small muted">
                {lessons.filter((q) => data.lessons[q.id]?.completedAt).length}{" "}
                / {lessons.length} complete
              </span>
            </div>
            <div className="lesson-list">
              {lessons.map((q, i) => (
                <button
                  className="lesson-row"
                  key={q.id}
                  onClick={() => setParams({ quest: q.id })}
                >
                  <span className={`path-number tone-${tier - 1}`}>
                    {data.lessons[q.id]?.completedAt ? (
                      <Icon name="check" />
                    ) : (
                      String(i + 1).padStart(2, "0")
                    )}
                  </span>
                  <div>
                    <h3>{q.title}</h3>
                    <p>{q.tagline}</p>
                    <span className="small muted">
                      {LEVELS[q.minAgeMode]} · {q.questions.length} checks · one
                      creative task
                    </span>
                  </div>
                  <span className="row-action">
                    {data.lessons[q.id]?.completedAt
                      ? "Revisit"
                      : data.lessons[q.id]
                        ? "Continue"
                        : "Explore"}
                    <Icon />
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null;
      })}
      {visible.length === 0 && (
        <Notice>No lessons match that search. Try a different word.</Notice>
      )}
    </>
  );
}
