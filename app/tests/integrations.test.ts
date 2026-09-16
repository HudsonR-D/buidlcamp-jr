import test from "node:test";
import assert from "node:assert/strict";
import {
  freshData,
  feedbackJson,
  parseFeedback,
  parsePortfolio,
  portfolioJson,
  parseBackup,
} from "../src/workspace/model.ts";
import {
  makeCheckpoint,
  parseCheckpoint,
  checkpointFiles,
  compareLines,
} from "../src/workspace/checkpoints.ts";
import { QUESTS } from "../src/data/quests.ts";
import { supportFor } from "../src/data/scaffolds.ts";
import { GitHub, HttpError } from "../worker/github.ts";
const project = {
  id: "project-1",
  name: "Drawing",
  templateId: "pixel",
  code: "<h1>My drawing</h1>",
  updatedAt: new Date().toISOString(),
  reflection: "I checked the button with touch and keyboard.",
  checks: [0],
};
test("checkpoint serialization excludes unapproved workspace and nested project fields", () => {
  const c = makeCheckpoint(
    { ...project, apiKey: "never-export-this", age: "10–12" } as any,
    "Explain the controls",
    [
      {
        id: "cc1-sequences",
        title: "Sequence",
        evidence: "I followed each instruction.",
      },
    ],
  );
  const output = JSON.stringify(checkpointFiles(c));
  assert.ok(!output.includes("never-export-this"));
  assert.ok(!output.includes("10–12"));
  assert.equal(Object.keys(checkpointFiles(c)).length, 2);
  assert.throws(() =>
    parseCheckpoint({
      ...c,
      project: { ...project, id: "../.github/workflows/escape" },
    }),
  );
});
test("recognizable credentials block GitHub export without erasing the local checkpoint", () => {
  const c = makeCheckpoint(
    { ...project, code: "const key = 'sk-" + "x".repeat(40) + "';" },
    "Keep private",
  );
  assert.throws(() => checkpointFiles(c), /credentials/);
  assert.equal(parseCheckpoint(c).project.code, c.project.code);
});
test("difference comparison handles identical, inserted, removed, and changed sections", () => {
  assert.equal(compareLines("one", "one").identical, true);
  assert.deepEqual(compareLines("one\ntwo\nend", "one\nnew\nend").added, [
    "new",
  ]);
  assert.deepEqual(compareLines("one\ntwo", "one").removed, ["two"]);
});
test("structured feedback matches its original submission and rejects another workspace", () => {
  const d = freshData();
  d.projects = [project];
  const submission = {
    id: "submission-1",
    createdAt: new Date().toISOString(),
    lessonIds: [],
    projectIds: [project.id],
  };
  const review = parsePortfolio(portfolioJson(d, submission));
  review.feedback = "Try a clearer button label.";
  const raw = feedbackJson(review);
  const feedback = parseFeedback(raw, [submission]);
  assert.equal(feedback.submissionId, submission.id);
  assert.throws(() => parseFeedback(raw, []), /different/);
  assert.throws(
    () =>
      parseFeedback(
        JSON.stringify({ ...feedback, projectIds: ["another-project"] }),
        [submission],
      ),
    /different/,
  );
  assert.equal(parsePortfolio(portfolioJson(d)).submissionId, undefined);
});
test("older workspace backups retain compatibility with new feedback and capstone fields", () => {
  const old: any = freshData();
  delete old.submissions;
  delete old.feedback;
  delete old.capstones;
  const restored = parseBackup(JSON.stringify(old));
  assert.deepEqual(restored.feedback, []);
  assert.deepEqual(restored.capstones, {});
});
test("every lesson has valid prerequisites, useful support, a creative task, and explanations", () => {
  assert.equal(QUESTS.length, 50);
  const ids = new Set(QUESTS.map((q) => q.id));
  assert.equal(ids.size, 50);
  for (const q of QUESTS) {
    for (const id of q.prereqs) assert.ok(ids.has(id), q.id + ": " + id);
    const s = supportFor(q);
    assert.equal(s.guided.length, 4);
    assert.ok(
      s.objective.length > 20 &&
        s.example.length > 40 &&
        s.hint.length > 20 &&
        s.stretch.length > 20,
      q.id,
    );
    assert.ok(q.creative.checklist.length >= 3);
    for (const item of q.questions) {
      assert.ok(item.answer >= 0 && item.answer < item.options.length);
      assert.ok(item.explain.length > 25);
    }
  }
  for (const q of QUESTS) {
    const visit = (id: string, seen: Set<string>) => {
      assert.ok(!seen.has(id), "Prerequisite cycle");
      const next = new Set(seen).add(id);
      QUESTS.find((x) => x.id === id)!.prereqs.forEach((p) => visit(p, next));
    };
    visit(q.id, new Set());
  }
});
function fakeGitHub(
  options: { private?: boolean; conflict?: boolean; selected?: boolean } = {},
) {
  const calls: { path: string; method: string; body: any }[] = [];
  let head = "a".repeat(40);
  const next = "b".repeat(40);
  const repo = {
    id: 7,
    name: "practice",
    owner: { login: "learner" },
    default_branch: "main",
    private: options.private !== false,
    archived: false,
    permissions: { push: true },
  };
  const transport = async (input: any, init: any = {}) => {
    const url = new URL(input);
    const body = init.body ? JSON.parse(init.body) : null;
    calls.push({ path: url.pathname, method: init.method ?? "GET", body });
    if (url.pathname === "/user/installations")
      return Response.json({ installations: [{ id: 1 }] });
    if (url.pathname === "/user/installations/1/repositories")
      return Response.json({
        repositories: options.selected === false ? [] : [repo],
      });
    if (url.pathname === "/repos/learner/practice") return Response.json(repo);
    if (url.pathname.endsWith("/git/ref/heads/main"))
      return Response.json({ object: { sha: head } });
    if (url.pathname.endsWith("/git/commits/" + head))
      return Response.json({ tree: { sha: "c".repeat(40) } });
    if (url.pathname.endsWith("/git/blobs"))
      return Response.json({ sha: "d".repeat(40) });
    if (url.pathname.endsWith("/git/trees"))
      return Response.json({ sha: "e".repeat(40) });
    if (url.pathname.endsWith("/git/commits"))
      return Response.json({ sha: next });
    if (url.pathname.endsWith("/git/refs/heads/main")) {
      if (options.conflict) return Response.json({}, { status: 422 });
      head = next;
      return Response.json({ object: { sha: head } });
    }
    throw new Error("Unexpected test request " + url.pathname);
  };
  return {
    client: new GitHub("fixture-access", transport as typeof fetch),
    calls,
    base: head,
  };
}
test("GitHub save uses a base tree, one atomic commit, and a non-forced branch update", async () => {
  const { client, calls, base } = fakeGitHub();
  const result = await client.save(
    7,
    base,
    makeCheckpoint(project, "Improve controls"),
    { id: 1, login: "learner" },
  );
  assert.equal(result.head, "b".repeat(40));
  assert.equal(
    calls.find((c) => c.path.endsWith("/git/refs/heads/main"))?.body.force,
    false,
  );
  const tree = calls.find((c) => c.path.endsWith("/git/trees"))!.body;
  assert.equal(tree.base_tree, "c".repeat(40));
  assert.ok(
    tree.tree.every((f: any) =>
      f.path.startsWith("buidlcamp/projects/project-1/"),
    ),
  );
  assert.equal(tree.tree.length, 2);
});
test("private visibility and selected-repository checks reject writes before any mutation", async () => {
  for (const options of [{ private: false }, { selected: false }]) {
    const { client, calls, base } = fakeGitHub(options);
    await assert.rejects(
      () =>
        client.save(7, base, makeCheckpoint(project, "Version"), {
          id: 1,
          login: "learner",
        }),
      (e) => e instanceof HttpError && e.status === 403,
    );
    assert.ok(calls.every((c) => c.method === "GET"));
  }
});
test("stale heads and concurrent updates preserve remote history and return conflicts", async () => {
  const stale = fakeGitHub();
  await assert.rejects(
    () =>
      stale.client.save(7, "f".repeat(40), makeCheckpoint(project, "Version"), {
        id: 1,
        login: "learner",
      }),
    (e) => e instanceof HttpError && e.status === 409,
  );
  assert.ok(stale.calls.every((c) => c.method === "GET"));
  const race = fakeGitHub({ conflict: true });
  await assert.rejects(
    () =>
      race.client.save(7, race.base, makeCheckpoint(project, "Version"), {
        id: 1,
        login: "learner",
      }),
    (e) => e instanceof HttpError && e.status === 409,
  );
  assert.equal(race.calls.at(-1)!.body.force, false);
});

test("GitHub transport does not bind native fetch to the client instance", async () => {
  const github = new GitHub("fixture", async function (this: unknown) {
    assert.equal(this, undefined);
    return Response.json({ id: 1 });
  } as typeof fetch);
  assert.deepEqual(await github.request("/user"), { id: 1 });
});

test("GitHub rejects redirects instead of forwarding user tokens", async () => {
  let calls = 0;
  const client = new GitHub("fixture", async (_url, init) => {
    calls++;
    assert.equal(init?.redirect, "manual");
    return new Response(null, {
      status: 302,
      headers: { Location: "https://untrusted.example" },
    });
  });
  await assert.rejects(client.request("/user"), /could not complete/);
  assert.equal(calls, 1);
});
