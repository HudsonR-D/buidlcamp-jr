import { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "./store";
import { Button, Notice } from "./ui";
export default function LabSave({
  name,
  code,
}: {
  name: string;
  code: () => string;
}) {
  const { data, update } = useWorkspace(),
    [saved, setSaved] = useState("");
  return (
    <div className="section">
      <Button
        variant="secondary"
        disabled={data.projects.length >= 100}
        onClick={() => {
          const id = crypto.randomUUID();
          update((d) => ({
            ...d,
            projects: [
              {
                id,
                name,
                templateId: "lab",
                code: code(),
                updatedAt: new Date().toISOString(),
                reflection: "",
                checks: [],
              },
              ...d.projects,
            ],
          }));
          if (useWorkspace.getState().data.projects.some((p) => p.id === id))
            setSaved(id);
        }}
      >
        Keep this experiment as a project
      </Button>
      {saved && (
        <Notice>
          Saved without running its code.{" "}
          <Link to={`/forge?project=${saved}`}>Open your editable project</Link>
          .
        </Notice>
      )}
    </div>
  );
}
