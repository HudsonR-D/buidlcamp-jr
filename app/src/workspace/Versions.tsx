import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { QUESTS } from "../data/quests";
import {
  availableMilestones,
  checkpointFiles,
  compareLines,
  makeCheckpoint,
  parseCheckpoint,
} from "./checkpoints";
import type { ProjectCheckpoint, RepositoryBinding } from "./checkpoints";
import { clearHistory, localHistory, saveLocalCheckpoint } from "./history";
import { api, integrationStatus, IntegrationError } from "./integration";
import type { IntegrationStatus } from "./integration";
import { useWorkspace } from "./store";
import { download, readFile, toggle } from "./files";
import { AdultGate, Button, CheckRow, Heading, Modal, Notice } from "./ui";
export default function Versions() {
  const { data, update } = useWorkspace();
  const [params] = useSearchParams();
  const [projectId, setProjectId] = useState(
    params.get("project") ?? data.projects[0]?.id ?? "",
  );
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [status, setStatus] = useState<IntegrationStatus>({
    configured: false,
    authenticated: false,
  });
  const [eligible, setEligible] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [notice, setNotice] = useState(
    (params.get("connection_error") ?? "").slice(0, 300),
  );
  const [busy, setBusy] = useState(false);
  const [records, setRecords] = useState<ProjectCheckpoint[]>([]);
  const [repositories, setRepositories] = useState<RepositoryBinding[]>([]);
  const [repoId, setRepoId] = useState(0);
  const [head, setHead] = useState("");
  const [remoteProjects, setRemoteProjects] = useState<{ id: string }[]>([]);
  const [remoteId, setRemoteId] = useState("");
  const [commits, setCommits] = useState<
    { sha: string; message: string; date: string }[]
  >([]);
  const [preview, setPreview] = useState<ProjectCheckpoint | null>(null);
  const [candidate, setCandidate] = useState<ProjectCheckpoint | null>(null);
  const [clear, setClear] = useState(false);
  const [conflict, setConflict] = useState<{
    repo: number;
    checkpoint: ProjectCheckpoint;
  } | null>(null);
  const [resolution, setResolution] = useState<{
    head: string;
    remote: ProjectCheckpoint | null;
  } | null>(null);
  const project = data.projects.find((p) => p.id === projectId);
  const milestones = availableMilestones(
    data,
    Object.fromEntries(QUESTS.map((q) => [q.id, q.title])),
  );
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setNotice(
        e instanceof Error
          ? e.message
          : "Could not complete that action. Your work is safe.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function refreshLocal() {
    setRecords(await localHistory(projectId));
  }
  useEffect(() => {
    let alive = true;
    integrationStatus().then((s) => {
      if (alive) setStatus(s);
    });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    let alive = true;
    localHistory(projectId)
      .then((r) => {
        if (alive) setRecords(r);
      })
      .catch((e) => {
        if (alive) setNotice(e.message);
      });
    setSelected([]);
    setPreview(null);
    return () => {
      alive = false;
    };
  }, [projectId]);
  const compare =
    candidate && project
      ? compareLines(project.code, candidate.project.code)
      : null;
  async function fetchProjects(id: number) {
    const result = await api<{ head: string; projects: { id: string }[] }>(
      `github/projects?repo=${id}`,
    );
    setHead(result.head);
    setRemoteProjects(result.projects);
    setRemoteId(result.projects[0]?.id ?? "");
    setCommits([]);
  }
  const connect = (role: "adult" | "learner") =>
    run(async () => {
      const result = await api<{ url: string }>("github/connect", {
        eligible: true,
        role,
      });
      location.assign(result.url);
    });
  return (
    <>
      <Heading title="Save a version. Keep your story.">
        A checkpoint records what changed and why. Your everyday edits still
        save on this device.
      </Heading>
      {notice && !preview && <Notice>{notice}</Notice>}
      {conflict && (
        <section className="panel section">
          <h2>Resolve a repository conflict</h2>
          <p>
            Your checkpoint is kept locally. Load the latest repository version,
            compare both sources, and choose which draft to review for the next
            commit.
          </p>
          <Button
            disabled={busy}
            onClick={() =>
              run(async () => {
                const latest = await api<{
                  head: string;
                  projects: { id: string }[];
                }>(`github/projects?repo=${conflict.repo}`);
                const remote = latest.projects.some(
                  (p) => p.id === conflict.checkpoint.project.id,
                )
                  ? await api<ProjectCheckpoint>(
                      `github/checkpoint?repo=${conflict.repo}&project=${conflict.checkpoint.project.id}&sha=${latest.head}`,
                    )
                  : null;
                setResolution({ head: latest.head, remote });
              })
            }
          >
            Load latest version to resolve conflict
          </Button>
        </section>
      )}
      <section className="panel section">
        <h2>Your project checkpoints</h2>
        <label>
          Project
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">Choose a project</option>
            {data.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        {!project && (
          <p>
            <Link to="/forge">Make a project in the studio</Link>, or import a
            checkpoint below.
          </p>
        )}
        {project && (
          <>
            <label>
              What changed in this version?
              <input
                maxLength={200}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="For example: make the jump easier to control"
              />
            </label>
            <details>
              <summary>Choose milestones to include</summary>
              <p>
                Only checked milestone explanations travel with this version.
                Review them for names, school details, or other private
                information.
              </p>
              {milestones.length ? (
                milestones.map((m, i) => (
                  <CheckRow
                    key={m.id}
                    checked={selected.includes(i)}
                    onChange={() => setSelected(toggle(selected, i))}
                  >
                    {m.title}
                    <span className="small muted block">{m.evidence}</span>
                  </CheckRow>
                ))
              ) : (
                <p>Completed lessons will appear here.</p>
              )}
            </details>
            <Button
              disabled={!message.trim() || busy}
              onClick={() =>
                run(async () => {
                  const c = makeCheckpoint(
                    project,
                    message,
                    selected.map((i) => milestones[i]),
                  );
                  setReviewed(false);
                  setPreview(c);
                })
              }
            >
              Review checkpoint
            </Button>
          </>
        )}
        <label className="file-label">
          Import checkpoint file
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              void run(async () =>
                setCandidate(parseCheckpoint(JSON.parse(await readFile(file)))),
              );
              e.target.value = "";
            }}
          />
        </label>
        <p className="small muted">
          Local history keeps up to 20 versions per project within 50 MB. Older
          versions are removed first when needed. Download versions you want to
          keep permanently.
        </p>
        {records.map((c) => (
          <div className="list-row" key={c.id}>
            <div>
              <h3>{c.message}</h3>
              <p>{new Date(c.createdAt).toLocaleString()}</p>
            </div>
            <div className="button-row">
              <Button variant="secondary" onClick={() => setCandidate(c)}>
                Compare or restore
              </Button>
              <Button
                variant="quiet"
                onClick={() =>
                  download(
                    "buidlcamp-checkpoint.json",
                    JSON.stringify(c, null, 2),
                  )
                }
              >
                Download version
              </Button>
            </div>
          </div>
        ))}
        {!!records.length && (
          <Button variant="quiet" onClick={() => setClear(true)}>
            Clear this project’s local history
          </Button>
        )}
      </section>
      <section className="panel section">
        <h2>A private home on GitHub</h2>
        <p>
          GitHub can keep reviewed projects and milestones. Your full learning
          workspace and educator records stay on this device. A private
          repository still shares data with GitHub and anyone you invite.
        </p>
        {data.age === "10–12" ? (
          <Notice>
            Your learning path uses local checkpoints. GitHub requires users to
            be at least 13, or older in some countries. An adult can separately
            upload your reviewed exports using their own account; never share a
            login.{" "}
            <Link to="/academy?track=build-together">Try Build Together</Link>.
          </Notice>
        ) : (
          <>
            {!status.configured ? (
              <Notice>
                GitHub connections are unavailable on this installation. Local
                history and exports remain available.
              </Notice>
            ) : !status.authenticated ? (
              <>
                <CheckRow
                  checked={eligible}
                  onChange={() => setEligible(!eligible)}
                >
                  I meet GitHub’s minimum age in my country, use my own account,
                  and have permission where required.
                </CheckRow>
                <Button
                  disabled={!eligible || busy}
                  onClick={() => connect("learner")}
                >
                  Connect GitHub
                </Button>
                <details>
                  <summary>Adult educator connection</summary>
                  <AdultGate>
                    <p>
                      Adults can connect their own account for repository saves
                      and optional API demonstrations. This acknowledgment does
                      not verify age or legal consent.
                    </p>
                    <Button
                      disabled={!eligible || busy}
                      onClick={() => connect("adult")}
                    >
                      I am 18+ · connect my account
                    </Button>
                  </AdultGate>
                </details>
              </>
            ) : (
              <>
                <p>
                  Connected as <strong>{status.login}</strong> ·{" "}
                  {status.role === "adult"
                    ? "adult educator session"
                    : "learner session"}
                </p>
                <div className="button-row">
                  <a
                    className="button secondary"
                    href="https://github.com/new"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Create a private repository
                  </a>
                  {status.installUrl && (
                    <a
                      className="button secondary"
                      href={status.installUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Select repositories for the app
                    </a>
                  )}
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        const r = await api<{
                          repositories: RepositoryBinding[];
                        }>("github/repos");
                        setRepositories(r.repositories);
                        if (!r.repositories.length)
                          setNotice(
                            "No private writable repositories found. Create one with a README, then select only that repository when installing the app.",
                          );
                      })
                    }
                  >
                    Load my private repositories
                  </Button>
                  <Button
                    variant="quiet"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await api("github/disconnect", {}, status.csrf);
                        setStatus({ configured: true, authenticated: false });
                        setRepositories([]);
                        setRepoId(0);
                        setHead("");
                        setRemoteProjects([]);
                        setCommits([]);
                        setNotice(
                          "Disconnected. Your GitHub repository and local work remain yours.",
                        );
                      })
                    }
                  >
                    Disconnect GitHub
                  </Button>
                </div>
                <p className="small muted">
                  Choose Private and add a README when creating your repository.
                  Install the app for selected repositories only. Cloud saves
                  pause if visibility changes to public.
                </p>
                {!!repositories.length && (
                  <label>
                    Private repository
                    <select
                      value={repoId}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        setRepoId(id);
                        setHead("");
                        setCommits([]);
                        setRemoteProjects([]);
                        if (id) void run(() => fetchProjects(id));
                      }}
                    >
                      <option value={0}>Choose a repository</option>
                      {repositories.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.owner}/{r.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {!!repoId && (
                  <>
                    <Button
                      variant="quiet"
                      disabled={busy}
                      onClick={() => run(() => fetchProjects(repoId))}
                    >
                      Refresh repository
                    </Button>
                    <p className="small muted">
                      Latest revision: {head ? head.slice(0, 10) : "not loaded"}
                      . Review a checkpoint above to save it here.
                    </p>
                  </>
                )}
                {!!remoteProjects.length && (
                  <>
                    <label>
                      Project stored on GitHub
                      <select
                        value={remoteId}
                        onChange={(e) => {
                          setRemoteId(e.target.value);
                          setCommits([]);
                        }}
                      >
                        {remoteProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {data.projects.find((x) => x.id === p.id)?.name ??
                              p.id}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          const r = await api<{ history: typeof commits }>(
                            `github/history?repo=${repoId}&project=${remoteId}`,
                          );
                          setCommits(r.history);
                        })
                      }
                    >
                      Read version history
                    </Button>
                    {commits.map((c) => (
                      <div className="list-row" key={c.sha}>
                        <div>
                          <h3>{c.message}</h3>
                          <p>
                            {new Date(c.date).toLocaleString()} ·{" "}
                            {c.sha.slice(0, 8)}
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          disabled={busy}
                          onClick={() =>
                            run(async () =>
                              setCandidate(
                                await api<ProjectCheckpoint>(
                                  `github/checkpoint?repo=${repoId}&project=${remoteId}&sha=${c.sha}`,
                                ),
                              ),
                            )
                          }
                        >
                          Review this version
                        </Button>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}
        <p>
          <a
            href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
            target="_blank"
            rel="noreferrer"
          >
            GitHub’s account requirements
          </a>
        </p>
      </section>
      {preview && (
        <Modal
          title="Review this checkpoint"
          onClose={() => {
            if (!busy) setPreview(null);
          }}
        >
          {notice && <Notice>{notice}</Notice>}
          <p>
            <strong>{preview.message}</strong>
          </p>
          <p>
            Project source, name, reflection, and {preview.milestones.length}{" "}
            selected milestones. Review all content below before uploading.
            Recognizable credential patterns are checked; this cannot find every
            secret.
          </p>
          <details>
            <summary>Project source and metadata</summary>
            <pre className="review-code">
              {JSON.stringify(preview, null, 2)}
            </pre>
          </details>
          <CheckRow checked={reviewed} onChange={() => setReviewed(!reviewed)}>
            I have reviewed this content for credentials, identifying details,
            and permission to share it.
          </CheckRow>
          <div className="button-row">
            <Button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const removed = await saveLocalCheckpoint(preview);
                  await refreshLocal();
                  setNotice(
                    `Checkpoint saved on this device.${removed ? ` ${removed} older versions were removed by the history limits.` : ""}`,
                  );
                  setPreview(null);
                })
              }
            >
              Save on this device
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                download(
                  "buidlcamp-checkpoint.json",
                  JSON.stringify(preview, null, 2),
                )
              }
            >
              Download checkpoint
            </Button>
            {data.age !== "10–12" &&
              status.authenticated &&
              !!repoId &&
              !!head && (
                <Button
                  disabled={busy || !reviewed || !!conflict}
                  onClick={() =>
                    run(async () => {
                      checkpointFiles(preview);
                      await saveLocalCheckpoint(preview);
                      let saved: { head: string };
                      try {
                        saved = await api<{ head: string }>(
                          "github/checkpoint",
                          { repo: repoId, base: head, checkpoint: preview },
                          status.csrf,
                        );
                      } catch (error) {
                        if (
                          error instanceof IntegrationError &&
                          error.status === 409
                        ) {
                          setConflict({ repo: repoId, checkpoint: preview });
                          setResolution(null);
                          setPreview(null);
                          await refreshLocal();
                        }
                        throw error;
                      }
                      setHead(saved.head);
                      await refreshLocal();
                      await fetchProjects(repoId);
                      setNotice("Version saved to your private repository.");
                      setPreview(null);
                    })
                  }
                >
                  Save version to GitHub
                </Button>
              )}
          </div>
        </Modal>
      )}
      {candidate && (
        <Modal
          title="Compare and keep a version"
          onClose={() => setCandidate(null)}
        >
          <h3>{candidate.project.name}</h3>
          <p>{candidate.message}</p>
          {compare && (
            <p>
              {compare.identical
                ? "The project source is unchanged."
                : `${compare.removed.length} lines in the changed section will be replaced by ${compare.added.length} lines.`}
            </p>
          )}
          <div className="form-grid">
            <div>
              <h3>Current source</h3>
              <pre className="review-code">
                {project?.code ?? "No local project selected"}
              </pre>
            </div>
            <div>
              <h3>Selected version</h3>
              <pre className="review-code">{candidate.project.code}</pre>
            </div>
          </div>
          <p>
            Restoration creates a new local checkpoint. Saving it to GitHub is a
            separate reviewed commit. Existing code is kept in local history
            before replacement.
          </p>
          <Button
            disabled={busy || data.projects.length >= 100}
            onClick={() =>
              run(async () => {
                const exists = data.projects.some(
                  (p) => p.id === candidate.project.id,
                );
                const id = exists ? crypto.randomUUID() : candidate.project.id;
                const p = {
                  ...candidate.project,
                  id,
                  name: exists
                    ? `${candidate.project.name} (imported)`.slice(0, 100)
                    : candidate.project.name,
                  updatedAt: new Date().toISOString(),
                };
                const c = makeCheckpoint(
                  p,
                  `Imported: ${candidate.message}`.slice(0, 200),
                  candidate.milestones,
                );
                await saveLocalCheckpoint(c);
                update((d) => ({ ...d, projects: [p, ...d.projects] }));
                if (
                  !useWorkspace
                    .getState()
                    .data.projects.some((p) => p.id === id)
                )
                  throw new Error(
                    "The workspace is full. Your imported checkpoint remains in local history; export work before making space.",
                  );
                setProjectId(id);
                setCandidate(null);
                setNotice(
                  "Project imported. Open it in the studio when ready; its code has not run.",
                );
              })
            }
          >
            {data.projects.some((p) => p.id === candidate.project.id)
              ? "Import as a separate project"
              : "Import this project"}
          </Button>
          {project && candidate.project.id === project.id && (
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await saveLocalCheckpoint(
                    makeCheckpoint(
                      project,
                      "Before restoring an earlier version",
                    ),
                  );
                  const restored = {
                    ...candidate.project,
                    updatedAt: new Date().toISOString(),
                  };
                  await saveLocalCheckpoint(
                    makeCheckpoint(
                      restored,
                      `Restored: ${candidate.message}`.slice(0, 200),
                      candidate.milestones,
                    ),
                  );
                  update((d) => ({
                    ...d,
                    projects: d.projects.map((p) =>
                      p.id === project.id ? restored : p,
                    ),
                  }));
                  if (
                    useWorkspace
                      .getState()
                      .data.projects.find((p) => p.id === project.id)?.code !==
                    restored.code
                  )
                    throw new Error(
                      "The workspace is full. Both versions remain in local history. Export work before making space.",
                    );
                  await refreshLocal();
                  setCandidate(null);
                  setNotice(
                    "Restored locally with a new checkpoint. Review and save a new GitHub version when ready.",
                  );
                })
              }
            >
              Restore this project locally
            </Button>
          )}
        </Modal>
      )}
      {resolution && conflict && (
        <Modal
          title="Reconcile both versions"
          onClose={() => setResolution(null)}
        >
          <p>
            Repository revision {resolution.head.slice(0, 10)}. Your original
            checkpoint remains in local history. No commit is written by these
            choices.
          </p>
          <div className="form-grid">
            <div>
              <h3>Your checkpoint</h3>
              <pre className="review-code">
                {conflict.checkpoint.project.code}
              </pre>
            </div>
            <div>
              <h3>Latest repository source</h3>
              <pre className="review-code">
                {resolution.remote?.project.code ??
                  "This project is not in the latest repository revision. Other repository files changed."}
              </pre>
            </div>
          </div>
          <Button
            disabled={busy}
            onClick={() => {
              setHead(resolution.head);
              setResolution(null);
              setConflict(null);
              setNotice(
                "Comparison acknowledged. Edit your draft if needed, then review a new checkpoint before saving.",
              );
            }}
          >
            Keep my local draft for a new reviewed save
          </Button>
          {resolution.remote && (
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const remote = resolution.remote!;
                  const current = data.projects.find(
                    (p) => p.id === remote.project.id,
                  );
                  if (!current)
                    throw new Error(
                      "Import the repository project from its history first.",
                    );
                  await saveLocalCheckpoint(
                    makeCheckpoint(
                      current,
                      "Before resolving repository conflict",
                    ),
                  );
                  await saveLocalCheckpoint(
                    makeCheckpoint(
                      remote.project,
                      "Used repository version to resolve conflict",
                      remote.milestones,
                    ),
                  );
                  update((d) => ({
                    ...d,
                    projects: d.projects.map((p) =>
                      p.id === remote.project.id ? remote.project : p,
                    ),
                  }));
                  if (
                    useWorkspace
                      .getState()
                      .data.projects.find((p) => p.id === remote.project.id)
                      ?.code !== remote.project.code
                  )
                    throw new Error(
                      "The workspace is full. Both versions remain in checkpoint history.",
                    );
                  setHead(resolution.head);
                  setResolution(null);
                  setConflict(null);
                  await refreshLocal();
                  setNotice(
                    "Repository version kept locally. Review a new checkpoint to commit further changes.",
                  );
                })
              }
            >
              Use repository version locally
            </Button>
          )}
        </Modal>
      )}
      {clear && (
        <Modal
          title="Clear local checkpoint history?"
          onClose={() => setClear(false)}
        >
          <p>
            Download any versions you want first. This removes local versions
            for the selected project. Its current code and GitHub commits remain
            available.
          </p>
          <Button
            variant="danger"
            onClick={() =>
              run(async () => {
                await clearHistory(projectId);
                await refreshLocal();
                setClear(false);
              })
            }
          >
            Clear local history
          </Button>
        </Modal>
      )}
    </>
  );
}
