import { useSyncExternalStore } from "react";
export type ThemePreference = "system" | "light" | "dark";
const KEY = "buidlcamp-theme";
const listeners = new Set<() => void>();
let preference: ThemePreference = "system";
try {
  const value = localStorage.getItem(KEY);
  if (value === "light" || value === "dark") preference = value;
} catch {
  /* Theme remains usable without storage. */
}
const media = matchMedia("(prefers-color-scheme: dark)");
function apply() {
  const resolved =
    preference === "system" ? (media.matches ? "dark" : "light") : preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", resolved === "dark" ? "#0e1724" : "#ffffff");
  listeners.forEach((fn) => fn());
}
media.addEventListener("change", apply);
window.addEventListener("storage", (event) => {
  if (event.key === KEY) {
    preference =
      event.newValue === "dark" || event.newValue === "light"
        ? event.newValue
        : "system";
    apply();
  }
});
apply();
export function setTheme(value: ThemePreference) {
  preference = value;
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* Session preference still applies. */
  }
  apply();
}
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export function useTheme() {
  return useSyncExternalStore(
    subscribe,
    () => `${preference}:${document.documentElement.dataset.theme}`,
  ).split(":") as [ThemePreference, "light" | "dark"];
}
