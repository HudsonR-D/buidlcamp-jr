import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { createWorker } from "../worker/index.ts";
import type { Env } from "../worker/index.ts";
import { encrypt, decrypt } from "../worker/crypto.ts";
const origin = "https://buidl.example.test";
function fixture() {
  const db = new DatabaseSync(":memory:");
  db.exec(
    readFileSync(
      new URL("../worker/migrations/0001_sessions.sql", import.meta.url),
      "utf8",
    ),
  );
  const d1 = {
    prepare(sql: string) {
      const build = (args: any[] = []) => ({
        bind(...values: any[]) {
          return build(values);
        },
        async first() {
          return db.prepare(sql).get(...args) ?? null;
        },
        async run() {
          return db.prepare(sql).run(...args);
        },
        async all() {
          return { results: db.prepare(sql).all(...args) };
        },
      });
      return build();
    },
    async batch(statements: any[]) {
      return Promise.all(statements.map((s) => s.run()));
    },
  };
  const key = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString(
    "base64url",
  );
  const env = {
    DB: d1,
    ASSETS: { fetch: async () => new Response("app") },
    APP_ORIGIN: origin,
    GITHUB_CLIENT_ID: "fixture-client",
    GITHUB_CLIENT_SECRET: "fixture-client-secret",
    SESSION_KEY: key,
    GITHUB_APP_URL: "https://github.com/apps/fixture-app",
    GITHUB_WEBHOOK_SECRET: "fixture-webhook-secret",
  } as unknown as Env;
  const calls: { url: string; body: any }[] = [];
  const transport = async (input: any, init: any = {}) => {
    assert.equal(
      init.redirect,
      "manual",
      "Credential requests must never follow redirects",
    );
    const url = String(input);
    const body = init.body ? JSON.parse(init.body) : null;
    calls.push({ url, body });
    if (url === "https://github.com/login/oauth/access_token")
      return Response.json({
        access_token: "fixture-user-access",
        expires_in: 28800,
        refresh_token: "fixture-refresh-not-stored",
      });
    if (url === "https://api.github.com/user")
      return Response.json({ id: 12, login: "fixture-learner" });
    if (url === "https://api.openai.com/v1/chat/completions") {
      await new Promise((r) => setTimeout(r, 20));
      return Response.json({
        choices: [{ message: { content: "What happens after this step?" } }],
      });
    }
    if (url.includes("/applications/"))
      return new Response(null, { status: 204 });
    throw new Error("Unexpected fixture request");
  };
  const worker = createWorker(transport as typeof fetch);
  const request = (
    path: string,
    body?: unknown,
    cookie = "",
    csrf = "",
    requestOrigin = origin,
  ) =>
    new Request(origin + path, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: requestOrigin,
        "X-BuidlCamp": "1",
        Cookie: cookie,
        "X-CSRF-Token": csrf,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  async function login(role = "learner") {
    const start = await worker.fetch(
      request("/api/github/connect", { eligible: true, role }),
      env,
    );
    assert.equal(start.status, 200);
    const auth = new URL(((await start.json()) as any).url),
      flow = start.headers.get("Set-Cookie")!.split(";")[0];
    assert.equal(auth.searchParams.get("code_challenge_method"), "S256");
    assert.ok(auth.searchParams.get("code_challenge"));
    const callback = `/api/github/callback?state=${auth.searchParams.get("state")}&code=fixture-code`;
    const response = await worker.fetch(
      request(callback, undefined, flow),
      env,
    );
    assert.equal(response.status, 303);
    const cookie = response.headers
      .getSetCookie()
      .find((c) => c.startsWith("__Host-buidlcamp-session="))!
      .split(";")[0];
    const status = (await (
      await worker.fetch(request("/api/status", undefined, cookie), env)
    ).json()) as any;
    return { cookie, csrf: status.csrf, callback, flow, response };
  }
  return { db, env, worker, request, login, calls };
}
test("integration tokens are encrypted and fail authentication when modified", async () => {
  const { env } = fixture();
  const ciphertext = await encrypt("fixture-credential", env.SESSION_KEY);
  assert.ok(!ciphertext.includes("fixture-credential"));
  assert.equal(
    await decrypt(ciphertext, env.SESSION_KEY),
    "fixture-credential",
  );
  await assert.rejects(() => decrypt(ciphertext + "x", env.SESSION_KEY));
});
test("OAuth uses single-use state and PKCE, stores no refresh token, and issues a secure bounded cookie", async () => {
  const f = fixture(),
    logged = await f.login();
  const row = f.db.prepare("SELECT * FROM sessions").get() as any;
  assert.ok(!JSON.stringify(row).includes("fixture-user-access"));
  assert.ok(!JSON.stringify(row).includes("fixture-refresh"));
  assert.ok(Number(row.expires) <= Math.floor(Date.now() / 1000) + 28800);
  assert.match(
    logged.response.headers.getSetCookie().join(";"),
    /Secure; HttpOnly; SameSite=Lax/,
  );
  const reuse = await f.worker.fetch(
    f.request(logged.callback, undefined, logged.flow),
    f.env,
  );
  assert.equal(reuse.status, 303);
  assert.ok(
    reuse.headers
      .get("Location")
      ?.startsWith(origin + "/#/versions?connection_error="),
  );
  assert.equal(
    f.db.prepare("SELECT count(*) AS count FROM sessions").get().count,
    1,
  );
  assert.ok(f.calls[0].body.code_verifier);
});
test("unauthenticated, cross-origin, and wrong-CSRF mutations fail closed", async () => {
  const f = fixture();
  assert.equal(
    (await f.worker.fetch(f.request("/api/ai", {}), f.env)).status,
    401,
  );
  const logged = await f.login();
  assert.equal(
    (
      await f.worker.fetch(
        f.request("/api/github/disconnect", {}, logged.cookie, "bad"),
        f.env,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await f.worker.fetch(
        f.request(
          "/api/github/disconnect",
          {},
          logged.cookie,
          logged.csrf,
          "https://other.example",
        ),
        f.env,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await f.worker.fetch(
        f.request("/api/ai", { adult: true }, logged.cookie, logged.csrf),
        f.env,
      )
    ).status,
    403,
  );
});
test("expired and disconnected sessions cannot access integrations", async () => {
  const f = fixture(),
    logged = await f.login();
  f.db.prepare("UPDATE sessions SET expires=0").run();
  assert.equal(
    (
      await f.worker.fetch(
        f.request("/api/ai", {}, logged.cookie, logged.csrf),
        f.env,
      )
    ).status,
    401,
  );
  const second = await f.login();
  assert.equal(
    (
      await f.worker.fetch(
        f.request("/api/github/disconnect", {}, second.cookie, second.csrf),
        f.env,
      )
    ).status,
    200,
  );
  const status = (await (
    await f.worker.fetch(
      f.request("/api/status", undefined, second.cookie),
      f.env,
    )
  ).json()) as any;
  assert.equal(status.authenticated, false);
});
test("signed revocation webhooks invalidate sessions and invalid signatures do not", async () => {
  const f = fixture();
  await f.login();
  const body = JSON.stringify({ action: "revoked", sender: { id: 12 } });
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(f.env.GITHUB_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature =
    "sha256=" +
    Buffer.from(
      await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)),
    ).toString("hex");
  const hook = (sig: string) =>
    new Request(origin + "/api/github/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Event": "github_app_authorization",
        "X-Hub-Signature-256": sig,
      },
      body,
    });
  assert.equal((await f.worker.fetch(hook("invalid"), f.env)).status, 403);
  assert.equal((await f.worker.fetch(hook(signature), f.env)).status, 200);
  assert.equal(
    (f.db.prepare("SELECT COUNT(*) AS count FROM sessions").get() as any).count,
    0,
  );
});
test("adult relay authenticates, bounds concurrent requests, and does not persist API keys", async () => {
  const f = fixture(),
    logged = await f.login("adult");
  const input = {
    adult: true,
    provider: "openai",
    key: "fixture-ephemeral-key",
    model: "fixture-model",
    prompt: "Explain a loop.",
  };
  const responses = await Promise.all(
    Array.from({ length: 3 }, () =>
      f.worker.fetch(
        f.request("/api/ai", input, logged.cookie, logged.csrf),
        f.env,
      ),
    ),
  );
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 200, 429]);
  assert.ok(
    !JSON.stringify(f.db.prepare("SELECT * FROM sessions").all()).includes(
      input.key,
    ),
  );
  assert.ok(
    !JSON.stringify(f.db.prepare("SELECT * FROM rate_limits").all()).includes(
      input.key,
    ),
  );
});
