import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const lists = await Promise.all(
    entries.map((e) =>
      e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
    ),
  );
  return lists.flat();
}
const assets = (await files("dist")).filter(
  (p) =>
    !["sw.js", "_headers", "_redirects"].includes(p.split("/").at(-1)) &&
    !p.endsWith(".map"),
);
const hash = createHash("sha256");
for (const asset of assets) hash.update(await readFile(asset));
const cache = `buidlcamp-${hash.digest("hex").slice(0, 12)}`;
await writeFile(
  "dist/sw.js",
  `const CACHE=${JSON.stringify(cache)};const FILES=${JSON.stringify(assets.map((p) => "./" + p.slice(5)))};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('buidlcamp-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.includes('/api/'))return;event.respondWith(caches.open(CACHE).then(async cache=>{const cached=await cache.match(event.request);if(cached)return cached;try{return await fetch(event.request)}catch(error){if(event.request.mode==='navigate')return await cache.match(new URL('./index.html',self.location).href);throw error}}))});`,
);
console.log(`Offline shell prepared: ${assets.length} files.`);
