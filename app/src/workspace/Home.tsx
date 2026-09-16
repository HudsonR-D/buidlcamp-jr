import { Link } from "react-router-dom";
import { QUESTS, TRACKS } from "../data/quests";
import { useWorkspace } from "./store";
import { Heading, Icon } from "./ui";
import Milestones from "./Milestones";
const DESCRIPTIONS = [
  "From first instructions to real JavaScript.",
  "Understand, question, and create with AI.",
  "Turn your ideas into playable projects.",
  "Keep useful versions. Learn to share responsibly.",
];
export default function Home() {
  const { data } = useWorkspace();
  const inProgress = QUESTS.find(
    (q) => data.lessons[q.id] && !data.lessons[q.id].completedAt,
  );
  const next =
    inProgress ??
    QUESTS.find(
      (q) =>
        !data.lessons[q.id]?.completedAt &&
        q.prereqs.every((id) => data.lessons[id]?.completedAt),
    ) ??
    QUESTS[0];
  const done = Object.values(data.lessons).filter((l) => l.completedAt).length;
  return (
    <>
      <Heading title="Small steps. Real skills.">
        Learn something. Build something. Make it yours.
      </Heading>
      <section className="learning-feature">
        <div>
          <div className="feature-label">
            {inProgress ? "CONTINUE YOUR LESSON" : "START YOUR NEXT LESSON"}
          </div>
          <h2>
            {next.id === "cc1-sequences"
              ? "Think like a programmer"
              : next.title}
          </h2>
          <p>
            {next.id === "cc1-sequences"
              ? "Break a big idea into small, clear instructions."
              : next.tagline}
          </p>
          <div className="feature-actions">
            <Link className="button primary" to={`/academy?quest=${next.id}`}>
              {inProgress ? "Continue learning" : "Start learning"}
            </Link>
            <span>About 15 minutes</span>
          </div>
        </div>
        <div className="code-sheet" aria-hidden="true">
          <div className="window-dots">
            <i />
            <i />
            <i />
          </div>
          <span>// One step at a time</span>
          <pre>idea → plan → build → test</pre>
          <div className="process">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="process-labels">
            <span>idea</span>
            <span>plan</span>
            <span>build</span>
            <span>test</span>
          </div>
        </div>
      </section>
      <div className="home-grid">
        <section>
          <h2>Choose your path</h2>
          <div className="path-list">
            {TRACKS.map((track, i) => (
              <Link
                className="path-row"
                key={track.id}
                to={`/academy?track=${track.id}`}
              >
                <span className={`path-number tone-${i}`}>{i + 1}</span>
                <div>
                  <h3>{track.name}</h3>
                  <p>{DESCRIPTIONS[i]}</p>
                </div>
                <span className="row-action">
                  Explore <Icon />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="progress-panel">
          <h2>Your learning, your pace</h2>
          <div className="stat">
            <strong>{done}</strong>
            <span>lessons completed</span>
          </div>
          <div className="stat">
            <strong>{data.projects.length}</strong>
            <span>projects saved</span>
          </div>
          <p>
            No streaks to keep.
            <br />
            Pick up where you left off.
          </p>
        </section>
      </div>
      <Milestones />
      {data.feedback.some((f) => !f.revisedAt) && (
        <p className="notice">
          <Link to="/settings">You have educator feedback to review.</Link>
        </p>
      )}
      <section className="bring-ai">
        <div>
          <h2>Bring your curiosity. Bring your own AI.</h2>
          <p>Practice without an account, or use a provider you choose.</p>
        </div>
        <Link className="text-link" to="/dojo">
          Explore AI practice <Icon />
        </Link>
      </section>
      {data.assignments.length > 0 && (
        <section className="section">
          <h2>Your assignments</h2>
          {data.assignments.map((a) => (
            <div className="list-row" key={a.id}>
              <div>
                <h3>{a.title}</h3>
                <p>{a.instructions}</p>
                <ul className="assignment-links">
                  {a.lessonIds.map((id) => (
                    <li key={id}>
                      <Link to={`/academy?quest=${id}`}>
                        {data.lessons[id]?.completedAt ? "✓ " : ""}
                        {QUESTS.find((q) => q.id === id)?.title ?? id}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                className="button secondary"
                to={`/academy?quest=${a.lessonIds.find((id) => !data.lessons[id]?.completedAt) ?? a.lessonIds[0]}`}
              >
                Open assignment
              </Link>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
