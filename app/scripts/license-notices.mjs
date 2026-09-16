import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
let notices =
  "BuidlCamp third-party notices\n\nThe platform is MIT licensed. These runtime dependencies retain their own licenses and copyright notices. Learner projects are not automatically licensed by BuidlCamp.\n";
const inventory = [];
for (const [location, pkg] of Object.entries(lock.packages)) {
  if (!location || pkg.dev || pkg.optional) continue;
  const dir = resolve(location),
    metadata = JSON.parse(await readFile(dir + "/package.json", "utf8"));
  const files = (await readdir(dir)).filter((f) =>
    /^(licen[cs]e|copying|notice)(\.|$)/i.test(f),
  );
  if (!files.length) throw Error("Review missing license: " + metadata.name);
  notices +=
    "\n" +
    "=".repeat(72) +
    "\n" +
    metadata.name +
    " " +
    metadata.version +
    " — " +
    metadata.license +
    "\n";
  for (const file of files)
    notices += "\n" + (await readFile(dir + "/" + file, "utf8")) + "\n";
  inventory.push({
    name: metadata.name,
    version: metadata.version,
    license: metadata.license,
    source:
      metadata.repository?.url ??
      metadata.repository ??
      metadata.homepage ??
      null,
  });
}
await writeFile("public/licenses.txt", notices.trimEnd() + "\n");
await writeFile(
  "../THIRD_PARTY_NOTICES.md",
  "# Third-party software\n\nRuntime license texts ship in [app/public/licenses.txt](app/public/licenses.txt). Dependency versions and integrity hashes are fixed in [app/package-lock.json](app/package-lock.json). Build and test tools are development dependencies and remain governed by their upstream licenses. Regenerate with `cd app && node scripts/license-notices.mjs`.\n\n| Package | Version | License |\n|---|---|---|\n" +
    inventory
      .map((p) => `| ${p.name} | ${p.version} | ${p.license} |`)
      .join("\n") +
    "\n",
);
console.log("Retained licenses for " + inventory.length + " runtime packages.");
