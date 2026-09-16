import { lazy, Suspense, useEffect, useState } from "react";
import {
  HashRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AGES, LEVELS, parseBackup } from "./model";
import type { AgeBand, Level } from "./model";
import { exportRecovery, logMinute, useWorkspace } from "./store";
import { download, readFile } from "./files";
import { Button, Heading, Icon, Notice } from "./ui";
import Home from "./Home";
import "./theme";
const Learning = lazy(() => import("./Learning"));
const Studio = lazy(() => import("./Studio"));
const Practice = lazy(() => import("./Practice"));
const Credentials = lazy(() => import("./Credentials"));
const Educator = lazy(() => import("./Educator"));
const Settings = lazy(() => import("./Settings"));
const Versions = lazy(() => import("./Versions"));
const NAV = [
  ["/", "home", "Home"],
  ["/academy", "book", "Learning paths"],
  ["/forge", "folder", "Project studio"],
  ["/dojo", "brain", "AI practice"],
  ["/certs", "award", "Credentials"],
  ["/versions", "folder", "Project versions"],
  ["/educator", "people", "Educator desk"],
  ["/settings", "settings", "Settings"],
];
function Setup() {
  const update = useWorkspace((s) => s.update);
  const [name, setName] = useState("");
  const [age, setAge] = useState<AgeBand>("10–12");
  const [level, setLevel] = useState<Level>("junior");
  return (
    <div className="setup">
      <div className="brand">
        <Icon name="code" size={34} />
        BuidlCamp
      </div>
      <div className="setup-body">
        <span className="setup-number">01 / YOUR WORKSPACE</span>
        <h1>
          A place to learn.
          <br />A space to build.
        </h1>
        <p>
          Coding and AI, one small project at a time.
          <br />
          For curious learners ages 10 and up.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update((d) => ({
              ...d,
              onboarded: true,
              name: name.trim() || "Learner",
              age,
              level,
            }));
          }}
        >
          <label>
            What should we call you?
            <input
              maxLength={80}
              placeholder="A nickname is perfect"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className="form-grid">
            <label>
              Age group
              <select
                value={age}
                onChange={(e) => setAge(e.target.value as AgeBand)}
              >
                {AGES.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <label>
              Learning style
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Level)}
              >
                {Object.entries(LEVELS).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="small muted">
            Guided starts with shorter reading steps. All levels can explore
            every lesson. Under 18? Set up with a parent or educator.
          </p>
          <Button type="submit">
            Create my workspace <Icon />
          </Button>
        </form>
        <p className="small muted">
          No account needed. Your work stays in this browser. Export a backup to
          take it to another device.
        </p>
      </div>
      <div className="setup-art" aria-hidden="true">
        <div className="code-sheet">
          <span>// start with curiosity</span>
          <pre>{"learn();\nbuild();\ntryAgain();"}</pre>
          <div className="process">
            <i /> <i /> <i /> <i />
          </div>
          <p>idea → plan → build → test</p>
        </div>
      </div>
    </div>
  );
}
function Shell() {
  const { data, error, lock } = useWorkspace();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => {
    setNavOpen(false);
    document.title = `${NAV.find((n) => n[0] === location.pathname)?.[2] ?? "Learn"} · BuidlCamp`;
    document.getElementById("content")?.focus();
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    let lastActive = Date.now();
    const activity = () => {
      lastActive = Date.now();
    };
    const visibility = () => {
      if (document.hidden) lock();
    };
    window.addEventListener("pointerdown", activity);
    window.addEventListener("keydown", activity);
    document.addEventListener("visibilitychange", visibility);
    const id = setInterval(() => {
      if (!document.hidden && Date.now() - lastActive < 120000) logMinute();
    }, 60000);
    return () => {
      clearInterval(id);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("keydown", activity);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [lock]);
  return (
    <div className={`workspace ${data.largeText ? "large-text" : ""}`}>
      <a
        className="skip-link"
        href="#content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("content")?.focus();
        }}
      >
        Skip to content
      </a>
      <aside className={`sidebar no-print ${navOpen ? "open" : ""}`}>
        <NavLink className="brand" to="/">
          <Icon name="code" size={34} />
          BuidlCamp
        </NavLink>
        <nav aria-label="Main navigation">
          {NAV.map(([url, icon, label], i) => (
            <NavLink
              className={({ isActive }) =>
                `${isActive ? "active" : ""} ${i === 6 ? "nav-divider" : ""}`
              }
              key={url}
              to={url}
              end={url === "/"}
            >
              <Icon name={icon} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <Icon name="device" size={18} />
          Saved on this device <a href="./privacy.html">Privacy</a>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar no-print">
          <div>
            <Button
              variant="quiet"
              className="menu-button"
              aria-label="Toggle navigation"
              aria-expanded={navOpen}
              onClick={() => setNavOpen(!navOpen)}
            >
              <Icon name="menu" />
            </Button>
            <span>Your workspace</span>
          </div>
          <NavLink to="/settings">
            {LEVELS[data.level]} <span aria-hidden="true">·</span> Ages{" "}
            {data.age}
          </NavLink>
        </header>
        <main id="content" tabIndex={-1}>
          {error && <Notice error>{error}</Notice>}
          <Suspense fallback={<p role="status">Opening your workspace…</p>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/academy" element={<Learning />} />
              <Route path="/forge" element={<Studio />} />
              <Route path="/dojo" element={<Practice />} />
              <Route path="/certs" element={<Credentials />} />
              <Route path="/educator" element={<Educator />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/versions" element={<Versions />} />
              <Route
                path="/parent/*"
                element={<Navigate to="/educator" replace />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
function Recovery() {
  const { error, replace, reset } = useWorkspace();
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  return (
    <main className="gate">
      <Heading title="Let’s protect your saved work">
        Your saved workspace could not be opened.
      </Heading>
      <Notice error>{error}</Notice>
      <p>
        Saving is paused so the original data is preserved. Download a recovery
        file before replacing or resetting anything. This file may contain an
        older local PIN; keep it private.
      </p>
      <Button
        onClick={() => {
          try {
            download("buidlcamp-recovery.json", exportRecovery());
          } catch {
            setMessage(
              "The browser blocked access to stored data. Check its storage permissions.",
            );
          }
        }}
      >
        Download original data
      </Button>
      <label>
        Restore a valid workspace backup
        <input
          type="file"
          accept=".json,application/json"
          onChange={async (e) => {
            try {
              const restored = parseBackup(await readFile(e.target.files?.[0]));
              if (confirmation !== "REPLACE")
                throw new Error("Type REPLACE below before choosing a backup.");
              replace(restored);
            } catch (err) {
              setMessage(
                err instanceof Error
                  ? err.message
                  : "Could not restore backup.",
              );
            }
            e.target.value = "";
          }}
        />
      </label>
      <label>
        Type REPLACE to allow restoration, or DELETE to start fresh
        <input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />
      </label>
      <Button
        variant="danger"
        disabled={confirmation !== "DELETE"}
        onClick={reset}
      >
        Delete unreadable data and start fresh
      </Button>
      {message && <Notice>{message}</Notice>}
    </main>
  );
}
export default function Workspace() {
  const { data, recovery } = useWorkspace();
  return (
    <HashRouter>
      {recovery ? <Recovery /> : data.onboarded ? <Shell /> : <Setup />}
    </HashRouter>
  );
}
