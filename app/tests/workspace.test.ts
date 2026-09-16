import test from "node:test";
import assert from "node:assert/strict";
import {
  backupJson,
  canFinish,
  checkPin,
  dayKey,
  freshData,
  migrateLegacy,
  newLesson,
  parseAssignment,
  parseBackup,
  parsePortfolio,
  pinHash,
  portfolioJson,
  previewDocument,
} from "../src/workspace/model.ts";
import { providerEligible } from "../src/workspace/providers.ts";
test("legacy migration preserves lessons, project source, awards and previous completion without inventing age", () => {
  const data = migrateLegacy(
    JSON.stringify({
      state: {
        onboarded: true,
        name: "Builder",
        ageMode: "legend",
        xp: 1500,
        questProgress: {
          "cc1-sequences": {
            status: "done",
            completedAt: "2026-08-22",
            attempts: 2,
          },
        },
        savedGames: [
          {
            id: "one",
            name: "Original",
            templateId: "maze",
            code: "<script>1</script>",
            updatedAt: "2026-08-22",
          },
        ],
        diplomaEarned: { first: "2026-08-22" },
        dojoProgress: { "white-1": { done: true } },
        certProgress: {
          cs50x: { parentConfirmed: true, checked: ["old milestone"] },
        },
      },
    }),
  );
  assert.equal(data.age, "10–12");
  assert.equal(data.level, "legend");
  assert.equal(data.projects[0].code, "<script>1</script>");
  assert.equal(data.lessons["cc1-sequences"].completedAt, "2026-08-22");
  assert.ok(data.practice["white-1"].completedAt);
  assert.equal(data.credentials.cs50x.reviewedAt, undefined);
  assert.equal(data.legacyAwards.first, "2026-08-22");
  assert.doesNotThrow(() => parseBackup(backupJson(data)));
});
test("backup roundtrip keeps evidence, never imported PIN or unknown properties", () => {
  const data = freshData();
  data.pin = "private";
  data.lessons.a = {
    ...newLesson(),
    answers: [-1, 2],
    evidence: "I built a small program.",
  };
  const parsed = parseBackup(
    JSON.stringify({
      ...data,
      update: "malicious",
      __proto__: { hacked: true },
    }),
  );
  assert.equal(parsed.pin, null);
  assert.equal("update" in parsed, false);
  assert.equal(backupJson(data).includes("private"), false);
  assert.deepEqual(parsed.lessons.a.answers, [-1, 2]);
});
test("invalid and oversized backup imports fail without partial hydration", () => {
  assert.throws(() => parseBackup("null"));
  assert.throws(() => parseBackup("x".repeat(8000001)));
  for (const patch of [
    { lessons: { a: { step: 99 } } },
    { projects: [{ code: 5 }] },
    { age: "9" },
    { practice: { x: {} } },
    { credentials: { x: {} } },
    { minutes: { "2026-09-16": -1 } },
  ])
    assert.throws(() =>
      parseBackup(JSON.stringify({ ...freshData(), ...patch })),
    );
});
test("completion needs every correct answer, each checklist item, and recorded evidence", () => {
  const work = {
    ...newLesson(),
    answers: [1, 2],
    checks: [0, 1],
    evidence: "I tested the order and explained the change.",
  };
  assert.equal(canFinish(work, [1, 2], 2), true);
  assert.equal(canFinish({ ...work, answers: [1, 1] }, [1, 2], 2), false);
  assert.equal(canFinish({ ...work, checks: [1, 2] }, [1, 2], 2), false);
  assert.equal(canFinish({ ...work, evidence: "" }, [1, 2], 2), false);
});
test("portfolio omits adult settings, API credentials, and other learner reviews", () => {
  const data = freshData();
  data.pin = "private";
  data.name = "A learner";
  const raw = portfolioJson(data);
  assert.equal(raw.includes("pin"), false);
  assert.equal(raw.includes("reviews"), false);
  assert.equal(raw.includes("age"), false);
  assert.equal(parsePortfolio(raw).name, "A learner");
  assert.throws(() => parsePortfolio(backupJson(data)));
});
test("assignment import validates type and content", () => {
  assert.throws(() => parseAssignment("{}"));
  assert.throws(() =>
    parseAssignment(
      JSON.stringify({
        kind: "buidlcamp-assignment",
        version: 1,
        assignment: { title: "bad" },
      }),
    ),
  );
  assert.equal(
    parseAssignment(
      JSON.stringify({
        kind: "buidlcamp-assignment",
        version: 1,
        assignment: {
          id: "a",
          title: "First",
          lessonIds: ["cc1-sequences"],
          instructions: "Try",
          createdAt: "2026-09-16",
        },
      }),
    ).title,
    "First",
  );
});
test("preview policy precedes untrusted source and denies external data connections", () => {
  const html = previewDocument('<script>fetch("https://example.com")</script>');
  assert.ok(html.indexOf("Content-Security-Policy") < html.indexOf("<script>"));
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
  assert.match(html, /base-uri 'none'/);
});
test("age gates distinguish learners from adults", () => {
  assert.equal(providerEligible("10–12", 13), false);
  assert.equal(providerEligible("13–15", 13), true);
  assert.equal(providerEligible("16–17", 18), false);
  assert.equal(providerEligible("18+", 18), true);
});
test("PIN is salted and verified without plaintext persistence", async () => {
  const a = await pinHash("654321");
  const b = await pinHash("654321");
  assert.notEqual(a, b);
  assert.equal(await checkPin("654321", a), true);
  assert.equal(await checkPin("123456", a), false);
  assert.equal(a.includes("654321"), false);
});
test("activity dates follow the local calendar", () => {
  const d = new Date(2026, 8, 15, 23, 45);
  assert.equal(dayKey(d), "2026-09-15");
});
