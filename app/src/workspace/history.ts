import { bytes, parseCheckpoint } from "./checkpoints.ts";
import type { ProjectCheckpoint } from "./checkpoints";
const NAME = "buidlcamp-checkpoints-v1";
const LIMIT = 50 * 1024 * 1024;
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NAME, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("checkpoints", { keyPath: "id" });
    request.onerror = () =>
      reject(
        new Error(
          "Local history is unavailable. Download a checkpoint to keep your work.",
        ),
      );
    request.onsuccess = () => resolve(request.result);
  });
}
export async function localHistory(
  projectId?: string,
): Promise<ProjectCheckpoint[]> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db
        .transaction("checkpoints")
        .objectStore("checkpoints")
        .getAll();
      request.onerror = () =>
        reject(new Error("Could not read local history."));
      request.onsuccess = () => {
        try {
          resolve(
            request.result
              .map(parseCheckpoint)
              .filter((c) => !projectId || c.project.id === projectId)
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
          );
        } catch {
          reject(
            new Error(
              "Local history contains unreadable data. Export your current project before clearing history.",
            ),
          );
        }
      };
    });
  } finally {
    db.close();
  }
}
export async function saveLocalCheckpoint(
  value: ProjectCheckpoint,
): Promise<number> {
  const checkpoint = parseCheckpoint(value),
    db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("checkpoints", "readwrite"),
        store = tx.objectStore("checkpoints");
      let removed = 0;
      const request = store.getAll();
      request.onsuccess = () => {
        const records: ProjectCheckpoint[] = [
          ...request.result.filter((c) => c.id !== checkpoint.id),
          checkpoint,
        ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const perProject = new Map<string, number>();
        let total = 0;
        for (const c of records) {
          const count = (perProject.get(c.project.id) ?? 0) + 1;
          perProject.set(c.project.id, count);
          const size = bytes(c);
          if (count > 20 || total + size > LIMIT) {
            store.delete(c.id);
            removed++;
          } else {
            total += size;
            store.put(c);
          }
        }
      };
      tx.oncomplete = () => resolve(removed);
      tx.onerror = () =>
        reject(
          new Error(
            "History could not be saved. Download this checkpoint; your current project is still in the workspace.",
          ),
        );
      tx.onabort = () =>
        reject(
          new Error("History save was interrupted. Download this checkpoint."),
        );
    });
  } finally {
    db.close();
  }
}
export async function clearHistory(projectId?: string) {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("checkpoints", "readwrite"),
        store = tx.objectStore("checkpoints");
      if (!projectId) store.clear();
      else {
        const r = store.getAll();
        r.onsuccess = () =>
          r.result
            .filter((c) => c.project.id === projectId)
            .forEach((c) => store.delete(c.id));
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(new Error("Could not clear local checkpoint history."));
    });
  } finally {
    db.close();
  }
}
