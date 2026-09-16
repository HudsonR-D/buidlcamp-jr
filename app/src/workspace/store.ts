import { create } from "zustand";
import {
  backupJson,
  checkPin,
  dayKey,
  freshData,
  migrateLegacy,
  parseBackup,
  pinHash,
} from "./model";
import type { WorkspaceData } from "./model";
const KEY = "buidlcamp-workspace-v1";
let loadError = "";
let initial = freshData();
try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    initial = parseBackup(raw);
    const saved = JSON.parse(raw);
    initial.pin = typeof saved.pin === "string" ? saved.pin : null;
  } else {
    const old =
      localStorage.getItem("buidlcamp-junior") ??
      localStorage.getItem("buidlcamp26");
    if (old) initial = migrateLegacy(old);
  }
} catch {
  loadError =
    "Saved data could not be loaded. The original data is still on this device. Export or recover it before resetting.";
}
interface Store {
  data: WorkspaceData;
  error: string;
  recovery: boolean;
  adult: boolean;
  update: (fn: (data: WorkspaceData) => WorkspaceData) => void;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  replace: (data: WorkspaceData) => void;
  reset: () => void;
}
export const useWorkspace = create<Store>((set, get) => ({
  data: initial,
  error: loadError,
  recovery: !!loadError,
  adult: false,
  update: (fn) =>
    set((s) => {
      const next = fn(s.data);
      if (new TextEncoder().encode(backupJson(next)).byteLength > 7500000)
        return {
          error:
            "This workspace is full. Export your work, then remove older projects or portfolios before adding more.",
        };
      return { data: next };
    }),
  unlock: async (pin) => {
    const existing = get().data.pin;
    if (!/^\d{6}$/.test(pin)) return false;
    if (existing && !(await checkPin(pin, existing))) return false;
    if (!existing) {
      const hash = await pinHash(pin);
      set((s) => ({ data: { ...s.data, pin: hash } }));
    }
    set({ adult: true });
    return true;
  },
  lock: () => set({ adult: false }),
  replace: (data) =>
    set((s) => ({
      data: { ...data, pin: s.data.pin },
      adult: false,
      recovery: false,
      error: "",
    })),
  reset: () => {
    try {
      for (const key of [KEY, "buidlcamp-junior", "buidlcamp26"])
        localStorage.removeItem(key);
      set({ data: freshData(), adult: false, recovery: false, error: "" });
    } catch {
      set({
        error:
          "This browser blocked the reset. Check its storage permissions before trying again.",
      });
    }
  },
}));
let lastData = initial;
useWorkspace.subscribe((s) => {
  if (s.recovery || s.data === lastData) return;
  lastData = s.data;
  try {
    localStorage.setItem(KEY, JSON.stringify(s.data));
    if (s.error) useWorkspace.setState({ error: "" });
  } catch {
    useWorkspace.setState({
      error:
        "This browser could not save your latest changes. Export a backup now to keep your work.",
    });
  }
});
export function exportBackup() {
  return backupJson(useWorkspace.getState().data);
}
export function exportRecovery() {
  return JSON.stringify(
    Object.fromEntries(
      [KEY, "buidlcamp-junior", "buidlcamp26"].map((key) => [
        key,
        localStorage.getItem(key),
      ]),
    ),
    null,
    2,
  );
}
export function logMinute() {
  useWorkspace.getState().update((d) => ({
    ...d,
    minutes: { ...d.minutes, [dayKey()]: (d.minutes[dayKey()] ?? 0) + 1 },
  }));
}
