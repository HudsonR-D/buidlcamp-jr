import CodeEditor from "./CodeEditor";
import { Link, useSearchParams } from "react-router-dom";
import { toggle, download } from "./files";
import { useEffect, useState, useRef } from "react";
import { STARTERS } from "./starters";
import Arcade from "./Arcade";
import { previewDocument } from "./model";
import type { Project } from "./model";
import { useWorkspace } from "./store";
import { Button, CheckRow, Empty, Heading, Icon, Modal, Tabs } from "./ui";
export default function Studio() {
  const { data, update, error } = useWorkspace();
  const [params] = useSearchParams();
  const [tab, setTab] = useState("starters");
  const [activeId, setActiveId] = useState<string | null>(
    params.get("project"),
  );
  const [preview, setPreview] = useState("");
  const frame = useRef<HTMLIFrameElement>(null);
  const [previewErrors, setPreviewErrors] = useState<string[]>([]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.source !== frame.current?.contentWindow ||
        event.data?.kind !== "buidlcamp-preview-error" ||
        typeof event.data.message !== "string"
      )
        return;
      setPreviewErrors((current) =>
        current.length < 20
          ? [...current, event.data.message.slice(0, 300)]
          : current,
      );
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  const requestedProject = params.get("project");
  useEffect(() => {
    if (requestedProject) {
      setActiveId(requestedProject);
      setTab("projects");
      setPreview("");
    }
  }, [requestedProject]);
  const [run, setRun] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const project = data.projects.find((p) => p.id === activeId);
  const starter = STARTERS.find((t) => t.id === project?.templateId);
  const save = (patch: Partial<Project>) =>
    update((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === activeId
          ? { ...p, ...patch, updatedAt: new Date().toISOString() }
          : p,
      ),
    }));
  const open = (p: Project) => {
    setActiveId(p.id);
    setPreview("");
    setTab("projects");
  };
  return (
    <>
      <Heading title="Project studio">
        Change one thing. Run it. See what happens.
      </Heading>
      <Tabs
        options={[
          { id: "starters", label: "Starters" },
          { id: "projects", label: "My projects" },
          { id: "arcade", label: "Arcade" },
        ]}
        value={tab}
        onChange={(v) => {
          setTab(v);
          setActiveId(null);
          setPreview("");
        }}
      />
      {data.projects.length >= 100 && (
        <p className="notice">
          Your workspace holds up to 100 projects. Export and remove an old
          project to make room for another.
        </p>
      )}
      {project ? (
        <section className="studio panel">
          <div className="studio-toolbar">
            <label>
              Project name
              <input
                maxLength={100}
                value={project.name}
                onChange={(e) => save({ name: e.target.value })}
              />
            </label>
            <span className="small muted">
              {error
                ? "Changes need attention — export a backup"
                : "Saved on this device"}
            </span>
            <div className="button-row">
              <Link
                className="button secondary"
                to={`/versions?project=${project.id}`}
              >
                Save a version
              </Link>
              <Button
                variant="secondary"
                onClick={() =>
                  download(
                    `${project.name.replace(/[^a-z0-9 -]/gi, "") || "my-project"}.html`,
                    project.code,
                    "text/html",
                  )
                }
              >
                <Icon name="download" />
                Download
              </Button>
              <Button
                onClick={() => {
                  setPreviewErrors([]);
                  setPreview(project.code);
                  setRun(run + 1);
                }}
              >
                <Icon name="play" />
                Run preview
              </Button>
              {preview && (
                <Button variant="quiet" onClick={() => setPreview("")}>
                  Stop
                </Button>
              )}
            </div>
          </div>
          <div className="editor-grid">
            <div className="editor-pane">
              <div className="pane-heading">
                <strong>Code</strong>
                <span>HTML / CSS / JavaScript</span>
              </div>
              <CodeEditor
                key={project.id}
                value={project.code}
                onChange={(code) => save({ code })}
              />
            </div>
            <div className="editor-pane">
              <div className="pane-heading">
                <strong>Preview</strong>
                <span>Isolated from your workspace</span>
              </div>
              {preview ? (
                <iframe
                  ref={frame}
                  key={run}
                  title="Project preview"
                  sandbox="allow-scripts"
                  referrerPolicy="no-referrer"
                  srcDoc={previewDocument(preview, true)}
                />
              ) : (
                <div className="preview-empty">
                  <Icon name="play" size={34} />
                  <h3>Ready when you are</h3>
                  <p>Press Run preview to try your code.</p>
                </div>
              )}
            </div>
          </div>
          {preview && previewErrors.length > 0 && (
            <div className="notice error" role="status">
              <strong>Something to debug</strong>
              <p>
                Read the first message, change one thing, then run again. Your
                code remains saved.
              </p>
              <ul>
                {previewErrors.map((message, i) => (
                  <li key={i}>{message}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="remix">
            <h2>Make it yours</h2>
            {starter?.remixQuests.map((q, i) => (
              <CheckRow
                key={q.title}
                checked={project.checks.includes(i)}
                onChange={() => save({ checks: toggle(project.checks, i) })}
              >
                <strong>{q.title}</strong>
                <span className="small muted block">{q.hint}</span>
              </CheckRow>
            ))}
            <label>
              What did you change and test?
              <textarea
                rows={3}
                maxLength={10000}
                value={project.reflection}
                onChange={(e) => save({ reflection: e.target.value })}
                placeholder="Explain one change and what happened when you tested it."
              />
            </label>
            <p className="small muted">
              Your draft saves as you type. Preview runs only when you press
              Run. Downloads contain executable code; review them before opening
              or sharing.
            </p>
          </div>
        </section>
      ) : tab === "starters" ? (
        <div className="starter-grid">
          {STARTERS.map((t, i) => (
            <section className="starter panel" key={t.id}>
              <div className={`starter-art tone-${i % 3}`}>
                <Icon name={i === 0 ? "code" : "play"} size={42} />
                <span>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h2>{t.name}</h2>
              <p>{t.tagline}</p>
              <span className="small muted">
                {t.minTier === "Bronze"
                  ? "A good place to start"
                  : "A more involved project"}
              </span>
              <Button
                variant="secondary"
                disabled={data.projects.length >= 100}
                onClick={() => {
                  const p: Project = {
                    id: crypto.randomUUID(),
                    name: `My ${t.name.toLowerCase()}`,
                    templateId: t.id,
                    code: t.code,
                    updatedAt: new Date().toISOString(),
                    reflection: "",
                    checks: [],
                  };
                  update((d) => ({ ...d, projects: [p, ...d.projects] }));
                  open(p);
                }}
              >
                Make a project <Icon />
              </Button>
            </section>
          ))}
        </div>
      ) : tab === "projects" ? (
        data.projects.length ? (
          <div className="lesson-list">
            {data.projects.map((p) => (
              <div className="list-row" key={p.id}>
                <div>
                  <h3>{p.name || "Untitled project"}</h3>
                  <p>Saved {new Date(p.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="button-row">
                  <Button variant="secondary" onClick={() => open(p)}>
                    Open project
                  </Button>
                  <Button variant="quiet" onClick={() => setDeleting(p.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty title="Your ideas belong here">
            Choose a starter to create your first project. You’ll own the code
            and can download it anytime.
          </Empty>
        )
      ) : (
        <Arcade />
      )}
      {deleting && (
        <Modal title="Delete this project?" onClose={() => setDeleting(null)}>
          <p>
            Export a copy first if you want to keep it. This removes the current
            draft. Previously saved local checkpoints and GitHub versions remain
            until you remove them separately.
          </p>
          <div className="button-row">
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Keep project
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                update((d) => ({
                  ...d,
                  projects: d.projects.filter((p) => p.id !== deleting),
                }));
                setDeleting(null);
              }}
            >
              Delete project
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
