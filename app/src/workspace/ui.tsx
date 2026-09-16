import { useEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useWorkspace } from "./store";
export function Icon({
  name = "arrow",
  size = 22,
}: {
  name?: string;
  size?: number;
}) {
  const paths: Record<string, ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v11H3Z" />
        <path d="M9 21v-8h6v8" />
      </>
    ),
    book: (
      <>
        <path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Z" />
        <path d="M12 5v15" />
      </>
    ),
    folder: <path d="M3 6h7l2 3h9v12H3V6Zm0 0V3h7l2 3h9v3" />,
    brain: (
      <>
        <path d="M12 20V5c-1-4-7-3-7 1-4 0-4 6-1 7-3 4 2 8 5 6 0 2 3 3 3 1Zm0 0c0 2 3 1 3-1 3 2 8-2 5-6 3-1 3-7-1-7 0-4-6-5-7-1" />
        <path d="M5 6c3 0 3 3 2 4m12-4c-3 0-3 3-2 4M4 13h3m13 0h-3" />
      </>
    ),
    award: (
      <>
        <circle cx="12" cy="9" r="6" />
        <path d="m8 15-2 7 6-3 6 3-2-7m-7-6 2 2 4-4" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M2 21v-3c0-6 14-6 14 0v3m0-17c5 0 5 7 0 7m3 3c3 1 3 4 3 7" />
      </>
    ),
    settings: (
      <>
        <path d="m9 3 1-2h4l1 2 3 2 2 1 2 4-1 2v3l-2 3-3 2-2 3h-4l-2-3-3-2-2-3v-3L1 10l2-4 2-1 4-2Z" />
        <circle cx="12" cy="12" r="4" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    code: (
      <>
        <path d="m7 6-6 6 6 6m10-12 6 6-6 6m-3-15-4 22" />
      </>
    ),
    device: (
      <>
        <path d="M5 3h14v15H5zm-3 18h20" />
      </>
    ),
    check: <path d="m5 12 4 4L20 5" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M3 16v5h18v-5" />,
    play: <path d="m8 4 12 8-12 8Z" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    external: <path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7" />,
    lock: (
      <>
        <rect x="4" y="10" width="16" height="12" rx="2" />
        <path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v3" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.arrow}
    </svg>
  );
}
export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "danger";
}) {
  return (
    <button
      type="button"
      className={`button ${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function Heading({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
      {action}
    </div>
  );
}
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*\*.*?\*\*|`[^`]+`)/g)
        .map((part, i) =>
          part.startsWith("**") ? (
            <strong key={i}>{part.slice(2, -2)}</strong>
          ) : part.startsWith("`") ? (
            <code key={i}>{part.slice(1, -1)}</code>
          ) : (
            part
          ),
        )}
    </>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} onCancel={onClose} aria-label={title}>
      <div className="dialog-heading">
        <h2>{title}</h2>
        <Button variant="quiet" aria-label="Close dialog" onClick={onClose}>
          <Icon name="close" />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
export function Tabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="tabs" aria-label="Choose view">
      {options.map((o) => (
        <button
          type="button"
          key={o.id}
          aria-pressed={value === o.id}
          className={value === o.id ? "selected" : ""}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <Icon name="folder" size={32} />
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <p
      className={`notice ${error ? "error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
export function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="check-row">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{children}</span>
    </label>
  );
}
export function AdultGate({ children }: { children: ReactNode }) {
  const { adult, data, unlock } = useWorkspace();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (adult) return children;
  return (
    <section className="gate panel">
      <Icon name="lock" size={28} />
      <h2>{data.pin ? "Grown-up access" : "Set up grown-up access"}</h2>
      <p>
        For parents, educators, and adult learners. A six-digit PIN keeps casual
        changes out of the way on this device. It is a local convenience lock,
        not account security.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!data.pin && pin !== confirm) {
            setError("The PINs do not match.");
            return;
          }
          setBusy(true);
          try {
            const ok = await unlock(pin);
            if (!ok) setError("Check your six-digit PIN and try again.");
          } catch {
            setError(
              "PIN setup needs a secure browser context (HTTPS or localhost).",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Six-digit PIN
          <input
            type="password"
            autoComplete="off"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          />
        </label>
        {!data.pin && (
          <label>
            Confirm PIN
            <input
              type="password"
              autoComplete="off"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
            />
          </label>
        )}
        {error && <Notice error>{error}</Notice>}
        <Button type="submit" disabled={busy}>
          {busy ? "Checking…" : data.pin ? "Unlock" : "Create PIN and continue"}
        </Button>
      </form>
    </section>
  );
}
