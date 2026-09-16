import { GitHub, HttpError } from "./github.ts";
import type { Transport } from "./github.ts";
import { decrypt, digest, encrypt, random, verifyWebhook } from "./crypto.ts";
import { complete } from "../server/ai.mjs";
export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  APP_ORIGIN: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  SESSION_KEY: string;
  GITHUB_APP_URL: string;
  GITHUB_WEBHOOK_SECRET: string;
  RELEASE?: string;
}
type Session = {
  id: string;
  token: string;
  user_id: number;
  login: string;
  csrf: string;
  role: string;
  expires: number;
};
const COOKIE = "__Host-buidlcamp-session",
  FLOW = "__Host-buidlcamp-flow";
const now = () => Math.floor(Date.now() / 1000);
const cookies = (request: Request) =>
  Object.fromEntries(
    (request.headers.get("Cookie") ?? "")
      .split(";")
      .map((v) => v.trim().split("=")),
  );
const cookie = (name: string, value: string, seconds: number) =>
  `${name}=${value}; Path=/; Max-Age=${seconds}; Secure; HttpOnly; SameSite=Lax`;
const json = (
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Strict-Transport-Security": "max-age=31536000",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      ...headers,
    },
  });
const configured = (env: Env) =>
  !!(
    env.DB &&
    env.GITHUB_CLIENT_ID &&
    env.GITHUB_CLIENT_SECRET &&
    env.SESSION_KEY &&
    env.GITHUB_APP_URL
  );
