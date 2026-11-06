// Generates the artifacts' data and style inputs from their sources of truth. Never edit outputs by hand.
//   infographic/content.js, video/assets/content.js  ← ../content.json (locked content)
//   video/assets/current-tokens.css                  ← ../../site/shared/current.css (design-guide tokens, unchanged)
// Also checks the content lock: content.json must match content.lock, and source changes are reported (never applied).
// Run from anywhere:  node artifacts/tools/build-assets.mjs
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const A = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const project = path.resolve(A, "..");
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const lock = JSON.parse(fs.readFileSync(path.join(A, "content.lock"), "utf8"));
if (sha(path.join(A, "content.json")) !== lock.content_sha256)
  throw new Error(
    "content.json differs from content.lock: content may only change through an approved refresh"
  );
const changed = Object.entries(lock.sources)
  .filter(([f, h]) => sha(path.join(project, f)) !== h)
  .map(([f]) => f);
if (changed.length)
  console.warn(
    "NOTE: sources changed since the lock (content kept as locked):",
    changed.join(", ")
  );

const content = JSON.parse(fs.readFileSync(path.join(A, "content.json"), "utf8"));
const js = `// GENERATED from artifacts/content.json v${content.version} by artifacts/tools/build-assets.mjs — do not edit\nwindow.EM_CONTENT = ${JSON.stringify(content, null, 2)};\n`;
const targets = [path.join(A, "infographic", "content.js")];
if (fs.existsSync(path.join(A, "video", "assets")))
  targets.push(path.join(A, "video", "assets", "content.js"));
for (const t of targets) {
  fs.mkdirSync(path.dirname(t), { recursive: true });
  fs.writeFileSync(t, js);
}

// Design-guide tokens for the video (the film cannot load ../../site paths at render time)
const css = fs.readFileSync(path.join(project, "site", "shared", "current.css"), "utf8");
const tokens = [...css.matchAll(/^\s*(--(?:cur|src|ser)-[a-z0-9-]+)\s*:\s*([^;]+);/gm)].map(
  ([, k, v]) => `  ${k}: ${v.trim()};`
);
if (tokens.length < 15) throw new Error("design-guide tokens not found in site/shared/current.css");
if (fs.existsSync(path.join(A, "video", "assets")))
  fs.writeFileSync(
    path.join(A, "video", "assets", "current-tokens.css"),
    `/* GENERATED from site/shared/current.css by artifacts/tools/build-assets.mjs — do not edit */\n:root {\n${tokens.join("\n")}\n}\n`
  );
console.log(
  `content v${content.version} → ${targets.map((t) => path.relative(A, t)).join(", ")}; ${tokens.length} design tokens`
);
