// Release behaviors against a local build. GitHub transport below is a fixture, never a live account.
const { chromium, firefox, webkit } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const engine = process.env.BUIDLCAMP_BROWSER || "chromium";
let server, browser;
(async () => {
  const { createApp } = await import("../server.mjs");
  server = createApp();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const output = path.resolve("test-results", engine);
  await fs.mkdir(output, { recursive: true });
  browser = await { chromium, firefox, webkit }[engine].launch({
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    colorScheme: "light",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/sw.js", (r) => r.abort());
  await page.goto(base);
  await page.getByRole("button", { name: "Create my workspace" }).click();
  const nav = async (name) =>
    page
      .getByRole("navigation")
      .getByRole("link", { name, exact: true })
      .click();
  await nav("Project studio");
  await page
    .locator(".starter")
    .filter({
      has: page.getByRole("heading", { name: "Pixel painter", exact: true }),
    })
    .getByRole("button", { name: "Make a project" })
    .click();
  const editor = page.getByRole("textbox", {
    name: "Project code",
    exact: true,
  });
  await editor.waitFor();
  await editor.click();
  await editor.press("Control+End");
  await page.keyboard.insertText("\n<!-- theme undo marker -->");
  const position = () => {
    const s = getSelection();
    const r = document.createRange();
    r.selectNodeContents(document.querySelector(".cm-content"));
    r.setEnd(s.anchorNode, s.anchorOffset);
    return r.toString().length;
  };
  const selection = await page.evaluate(position);
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForFunction(
    () => document.documentElement.dataset.theme === "dark",
  );
  assert.equal(await page.evaluate(position), selection);
  await editor.press("Control+z");
  assert.equal((await editor.innerText()).includes("theme undo marker"), false);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: output + "/studio-dark.png",
    fullPage: true,
    animations: "disabled",
  });
  await nav("Settings");
  await page.getByLabel("Appearance").selectOption("light");
  await page.reload();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  await page.getByLabel("Appearance").selectOption("dark");
  await page.reload();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.getByLabel("Appearance").selectOption("system");
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForFunction(
    () => document.documentElement.dataset.theme === "light",
  );
  await nav("Project versions");
  await page
    .getByLabel("What changed in this version?")
    .fill("My first private checkpoint");
  await page
    .getByRole("button", { name: "Review checkpoint", exact: true })
    .click();
  const dl = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download checkpoint", exact: true })
    .click();
  const file = output + "/checkpoint.json";
  await (await dl).saveAs(file);
  await page
    .getByRole("button", { name: "Save on this device", exact: true })
    .click();
  await page
    .getByText("Checkpoint saved on this device.", { exact: true })
    .waitFor();
  const checkpoint = JSON.parse(await fs.readFile(file, "utf8"));
  assert.deepEqual(
    Object.keys(checkpoint).sort(),
    [
      "createdAt",
      "id",
      "kind",
      "message",
      "milestones",
      "project",
      "version",
    ].sort(),
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Connect GitHub", exact: true })
      .count(),
    0,
  );
  await page
    .getByRole("button", { name: "Compare or restore", exact: true })
    .click();
  await page
    .getByText("The project source is unchanged.", { exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Restore this project locally", exact: true })
    .click();
  await page
    .getByText("Restored locally with a new checkpoint.", { exact: false })
    .waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Compare or restore", exact: true })
      .count(),
    3,
  );
  const foreign = {
    ...checkpoint,
    id: "import-v1",
    project: {
      ...checkpoint.project,
      id: "other-device",
      name: "Other device",
      code: '<script>parent.postMessage("UNWANTED-RUN","*")</script>',
    },
  };
  await page.evaluate(() => {
    window.__unexpectedRun = false;
    window.addEventListener("message", (e) => {
      if (e.data === "UNWANTED-RUN") window.__unexpectedRun = true;
    });
  });
  await page.getByLabel("Import checkpoint file").setInputFiles({
    name: "checkpoint.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(foreign)),
  });
  await page
    .getByRole("button", { name: "Import this project", exact: true })
    .click();
  await page
    .getByText(
      "Project imported. Open it in the studio when ready; its code has not run.",
      { exact: true },
    )
    .waitFor();
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("buidlcamp-workspace-v1")).projects[0]
          .id,
    ),
    "other-device",
  );
  assert.equal(await page.evaluate(() => window.__unexpectedRun), false);
  const hostile = {
    ...foreign,
    project: { ...foreign.project, id: "../../.env" },
  };
  await page.getByLabel("Import checkpoint file").setInputFiles({
    name: "hostile.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(hostile)),
  });
  await page
    .getByText("The project ID or size is invalid.", { exact: true })
    .waitFor();
  await nav("Home");
  await page
    .getByRole("button", { name: "Open capstone", exact: true })
    .first()
    .click();
  await page.getByLabel("Link your project").selectOption("other-device");
  await page
    .getByLabel("Explain your tests, evidence, and one improvement")
    .fill(
      "I tried both inputs, tested the reset, and improved the instructions.",
    );
  await page
    .getByRole("button", { name: "Record my capstone", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Capstone recorded", exact: true })
    .waitFor();
  await page.keyboard.press("Escape");
  await nav("Project studio");
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  for (const label of ["Logic kick", "Stadium rules", "Pixel animation"]) {
    if (label !== "Logic kick")
      await page.getByRole("button", { name: label, exact: true }).click();
    await page
      .getByRole("button", {
        name: "Keep this experiment as a project",
        exact: true,
      })
      .click();
    await page
      .getByRole("link", { name: "Open your editable project", exact: true })
      .click();
    assert.equal(
      await page.locator('iframe[title="Project preview"]').count(),
      0,
    );
    await page.getByRole("button", { name: "Run preview" }).click();
    await page
      .frameLocator('iframe[title="Project preview"]')
      .locator("h1")
      .waitFor();
    await page.getByRole("button", { name: "Arcade", exact: true }).click();
  }
  // Fixtures exercise GitHub UI sequencing, per-save review, and conflict preservation.
  let writes = 0;
  await page.route("**/api/**", async (route) => {
    const req = route.request(),
      url = new URL(req.url());
    let result = {};
    let status = 200;
    if (url.pathname === "/api/status")
      result = {
        configured: true,
        authenticated: true,
        csrf: "fixture-csrf",
        login: "fixture",
        role: "learner",
      };
    else if (url.pathname === "/api/github/repos")
      result = {
        repositories: [
          {
            version: 1,
            id: 1,
            owner: "fixture",
            name: "private-learning",
            branch: "main",
          },
        ],
      };
    else if (url.pathname === "/api/github/projects")
      result = { head: "a".repeat(40), projects: [] };
    else if (
      url.pathname === "/api/github/checkpoint" &&
      req.method() === "POST"
    ) {
      writes++;
      const sent = req.postDataJSON();
      assert.equal(sent.base, "a".repeat(40));
      assert.equal(req.headers()["x-csrf-token"], "fixture-csrf");
      assert.equal(JSON.stringify(sent).includes("pin"), false);
      status = 409;
      result = {
        error:
          "Repository changed. Compare your local checkpoint with the latest version before saving again.",
      };
    }
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(result),
    });
  });
  await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem("buidlcamp-workspace-v1"));
    d.age = "13–15";
    localStorage.setItem("buidlcamp-workspace-v1", JSON.stringify(d));
  });
  await page.reload();
  await nav("Project versions");
  await page
    .getByRole("button", { name: "Load my private repositories", exact: true })
    .click();
  await page.getByLabel("Private repository").selectOption("1");
  await page
    .getByText("Latest revision: aaaaaaaaaa", { exact: false })
    .waitFor();
  await page
    .getByLabel("What changed in this version?")
    .fill("Reviewed fixture upload");
  await page
    .getByRole("button", { name: "Review checkpoint", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: "Save version to GitHub", exact: true })
      .isEnabled(),
    false,
  );
  await page
    .getByRole("checkbox", {
      name: "I have reviewed this content",
      exact: false,
    })
    .check();
  await page
    .getByRole("button", { name: "Save version to GitHub", exact: true })
    .click();
  await page.getByText("Repository changed.", { exact: false }).waitFor();
  assert.equal(writes, 1);
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page
    .getByRole("button", { name: "Review checkpoint", exact: true })
    .click();
  await page
    .getByRole("checkbox", {
      name: "I have reviewed this content",
      exact: false,
    })
    .check();
  assert.equal(
    await page
      .getByRole("button", { name: "Save version to GitHub", exact: true })
      .isEnabled(),
    false,
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", {
      name: "Load latest version to resolve conflict",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Keep my local draft for a new reviewed save",
      exact: true,
    })
    .click();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Review checkpoint", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("checkbox", {
        name: "I have reviewed this content",
        exact: false,
      })
      .isChecked(),
    false,
  );
  await page.keyboard.press("Escape");
  for (const size of [
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    for (const colorScheme of ["dark", "light"]) {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.screenshot({
        path: output + `/versions-${colorScheme}-${size.width}.png`,
        fullPage: true,
      });
    }
  }
  await page.emulateMedia({ media: "print" });
  const bg = await page
    .locator("body")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  assert.ok(["rgb(255, 255, 255)", "rgba(0, 0, 0, 0)"].includes(bg), bg);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: themes survive reload; system changes preserve editor selection and undo; inert checkpoint imports keep identity; malformed IDs fail; local restore keeps history; capstones and all lab exports work; GitHub reviews and conflicts preserve local work; responsive themes and light print. GitHub uses fixture transport.",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (server) {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    }
    await browser?.close();
  });
