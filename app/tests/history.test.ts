import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clearHistory,
  localHistory,
  saveLocalCheckpoint,
} from "../src/workspace/history.ts";
import { bytes, makeCheckpoint } from "../src/workspace/checkpoints.ts";
const project = (id: string, code = "hello") => ({
  id,
  code,
  name: "Test",
  templateId: "test",
  updatedAt: new Date().toISOString(),
  reflection: "",
  checks: [],
});
test("local history retains 20 versions per project, preserves other projects, and can clear one or all", async () => {
  await clearHistory();
  for (let i = 0; i < 24; i++) {
    const c = makeCheckpoint(project("one"), `Edit ${i}`);
    c.createdAt = new Date(1700000000000 + i * 1000).toISOString();
    await saveLocalCheckpoint(c);
  }
  await saveLocalCheckpoint(makeCheckpoint(project("two"), "Another project"));
  const records = await localHistory("one");
  assert.equal(records.length, 20);
  assert.equal(records[0].message, "Edit 23");
  assert.equal(records[19].message, "Edit 4");
  await clearHistory("one");
  assert.equal((await localHistory()).length, 1);
  await clearHistory();
  assert.equal((await localHistory()).length, 0);
});
test("combined retention stays within 50 MB and evicts oldest checkpoints first", async () => {
  await clearHistory();
  const code = "🌱".repeat(245000);
  for (let i = 0; i < 55; i++) {
    const c = makeCheckpoint(project("p" + i, code), `Version ${i}`);
    c.createdAt = new Date(1700000000000 + i * 1000).toISOString();
    await saveLocalCheckpoint(c);
  }
  const records = await localHistory();
  assert.ok(records.reduce((n, c) => n + bytes(c), 0) <= 50 * 1024 * 1024);
  assert.ok(records.length < 55);
  assert.equal(records[0].project.id, "p54");
  assert.equal(
    records.some((c) => c.project.id === "p0"),
    false,
  );
  await clearHistory();
});
test("an invalid checkpoint never replaces existing local history", async () => {
  await clearHistory();
  await saveLocalCheckpoint(makeCheckpoint(project("safe"), "Kept"));
  const bad = makeCheckpoint(project("safe"), "Bad");
  delete (bad as Partial<typeof bad>).id;
  await assert.rejects(() => saveLocalCheckpoint(bad), /valid/);
  assert.equal((await localHistory())[0].message, "Kept");
  await clearHistory();
});
