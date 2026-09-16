import { useState } from "react";
import { QUESTS, TRACKS } from "../data/quests";
import { PROGRAMS } from "./programs";
import { providerEligible } from "./providers";
import { useWorkspace } from "./store";
import {
  AdultGate,
  Button,
  CheckRow,
  Heading,
  Icon,
  Modal,
  Notice,
  Tabs,
} from "./ui";
export default function Credentials() {
  const { data, update } = useWorkspace();
  const [filter, setFilter] = useState("fit");
  const [selected, setSelected] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [award, setAward] = useState<string | null>(null);
  const program = PROGRAMS.find((p) => p.id === selected);
  const progress = selected
    ? (data.credentials[selected] ?? { checked: [], evidence: "" })
    : null;
  const available = PROGRAMS.filter(
    (p) => filter === "all" || providerEligible(data.age, p.minAge),
  );
  const setProgress = (patch: Partial<NonNullable<typeof progress>>) => {
    if (selected)
      update((d) => ({
        ...d,
        credentials: {
          ...d.credentials,
          [selected]: {
            ...(d.credentials[selected] ?? { checked: [], evidence: "" }),
            ...patch,
          },
        },
      }));
  };
  return (
    <>
      <Heading title="Credentials with a real issuer">
        Find a pathway. Do the work. Earn the credential from the organization
        that offers it.
      </Heading>
      <Notice>
        BuidlCamp is an independent learning guide. Outside credentials come
        from their issuers. A checked box or local review does not verify a
        certificate.
      </Notice>
      <Tabs
        options={[
          { id: "fit", label: "For my age group" },
          { id: "all", label: "All pathways" },
        ]}
        value={filter}
        onChange={setFilter}
      />
      <div className="credential-list">
        {available.map((p) => (
          <section className="credential-row" key={p.id}>
            <div className="issuer-mark" aria-hidden="true">
              {p.issuer
                .split(" ")
                .map((x) => x[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <span className="small muted">
                {p.issuer} · {p.type}
              </span>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <div className="credential-meta">
                <span>{p.price}</span>
                <span>{p.minAge}+ pathway</span>
              </div>
            </div>
            <Button variant="secondary" onClick={() => setSelected(p.id)}>
              View pathway <Icon />
            </Button>
          </section>
        ))}
      </div>
      <section className="section">
        <h2>Your BuidlCamp learning records</h2>
        <p className="muted">
          These printable records describe work completed here. They are issued
          by BuidlCamp and are separate from industry and university
          credentials.
        </p>
        <div className="starter-grid">
          {TRACKS.map((t) => {
            const lessons = QUESTS.filter(
              (q) => q.track === t.id && q.tier === 1,
            );
            const done = lessons.filter(
              (q) => data.lessons[q.id]?.completedAt,
            ).length;
            return (
              <section className="panel starter" key={t.id}>
                <Icon name="award" size={28} />
                <h3>{t.name} foundations</h3>
                <p>
                  {done} of {lessons.length} foundation lessons complete
                </p>
                <Button
                  variant="secondary"
                  disabled={done !== lessons.length}
                  onClick={() => setAward(t.name)}
                >
                  View learning record
                </Button>
              </section>
            );
          })}
        </div>
        {Object.keys(data.legacyAwards).length > 0 && (
          <details className="panel section">
            <summary>
              Earlier BuidlCamp awards ({Object.keys(data.legacyAwards).length})
            </summary>
            <ul>
              {Object.entries(data.legacyAwards).map(([id, date]) => (
                <li key={id}>
                  {id} — {new Date(date).toLocaleDateString()}
                </li>
              ))}
            </ul>
            <p>
              Preserved from your earlier camp. These remain local camp awards.
            </p>
          </details>
        )}
      </section>
      {program && progress && (
        <Modal
          title={program.title}
          onClose={() => {
            setSelected(null);
            setLeaving(false);
          }}
        >
          <p>{program.ageNote}</p>
          <p className="small muted">
            Issuer page checked {program.checked}. Requirements can change.{" "}
            <a href={program.source} target="_blank" rel="noreferrer">
              Read the source
            </a>
            .
          </p>
          {program.steps.map((item) => (
            <CheckRow
              key={item}
              checked={progress.checked.includes(item)}
              onChange={() =>
                setProgress({
                  checked: progress.checked.includes(item)
                    ? progress.checked.filter((v) => v !== item)
                    : [...progress.checked, item],
                  reviewedAt: undefined,
                })
              }
            >
              {item}
            </CheckRow>
          ))}
          <label>
            Issuer record or completion notes
            <textarea
              rows={3}
              maxLength={2000}
              value={progress.evidence}
              onChange={(e) =>
                setProgress({ evidence: e.target.value, reviewedAt: undefined })
              }
              placeholder="Paste the issuer’s record URL, or describe what you completed. This is self-reported until reviewed."
            />
          </label>
          <p className="small muted">
            Status:{" "}
            {progress.reviewedAt
              ? "Reviewed locally by an adult; issuer verification not performed"
              : progress.evidence
                ? "Self-reported; awaiting local review"
                : "In progress"}
          </p>
          <Button variant="secondary" onClick={() => setLeaving(true)}>
            Visit issuer <Icon name="external" />
          </Button>
          {leaving && (
            <div className="notice">
              <p>
                You’re leaving BuidlCamp. Review the issuer’s account, age,
                price, and privacy requirements.{" "}
                {data.age !== "18+" && "Open this with a parent or educator."}
              </p>
              <a
                className="button primary"
                href={program.url}
                target="_blank"
                rel="noreferrer"
              >
                Open issuer website <Icon name="external" />
              </a>
            </div>
          )}
          {progress.evidence.trim() &&
            program.steps.every((step) => progress.checked.includes(step)) && (
              <details className="section">
                <summary>Adult review</summary>
                <AdultGate>
                  <Button
                    onClick={() =>
                      setProgress({ reviewedAt: new Date().toISOString() })
                    }
                  >
                    Record that I reviewed this evidence
                  </Button>
                </AdultGate>
              </details>
            )}
        </Modal>
      )}
      {award && (
        <Modal title="BuidlCamp learning record" onClose={() => setAward(null)}>
          <div className="learning-record">
            <Icon name="award" size={48} />
            <h2>{data.name}</h2>
            <p>completed the BuidlCamp foundation pathway in</p>
            <h3>{award}</h3>
            <p>Recorded {new Date().toLocaleDateString()}</p>
            <p className="small muted">
              Issued by BuidlCamp. This record reflects local lesson completion
              and self-assessed project evidence. It is not a university
              credential or professional certification.
            </p>
          </div>
          <Button className="no-print" onClick={() => window.print()}>
            Print learning record
          </Button>
        </Modal>
      )}
    </>
  );
}
