import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { complete, providerRequest } from "../server/ai.mjs";
import { createApp } from "../server.mjs";
const input = {
  provider: "openai",
  key: "test-only-not-a-real-credential",
  model: "test-model",
  prompt: "Explain a loop.",
  adult: true,
};
test("provider routing is allowlisted, caps output, and keeps credentials out of prompt bodies", () => {
  const request = providerRequest(input);
  assert.equal(request.url, "https://api.openai.com/v1/chat/completions");
  assert.equal(request.body.max_completion_tokens, 800);
  assert.equal(JSON.stringify(request.body).includes(input.key), false);
  assert.throws(() =>
    providerRequest({ ...input, provider: "http://localhost:1234" }),
  );
  assert.throws(() => providerRequest({ ...input, adult: false }));
  assert.throws(() => providerRequest({ ...input, prompt: "x".repeat(12001) }));
});
test("both adapters return real provider text from their response contracts", async () => {
  assert.equal(
    await complete(input, async () =>
      Response.json({ choices: [{ message: { content: "A loop repeats." } }] }),
    ),
    "A loop repeats.",
  );
  assert.equal(
    await complete({ ...input, provider: "anthropic" }, async () =>
      Response.json({ content: [{ type: "text", text: "Try a loop." }] }),
    ),
    "Try a loop.",
  );
});
test("upstream error bodies and authorization details are not reflected", async () => {
  await assert.rejects(
    complete(input, async () => new Response(input.key, { status: 401 })),
    { message: "Check your API key and model access." },
  );
  await assert.rejects(
    complete(input, async () => new Response("x".repeat(128001))),
    /too large/,
  );
});
test("companion rejects cross-origin calls and accepts an explicit adult request", async () => {
  let requests = 0;
  const server = createApp(async () => {
    requests++;
    return Response.json({
      choices: [{ message: { content: "One small hint." } }],
    });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const send = (extra = {}, body = input) =>
      fetch(origin + "/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: origin,
          "X-BuidlCamp-Request": "adult-coach",
          ...extra,
        },
        body: JSON.stringify(body),
      });
    assert.equal(
      (await send({ Origin: "https://untrusted.example" })).status,
      403,
    );
    assert.equal((await send({ "X-BuidlCamp-Request": "wrong" })).status, 403);
    assert.equal((await send({}, { ...input, adult: false })).status, 400);
    assert.equal(
      (
        await send({
          Host: "untrusted.example",
          Origin: "http://untrusted.example",
        })
      ).status,
      403,
    );
    assert.equal(requests, 0);
    const response = await send();
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { text: "One small hint." });
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(requests, 1);
    assert.equal((await fetch(origin + "/api/ai")).status, 405);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("AI relay rejects redirects instead of forwarding API credentials", async () => {
  let calls = 0;
  await assert.rejects(
    complete(input, async (_url, init) => {
      calls++;
      assert.equal(init.redirect, "manual");
      return new Response(null, {
        status: 302,
        headers: { Location: "https://untrusted.example" },
      });
    }),
    /could not complete/,
  );
  assert.equal(calls, 1);
});
