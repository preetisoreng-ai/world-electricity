// Renders the infographic at every platform size and reports QA (overflow, 15–85% box, text sizes).
// Needs the project served at http://127.0.0.1:8793 (any static server rooted at the project folder).
// Run from the project root:  node artifacts/infographic/tools/render.mjs
import { execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const url = "http://127.0.0.1:8793/artifacts/infographic/index.html";
const sizes = {
  "16x9": [1920, 1080],
  "4x5": [1080, 1350],
  "1x1": [1080, 1080],
  "9x16": [1080, 1920],
};
let fail = false;
for (const [name, [w, h]] of Object.entries(sizes)) {
  const base = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--virtual-time-budget=6000",
    `--window-size=${w},${h}`,
  ];
  execFileSync(
    chrome,
    [...base, `--screenshot=${path.join(dir, `infographic-${name}.png`)}`, url],
    { stdio: "ignore" }
  );
  // --dump-dom loses 96 px of height to window chrome; add it back so the page sees the real canvas
  const qaBase = base.map((a) =>
    a.startsWith("--window-size") ? `--window-size=${w},${h + 96}` : a
  );
  const dom = execFileSync(chrome, [...qaBase, "--dump-dom", url + "?qa"], { encoding: "utf8" });
  const qa = (dom.match(/data-qa="([^"]*)"/) || [, "no QA result"])[1];
  if (!qa.startsWith("OK")) fail = true;
  console.log(`infographic-${name}.png ${w}x${h}  ${qa}`);
}
process.exitCode = fail ? 1 : 0;
