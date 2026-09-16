import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { complete, providerRequest } from "./server/ai.mjs";
const root = resolve(fileURLToPath(new URL("./dist", import.meta.url)));
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json",
};
const json = (res, status, value) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(value));
};
export function createApp(transport = fetch) {
  const attempts = new Map();
  let active = 0;
  return createServer(async (req, res) => {
    // The companion is local-only. Reject rebinding hosts before serving any content.
    if (
      !/^(127\.0\.0\.1|localhost|\[::1\])(?::\d{1,5})?$/.test(
        req.headers.host ?? "",
      )
    )
      return json(res, 403, { error: "Use the local companion address." });
    if (req.url === "/api/ai") {
      if (req.method !== "POST") return json(res, 405, { error: "Use POST." });
      const origin = req.headers.origin;
      const loopback = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
        req.socket.remoteAddress,
      );
      if (
        !loopback ||
        !origin ||
        origin !== `http://${req.headers.host}` ||
        req.headers["x-buidlcamp-request"] !== "adult-coach"
      )
        return json(res, 403, {
          error:
            "API demonstrations require the local companion and a same-origin request.",
        });
      if (req.headers["content-type"] !== "application/json")
        return json(res, 415, { error: "Use JSON." });
      const now = Date.now();
      const recent = (attempts.get("local") ?? []).filter(
        (t) => now - t < 60000,
      );
      if (recent.length >= 10 || active >= 2)
        return json(res, 429, {
          error: "Please wait before sending another request.",
        });
      attempts.set("local", [...recent, now]);
      active++;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      res.on("close", () => {
        if (!res.writableEnded) controller.abort();
      });
      try {
        const chunks = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 64000) {
            json(res, 413, { error: "Request too large." });
            return;
          }
          chunks.push(chunk);
        }
        const raw = Buffer.concat(chunks).toString("utf8");
        let input;
        try {
          input = JSON.parse(raw);
          providerRequest(input);
        } catch (err) {
          return json(res, 400, {
            error: err instanceof SyntaxError ? "Invalid JSON." : err.message,
          });
        }
        try {
          const text = await complete(input, transport, controller.signal);
          return json(res, 200, { text });
        } catch (err) {
          return json(res, 502, {
            error:
              err.name === "AbortError" || controller.signal.aborted
                ? "The provider took too long. Your draft is saved; try again."
                : err instanceof SyntaxError
                  ? "The provider returned an unreadable response."
                  : err.message,
          });
        }
      } catch {
        if (!res.destroyed && !res.writableEnded)
          json(res, 400, { error: "Request could not be read." });
      } finally {
        clearTimeout(timeout);
        active--;
      }
      return;
    }
    if (req.url?.startsWith("/api/"))
      return json(res, 404, { error: "Unknown endpoint." });
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      return res.end();
    }
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      const file = resolve(
        root,
        `.${pathname === "/" ? "/index.html" : pathname}`,
      );
      if (!file.startsWith(root + sep)) {
        res.writeHead(403);
        return res.end();
      }
      if (!(await stat(file)).isFile()) {
        res.writeHead(404);
        return res.end();
      }
      const data = await readFile(file);
      res.writeHead(200, {
        "Content-Type": mime[extname(file)] ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Cache-Control": "no-cache",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT ?? 4174);
  createApp().listen(port, "127.0.0.1", () =>
    console.log(`BuidlCamp companion: http://127.0.0.1:${port}`),
  );
}
