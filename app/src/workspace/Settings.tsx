import { download, readFile } from "./files";
import { setTheme, useTheme } from "./theme";
import type { ThemePreference } from "./theme";
import { Link } from "react-router-dom";
import Feedback from "./Feedback";
import { clearHistory } from "./history";
import { api, integrationStatus } from "./integration";
import { exportSubmission } from "./submissions";
import { useState } from "react";
import { QUESTS } from "../data/quests";
import { AGES, LEVELS, parseAssignment, parseBackup } from "./model";
import type { AgeBand, Level, WorkspaceData } from "./model";
import { exportBackup, exportRecovery, useWorkspace } from "./store";
import { AdultGate, Button, CheckRow, Heading, Modal, Notice } from "./ui";
export default function Settings() {
  const [theme] = useTheme();
  const { data, update, replace, reset, lock } = useWorkspace();
  const [notice, setNotice] = useState("");
  const [restore, setRestore] = useState<WorkspaceData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState("");
  return (
    <>
      <Heading title="Your workspace, your choices">
        Keep your learning comfortable, portable, and private.
      </Heading>
      <Feedback />
      <div className="settings-grid">
        <section className="panel">
          <h2>Learning preferences</h2>
          <label>
            Appearance
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemePreference)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label>
            Nickname
            <input
              maxLength={80}
              value={data.name}
              onChange={(e) => update((d) => ({ ...d, name: e.target.value }))}
            />
          </label>
          <label>
            Reading and learning style
            <select
              value={data.level}
              onChange={(e) =>
                update((d) => ({ ...d, level: e.target.value as Level }))
              }
            >
              {Object.entries(LEVELS).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <p className="small muted">
            Reading style is separate from age. Guided offers shorter reading
            steps; every learner can explore every lesson.
          </p>
          <CheckRow
            checked={data.largeText}
            onChange={() => update((d) => ({ ...d, largeText: !d.largeText }))}
          >
            Use larger reading text
          </CheckRow>
        </section>
        <section className="panel">
          <h2>Take your work with you</h2>
          <p>
            Your full workspace saves on this device. Export a backup before
            clearing browser data or changing devices.{" "}
            <Link to="/versions">Project versions</Link> offers optional private
            GitHub checkpoints for eligible accounts.
          </p>
          <div className="button-row">
            <Button
              onClick={() => download("buidlcamp-backup.json", exportBackup())}
            >
              Export full backup
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                download("buidlcamp-portfolio.json", exportSubmission())
              }
            >
              Export learner portfolio
            </Button>
          </div>
          <p className="small muted">
            Backups contain local learning data and educator reviews. Portfolios
            contain only nickname, lesson evidence, and projects. Neither
            includes API keys or your PIN.
          </p>
        </section>
        <section className="panel">
          <h2>Import an assignment</h2>
          <p>
            Open the assignment file your educator shared. Your other work stays
            in place.
          </p>
          <label className="file-label">
            Choose assignment file
            <input
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                try {
                  if (data.assignments.length >= 100)
                    throw new Error(
                      "Remove an assignment in Educator desk before importing another.",
                    );
                  const assignment = parseAssignment(
                    await readFile(e.target.files?.[0]),
                  );
                  if (
                    assignment.lessonIds.some(
                      (id) => !QUESTS.some((q) => q.id === id),
                    )
                  )
                    throw new Error(
                      "This assignment needs lessons not available in this version.",
                    );
                  update((d) => ({
                    ...d,
                    assignments: [
                      ...d.assignments.filter((a) => a.id !== assignment.id),
                      assignment,
                    ],
                  }));
                  setNotice("Assignment imported. Find it on Home.");
                } catch (err) {
                  setNotice(
                    err instanceof Error
                      ? err.message
                      : "Could not import assignment.",
                  );
                }
                e.target.value = "";
              }}
            />
          </label>
        </section>
        <section className="panel">
          <h2>On your iPad or desktop</h2>
          <p>
            On iPad Safari, use Share → Add to Home Screen. On supported desktop
            browsers, use the install option in the address bar.
          </p>
          <p>
            The production app caches its lessons and starters after the first
            successful online load. Outside courses, AI providers, and the API
            companion need a connection. Export files to move progress between
            devices.
          </p>
          <p className="small muted">
            Use a personal browser profile on shared devices. This local
            workspace does not isolate multiple signed-in learners.
          </p>
        </section>
      </div>
      {notice && <Notice>{notice}</Notice>}
      <section className="section">
        <h2>Grown-up settings</h2>
        <AdultGate>
          <div className="panel">
            <div className="section-title">
              <h3>Age, restore, and data controls</h3>
              <Button variant="quiet" onClick={lock}>
                Lock settings
              </Button>
            </div>
            <label>
              Age group
              <select
                value={data.age}
                onChange={(e) =>
                  update((d) => ({ ...d, age: e.target.value as AgeBand }))
                }
              >
                {AGES.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <p className="small muted">
              This guides links and age notes. It is not identity or
              parental-consent verification. A school or family is responsible
              for checking provider eligibility.
            </p>
            <label className="file-label">
              Restore workspace backup
              <input
                type="file"
                accept=".json,application/json"
                onChange={async (e) => {
                  try {
                    setRestore(
                      parseBackup(await readFile(e.target.files?.[0])),
                    );
                  } catch (err) {
                    setNotice(
                      err instanceof Error
                        ? err.message
                        : "Could not read backup.",
                    );
                  }
                  e.target.value = "";
                }}
              />
            </label>
            <details>
              <summary>Earlier browser records</summary>
              <p className="small muted">
                Download original browser records before clearing an older
                workspace. This recovery file can contain an old plaintext PIN;
                keep it private. It is not a standard workspace backup.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  try {
                    download(
                      "buidlcamp-original-records.json",
                      exportRecovery(),
                    );
                  } catch {
                    setNotice(
                      "The browser blocked access to the original records.",
                    );
                  }
                }}
              >
                Download original records
              </Button>
            </details>
            <Button
              variant="danger"
              onClick={() => {
                setDeleting(true);
                setConfirm("");
              }}
            >
              Delete this workspace
            </Button>
          </div>
        </AdultGate>
      </section>
      {restore && (
        <Modal title="Replace this workspace?" onClose={() => setRestore(null)}>
          <p>
            Restore {restore.name}’s backup with {restore.projects.length}{" "}
            projects and {Object.keys(restore.lessons).length} lesson records.
            This replaces current learning and educator data. Your current PIN
            stays on this device.
          </p>
          <div className="button-row">
            <Button
              variant="secondary"
              onClick={() =>
                download("buidlcamp-before-restore.json", exportBackup())
              }
            >
              Back up current work
            </Button>
            <Button
              onClick={() => {
                replace(restore);
                setRestore(null);
                setNotice("Backup restored.");
              }}
            >
              Replace with backup
            </Button>
            <Button variant="quiet" onClick={() => setRestore(null)}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}
      {deleting && (
        <Modal
          title="Delete all local learning data?"
          onClose={() => setDeleting(false)}
        >
          <p>
            This removes this workspace, its local portfolios, and older
            BuidlCamp browser records, including local checkpoint history. The
            GitHub session will be disconnected when reachable. Downloaded files
            and GitHub commits remain outside this deletion.
          </p>
          <label>
            Type DELETE to continue
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          <div className="button-row">
            <Button variant="secondary" onClick={() => setDeleting(false)}>
              Keep my work
            </Button>
            <Button
              variant="danger"
              disabled={confirm !== "DELETE"}
              onClick={async () => {
                try {
                  await clearHistory();
                  const s = await integrationStatus();
                  if (s.authenticated)
                    await api("github/disconnect", {}, s.csrf);
                  reset();
                } catch {
                  setDeleting(false);
                  setNotice(
                    "Could not complete deletion. Reconnect to disconnect GitHub, then retry. Current workspace data has been kept.",
                  );
                }
              }}
            >
              Delete all local data
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
