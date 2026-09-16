import { Link } from "react-router-dom";
import { parseFeedback } from "./model";
import { useWorkspace } from "./store";
import { readFile } from "./files";
import { useState } from "react";
import { Button, Notice } from "./ui";
export default function Feedback() {
  const { data, update } = useWorkspace(),
    [notice, setNotice] = useState("");
  return (
    <section className="panel section">
      <h2>Feedback and your next revision</h2>
      <p>
        Import feedback returned by your educator. Files are local records, not
        authenticated grades. Only the workspace that exported the submission
        can match the feedback.
      </p>
      <label>
        Import educator feedback
        <input
          type="file"
          accept=".json,application/json"
          onChange={async (e) => {
            try {
              const feedback = parseFeedback(
                await readFile(e.target.files?.[0]),
                data.submissions,
              );
              if (
                data.feedback.length >= 100 &&
                !data.feedback.some((f) => f.id === feedback.id)
              )
                throw new Error("Remove an older feedback record first.");
              update((d) => ({
                ...d,
                feedback: [
                  feedback,
                  ...d.feedback.filter((f) => f.id !== feedback.id),
                ],
              }));
              setNotice(
                "Feedback matched to your submission. Choose one change to try.",
              );
            } catch (err) {
              setNotice(
                err instanceof Error
                  ? err.message
                  : "Could not import feedback.",
              );
            }
            e.target.value = "";
          }}
        />
      </label>
      {notice && <Notice>{notice}</Notice>}
      {data.feedback.map((f) => (
        <article className="section" key={f.id}>
          <h3>Review received {new Date(f.reviewedAt).toLocaleDateString()}</h3>
          <p className="small muted">
            Submission {f.submissionId.slice(0, 8)} · educator feedback,
            imported locally
          </p>
          <p className="prose evidence">{f.feedback}</p>
          <div className="button-row">
            {f.lessonIds.map((id) => (
              <Link className="text-link" key={id} to={`/academy?quest=${id}`}>
                Revisit {id}
              </Link>
            ))}
          </div>
          <label>
            What did you change after this feedback?
            <textarea
              rows={3}
              maxLength={10000}
              value={f.response ?? ""}
              onChange={(e) =>
                update((d) => ({
                  ...d,
                  feedback: d.feedback.map((x) =>
                    x.id === f.id
                      ? { ...x, response: e.target.value, revisedAt: undefined }
                      : x,
                  ),
                }))
              }
            />
          </label>
          <Button
            disabled={!f.response?.trim()}
            onClick={() =>
              update((d) => ({
                ...d,
                feedback: d.feedback.map((x) =>
                  x.id === f.id
                    ? { ...x, revisedAt: new Date().toISOString() }
                    : x,
                ),
              }))
            }
          >
            {f.revisedAt ? "Revision recorded" : "Record my revision"}
          </Button>
          <Button
            variant="quiet"
            onClick={() =>
              update((d) => ({
                ...d,
                feedback: d.feedback.filter((x) => x.id !== f.id),
              }))
            }
          >
            Remove this feedback
          </Button>
        </article>
      ))}
    </section>
  );
}
