/**
 * Läuft nach `next build`: trägt alle Dateien des statischen Exports (Ordner out/)
 * in out/sw.js ein, damit der Service Worker sie beim Installieren vorab speichert.
 *
 * Die Version ist ein Hash über alle Dateien. Ändert sich etwas an der App,
 * bekommt der Service Worker eine neue Version und tauscht seinen Cache aus.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
const SKIP = new Set(["sw.js", "serve.json", "404.html"]);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const path = join(dir, item.name);
    return item.isDirectory() ? walk(path) : [path];
  });
}

const files = walk(OUT)
  .map((path) => relative(OUT, path).split(sep).join("/"))
  .filter((path) => !SKIP.has(path) && !path.startsWith("404/") && !path.startsWith("_not-found/"))
  .sort();

const hash = createHash("sha256");
for (const file of files) hash.update(file).update(readFileSync(join(OUT, file)));
const version = hash.digest("hex").slice(0, 12);

// out/app/generator/index.html → /app/generator/ (so ruft der Browser die Seite auf)
const urls = files.map((file) => "/" + file.replace(/(^|\/)index\.html$/, "$1"));

const swPath = join(OUT, "sw.js");
const sw = readFileSync(swPath, "utf8")
  .replace('const VERSION = "dev";', `const VERSION = "${version}";`)
  .replace("const PRECACHE_URLS = [];", `const PRECACHE_URLS = ${JSON.stringify(urls, null, 2)};`);

if (!sw.includes(version)) throw new Error("Platzhalter in public/sw.js nicht gefunden");
writeFileSync(swPath, sw);
console.log(`Service Worker: ${urls.length} Dateien vorgemerkt, Version ${version}`);