async function read(request: Request, limit = 3_100_000, raw = false) {
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    throw new HttpError(415, "Send JSON only.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Request body is missing.");
  let length = 0,
    text = "";
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > limit) {
        await reader.cancel();
        throw new HttpError(413, "This request is too large.");
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
  text += decoder.decode();
  if (raw) return text;
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
}
function sameOrigin(request: Request, env: Env) {
  if (
    request.headers.get("Origin") !== env.APP_ORIGIN ||
    request.headers.get("X-BuidlCamp") !== "1"
  )
    throw new HttpError(
      403,
      "Use BuidlCamp on its own site to perform this action.",
    );
}
async function limit(env: Env, id: string, max: number, seconds = 60) {
  const result = await env.DB.prepare(
    "INSERT INTO rate_limits(id,count,expires) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<=? THEN excluded.expires ELSE expires END RETURNING count",
  )
    .bind(id, now() + seconds, now(), now())
    .first<{ count: number }>();
  if (!result || result.count > max)
    throw new HttpError(
      429,
      "Too many requests. Your local work is safe; try again shortly.",
    );
}
async function session(request: Request, env: Env) {
  const value = cookies(request)[COOKIE];
  if (!value || !configured(env)) return null;
  return env.DB.prepare("SELECT * FROM sessions WHERE id=? AND expires>?")
    .bind(await digest(value), now())
    .first<Session>();
}
async function cleanup(env: Env) {
  if (!env.DB) return;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires<=?").bind(now()),
    env.DB.prepare("DELETE FROM auth_flows WHERE expires<=?").bind(now()),
    env.DB.prepare("DELETE FROM rate_limits WHERE expires<=?").bind(now()),
  ]);
}
export function createWorker(transport: Transport = fetch) {
  return {
    async scheduled(_event: unknown, env: Env) {
      await cleanup(env);
    },
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      if (!url.pathname.startsWith("/api/")) {
        const response = await env.ASSETS.fetch(request);
        const headers = new Headers(response.headers);
        headers.set(
          "Content-Security-Policy",
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-src 'self' about: blob:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
        );
        headers.set("Referrer-Policy", "no-referrer");
        headers.set("X-Content-Type-Options", "nosniff");
        headers.set(
          "Permissions-Policy",
          "camera=(), microphone=(), geolocation=(), payment=()",
        );
        headers.set("Strict-Transport-Security", "max-age=31536000");
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }
      let current: Session | null = null;
      let callbackStage = "checking the sign-in request";
      try {
        if (url.origin !== env.APP_ORIGIN)
          throw new HttpError(403, "Use the configured BuidlCamp address.");
        if (url.pathname === "/api/health")
          return json({ ok: true, release: env.RELEASE ?? "development" });
        if (
          url.pathname === "/api/github/webhook" &&
          request.method === "POST"
        ) {
          if (!env.GITHUB_WEBHOOK_SECRET)
            throw new HttpError(503, "Integration unavailable.");
          if (Number(request.headers.get("Content-Length") ?? 0) > 128000)
            throw new HttpError(413, "Payload too large.");
          const raw = await read(request, 128000, true);
          if (
            !(await verifyWebhook(
              raw,
              request.headers.get("X-Hub-Signature-256") ?? "",
              env.GITHUB_WEBHOOK_SECRET,
            ))
          )
            throw new HttpError(403, "Webhook signature did not match.");
          const body = JSON.parse(raw);
          if (
            request.headers.get("X-GitHub-Event") ===
              "github_app_authorization" &&
            body.action === "revoked" &&
            Number.isSafeInteger(body.sender?.id)
          )
            await env.DB.prepare("DELETE FROM sessions WHERE user_id=?")
              .bind(body.sender.id)
              .run();
          return json({ received: true });
        }
        current = await session(request, env);
        if (url.pathname === "/api/status" && request.method === "GET")
          return json({
            configured: configured(env),
            authenticated: !!current,
            login: current?.login,
            csrf: current?.csrf,
            role: current?.role,
            installUrl: env.GITHUB_APP_URL
              ? `${env.GITHUB_APP_URL}/installations/new`
              : null,
          });
        if (!configured(env))
          throw new HttpError(
            503,
            "GitHub connections are not configured on this installation. All local learning and exports still work.",
          );
        if (
          url.pathname === "/api/github/connect" &&
          request.method === "POST"
        ) {
          sameOrigin(request, env);
          await limit(
            env,
            `auth:${await digest((request.headers.get("CF-Connecting-IP") ?? "local") + env.SESSION_KEY)}`,
            10,
            600,
          );
          const input = await read(request, 2000);
          if (
            input.eligible !== true ||
            !["learner", "adult"].includes(input.role)
          )
            throw new HttpError(
              400,
              "Check GitHub's age and account rules first.",
            );
          const state = random(),
            verifier = random();
          await env.DB.prepare("INSERT INTO auth_flows VALUES(?,?,?,?)")
            .bind(
              await digest(state),
              await encrypt(verifier, env.SESSION_KEY),
              input.role,
              now() + 600,
            )
            .run();
          const auth = new URL("https://github.com/login/oauth/authorize");
          auth.search = new URLSearchParams({
            client_id: env.GITHUB_CLIENT_ID,
            redirect_uri: env.APP_ORIGIN + "/api/github/callback",
            state,
            code_challenge: await digest(verifier),
            code_challenge_method: "S256",
            allow_signup: "false",
            prompt: "select_account",
          }).toString();
          return json({ url: auth.href }, 200, {
            "Set-Cookie": cookie(FLOW, state, 600),
          });
        }
        if (
          url.pathname === "/api/github/callback" &&
          request.method === "GET"
        ) {
          const state = url.searchParams.get("state"),
            code = url.searchParams.get("code");
          if (
            !state ||
            state.length > 200 ||
            state !== cookies(request)[FLOW] ||
            !code ||
            code.length > 500
          )
            throw new HttpError(
              400,
              "GitHub sign-in was cancelled or expired. Return to BuidlCamp and reconnect.",
            );
          const flow = await env.DB.prepare(
            "DELETE FROM auth_flows WHERE id=? AND expires>? RETURNING verifier,role",
          )
            .bind(await digest(state), now())
            .first<{ verifier: string; role: string }>();
          if (!flow)
            throw new HttpError(
              400,
              "This sign-in attempt expired or was already used.",
            );
          callbackStage = "reading the sign-in verifier";
          const verifier = await decrypt(flow.verifier, env.SESSION_KEY);
          callbackStage = "contacting GitHub";
          const exchanged = await transport(
            "https://github.com/login/oauth/access_token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "User-Agent": "BuidlCamp",
              },
              body: JSON.stringify({
                client_id: env.GITHUB_CLIENT_ID,
                client_secret: env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: env.APP_ORIGIN + "/api/github/callback",
                code_verifier: verifier,
              }),
              redirect: "manual",
              signal: AbortSignal.timeout(15000),
            },
          );
          callbackStage = "reading GitHub authorization";
          const token = (await exchanged.json().catch(() => {
            throw new HttpError(
              502,
              `GitHub authorization returned an unreadable response (HTTP ${exchanged.status}). Reconnect to try again.`,
            );
          })) as {
            error?: string;
            access_token?: string;
            expires_in?: number;
          };
          if (!exchanged.ok || !token.access_token)
            throw new HttpError(
              502,
              token.error === "incorrect_client_credentials"
                ? "GitHub App configuration needs attention. The client credentials were rejected."
                : token.error === "bad_verification_code"
                  ? "GitHub sign-in expired or its verification was rejected. Reconnect to try again."
                  : "GitHub could not authorize this connection. Return and reconnect.",
            );
          if (!token.expires_in)
            throw new HttpError(
              502,
              "GitHub App configuration needs attention. Enable expiring user tokens before connecting.",
            );
          callbackStage = "reading the GitHub account";
          const who = await new GitHub(token.access_token, transport).request(
            "/user",
          );
          if (
            !Number.isSafeInteger(who.id) ||
            !/^[a-zA-Z0-9-]{1,39}$/.test(who.login)
          )
            throw new HttpError(502, "GitHub returned an invalid account.");
          callbackStage = "saving the integration session";
          const id = random(),
            expires = Math.min(28800, token.expires_in);
          await env.DB.prepare("INSERT INTO sessions VALUES(?,?,?,?,?,?,?)")
            .bind(
              await digest(id),
              await encrypt(token.access_token, env.SESSION_KEY),
              who.id,
              who.login,
              random(),
              flow.role,
              now() + expires,
            )
            .run();
          const headers = new Headers({
            Location: env.APP_ORIGIN + "/#/versions",
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer",
          });
          headers.append("Set-Cookie", cookie(COOKIE, id, expires));
          headers.append("Set-Cookie", cookie(FLOW, "", 0));
          return new Response(null, { status: 303, headers });
        }
        if (!current)
          throw new HttpError(
            401,
            "Connect your eligible GitHub account to use this integration.",
          );
        if (request.method !== "GET") {
          sameOrigin(request, env);
          if (request.headers.get("X-CSRF-Token") !== current.csrf)
            throw new HttpError(
              403,
              "Your session changed. Refresh before trying again.",
            );
        }
        await limit(env, `session:${current.id}`, 60);
        const token = await decrypt(current.token, env.SESSION_KEY),
          github = new GitHub(token, transport);
        if (
          url.pathname === "/api/github/disconnect" &&
          request.method === "POST"
        ) {
          await env.DB.prepare("DELETE FROM sessions WHERE id=?")
            .bind(current.id)
            .run();
          try {
            await transport(
              `https://api.github.com/applications/${env.GITHUB_CLIENT_ID}/token`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Basic ${btoa(env.GITHUB_CLIENT_ID + ":" + env.GITHUB_CLIENT_SECRET)}`,
                  "Content-Type": "application/json",
                  "User-Agent": "BuidlCamp",
                },
                body: JSON.stringify({ access_token: token }),
                redirect: "manual",
                signal: AbortSignal.timeout(10000),
              },
            );
          } catch {
            /* The local session is already invalidated. */
          }
          return json({ disconnected: true }, 200, {
            "Set-Cookie": cookie(COOKIE, "", 0),
          });
        }
        if (url.pathname === "/api/ai" && request.method === "POST") {
          if (current.role !== "adult")
            throw new HttpError(
              403,
              "Reconnect as an adult educator to prepare an AI demonstration.",
            );
          await github.request("/user");
          await limit(env, `ai:${current.user_id}`, 10);
          const input = await read(request, 64000);
          if (input.adult !== true)
            throw new HttpError(
              403,
              "An adult must acknowledge and operate the demonstration.",
            );
          const key = `ai-active:${current.user_id}`;
          const lease = await env.DB.prepare(
            "INSERT INTO rate_limits(id,count,expires) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END, expires=excluded.expires WHERE expires<=? OR count<2 RETURNING count",
          )
            .bind(key, now() + 35, now(), now())
            .first();
          if (!lease)
            throw new HttpError(
              429,
              "Two demonstrations are already running. Wait or cancel one.",
            );
          try {
            return json({
              text: await complete(
                input,
                transport,
                AbortSignal.any([request.signal, AbortSignal.timeout(25000)]),
              ),
            });
          } finally {
            input.key = "";
            await env.DB.prepare(
              "UPDATE rate_limits SET count=MAX(0,count-1) WHERE id=?",
            )
              .bind(key)
              .run();
          }
        }
        if (url.pathname === "/api/github/repos" && request.method === "GET")
          return json({ repositories: await github.repositories() });
        const repo = Number(url.searchParams.get("repo"));
        if (url.pathname === "/api/github/projects" && request.method === "GET")
          return json(await github.projects(repo));
        if (url.pathname === "/api/github/history" && request.method === "GET")
          return json({
            history: await github.history(
              repo,
              url.searchParams.get("project") ?? "",
            ),
          });
        if (
          url.pathname === "/api/github/checkpoint" &&
          request.method === "GET"
        )
          return json(
            await github.checkpoint(
              repo,
              url.searchParams.get("project") ?? "",
              url.searchParams.get("sha") ?? "",
            ),
          );
        if (
          url.pathname === "/api/github/checkpoint" &&
          request.method === "POST"
        ) {
          const input = await read(request);
          return json(
            await github.save(input.repo, input.base, input.checkpoint, {
              id: current.user_id,
              login: current.login,
            }),
          );
        }
        throw new HttpError(404, "This integration route does not exist.");
      } catch (error) {
        if (url.pathname === "/api/github/callback") {
          const message =
            error instanceof HttpError
              ? error.message
              : `GitHub sign-in could not finish while ${callbackStage}. Reconnect or check the installation settings.`;
          return new Response(null, {
            status: 303,
            headers: {
              Location:
                env.APP_ORIGIN +
                "/#/versions?connection_error=" +
                encodeURIComponent(message),
              "Cache-Control": "no-store",
              "Referrer-Policy": "no-referrer",
              "Set-Cookie": cookie(FLOW, "", 0),
            },
          });
        }
        if (error instanceof HttpError) {
          if (error.status === 401 && current)
            await env.DB.prepare("DELETE FROM sessions WHERE id=?")
              .bind(current.id)
              .run();
          return json(
            { error: error.message, detail: error.detail },
            error.status,
          );
        }
        return json(
          {
            error:
              "The request could not be completed. Check the connection or provider settings and try again. Your local work is safe.",
          },
          502,
        );
      }
    },
  };
}
export default createWorker();
