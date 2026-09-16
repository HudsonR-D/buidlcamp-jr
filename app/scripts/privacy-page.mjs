import { readFile, writeFile } from "node:fs/promises";
const escape = (text) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const lines = (await readFile("../PRIVACY.md", "utf8")).trim().split(/\r?\n/);
let body = "",
  paragraph = [];
function flush() {
  if (paragraph.length) {
    body += "<p>" + paragraph.join(" ") + "</p>\n";
    paragraph = [];
  }
}
for (const line of lines) {
  const heading = /^(#{1,2}) (.+)$/.exec(line);
  if (heading) {
    flush();
    const level = heading[1].length;
    body += "<h" + level + ">" + escape(heading[2]) + "</h" + level + ">\n";
  } else if (!line.trim()) {
    flush();
  } else paragraph.push(escape(line));
}
flush();
await writeFile(
  "public/privacy.html",
  '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BuidlCamp privacy</title><script src="./theme.js"></script><style>body{font:1rem/1.65 system-ui,sans-serif;max-width:52rem;margin:2rem auto;padding:0 1.2rem;color:#0d1932;background:#fff}a{color:#006071}a:focus-visible{outline:3px solid currentColor;outline-offset:4px}h1,h2{line-height:1.25}html[data-theme=dark] body{background:#0e1724;color:#eef4fa}html[data-theme=dark] a{color:#8dd9ce}@media print{html body{color:#000;background:#fff}html a{color:#000}}</style></head><body><main><a href="./">Back to BuidlCamp</a>' +
    body +
    "</main></body></html>\n",
);
console.log("Privacy page generated from PRIVACY.md.");
