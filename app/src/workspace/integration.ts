export interface IntegrationStatus {
  configured: boolean;
  authenticated: boolean;
  csrf?: string;
  login?: string;
  role?: "learner" | "adult";
  installUrl?: string;
}
export async function integrationStatus(): Promise<IntegrationStatus> {
  try {
    const response = await fetch("/api/status", { cache: "no-store" });
    if (
      !response.ok ||
      !response.headers.get("Content-Type")?.includes("application/json")
    )
      return { configured: false, authenticated: false };
    return await response.json();
  } catch {
    return { configured: false, authenticated: false };
  }
}
export class IntegrationError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
export async function api<T>(
  path: string,
  body?: unknown,
  csrf?: string,
): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method: body === undefined ? "GET" : "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-BuidlCamp": "1",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.headers.get("Content-Type")?.includes("application/json"))
    throw new Error(
      "This installation supports local work and exports. GitHub connections require the hosted integration.",
    );
  const result = await response.json();
  if (!response.ok)
    throw new IntegrationError(
      result.error ?? "The connection failed. Your local work is safe.",
      response.status,
    );
  return result;
}
