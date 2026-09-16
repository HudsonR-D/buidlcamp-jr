const { chromium } = require("playwright");
const { AxeBuilder } = require("@axe-core/playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
let server, browser;
(async () => {
  const { createApp } = await import("../server.mjs");
  server = createApp();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  await page.route("**/sw.js", (r) => r.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const findings = [];
  await fs.mkdir("test-results", { recursive: true });
  async function audit(view) {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    findings.push({
      view,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          html: n.html,
          summary: n.failureSummary,
        })),
      })),
    });
    await fs.writeFile(
      "test-results/accessibility.json",
      JSON.stringify(findings, null, 2),
    );
  }
  await audit("setup");
  await page.getByRole("button", { name: "Create my workspace" }).click();
  for (const colorScheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme });
    await page.waitForFunction(
      (theme) => document.documentElement.dataset.theme === theme,
      colorScheme,
    );
    for (const name of [
      "Home",
      "Learning paths",
      "Project studio",
      "AI practice",
      "Credentials",
      "Project versions",
      "Educator desk",
      "Settings",
    ]) {
      await page
        .getByRole("navigation")
        .getByRole("link", { name, exact: true })
        .click();
      await page.getByRole("heading", { level: 1 }).waitFor();
      await audit(name + " " + colorScheme);
    }
  }
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Project studio", exact: true })
    .click();
  await page.getByRole("button", { name: "Make a project" }).first().click();
  const editor = page.getByRole("textbox", {
    name: "Project code",
    exact: true,
  });
  await editor.click();
  await editor.press("Control+a");
  await page.keyboard.insertText(
    '<h1>Debug exercise</h1><script>throw Error("Try fixing this exercise")</script>',
  );
  await page.waitForFunction(() =>
    JSON.parse(
      localStorage.getItem("buidlcamp-workspace-v1"),
    ).projects[0].code.includes("Try fixing this exercise"),
  );
  await page.getByRole("button", { name: "Run preview" }).click();
  await page
    .locator(".notice.error")
    .getByText("Try fixing this exercise", { exact: false })
    .waitFor();
  await audit("studio with recoverable error");
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  assert.equal(
    await page.locator('iframe[title="Project preview"]').count(),
    0,
  );
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Settings", exact: true })
    .click();
  await page.setViewportSize({ width: 320, height: 800 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.keyboard.press("Control+Home");
  await page
    .getByRole("link", { name: "Skip to content", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  const focused = await page.evaluate(() => document.activeElement.id);
  assert.equal(focused, "content");
  await fs.mkdir("test-results", { recursive: true });
  await fs.writeFile(
    "test-results/accessibility.json",
    JSON.stringify(findings, null, 2),
  );
  const violations = findings.filter((f) => f.violations.length);
  assert.deepEqual(violations, []);
  console.log(
    "PASS: WCAG A/AA automated checks across all main views and both themes; preview error recovery; 320px reflow; keyboard skip link. Physical VoiceOver and human accessibility review remain separate.",
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
