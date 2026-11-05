// Independent recompute of the Original's headline values from the raw CSV, with its own parser.
// Run from project root: node workflow/analysis/recompute_check.mjs
import { readFileSync, writeFileSync } from "node:fs";

const RAW =
  "data/raw/ember_yearly_electricity-generation - All electricity sources - World - breakdown.csv";
const text = readFileSync(RAW, "utf8").replace(/^﻿/, "");
function parse(t) {
  const rows = [];
  let row = [],
    f = "",
    q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"' && t[i + 1] === '"') {
        f += '"';
        i++;
      } else if (c === '"') q = false;
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(f);
      f = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      row.push(f);
      f = "";
      if (row.length > 1) rows.push(row);
      row = [];
    } else f += c;
  }
  if (f || row.length) {
    row.push(f);
    rows.push(row);
  }
  return rows;
}
const [head, ...body] = parse(text);
const ix = (n) => head.indexOf(n);
const T = {};
for (const r of body) (T[+r[ix("date")]] ??= {})[r[ix("series")]] = +r[ix("generation_twh")];
const RENEW = ["Hydro", "Wind", "Solar", "Bioenergy", "Other renewables"];
const FOSSIL = ["Coal", "Gas", "Other fossil"];
const sum = (y, g) => g.reduce((a, s) => a + T[y][s], 0);
const y = 2025,
  p = 2024;
const tot = (yy) => T[yy]["Total generation"];
const clean = (yy) => sum(yy, RENEW) + T[yy]["Nuclear"];

const mine = {
  renewShare: sum(y, RENEW) / tot(y),
  coalShare: T[y].Coal / tot(y),
  dTotal: tot(y) - tot(p),
  dClean: clean(y) - clean(p),
  dFossil: sum(y, FOSSIL) - sum(p, FOSSIL),
  dSolar: T[y].Solar - T[p].Solar,
  solarShareOfGrowth: (T[y].Solar - T[p].Solar) / (tot(y) - tot(p)),
  solar: T[y].Solar,
  wind: T[y].Wind,
  fossilShare: sum(y, FOSSIL) / tot(y),
  totalX: tot(y) / tot(2000),
  solarX2015: T[y].Solar / T[2015].Solar,
  peakCoalShareValue: Math.max(...Object.keys(T).map((k) => T[k].Coal / tot(k))),
  dCoal: T[y].Coal - T[p].Coal,
};
const F = JSON.parse(readFileSync("data/processed/findings.json", "utf8"));
const L = F.latest;
const theirs = {
  renewShare: L.renewShare,
  coalShare: L.coalShare,
  dTotal: L.dTotal,
  dClean: L.dClean,
  dFossil: L.dFossil,
  dSolar: L.dSolar,
  solarShareOfGrowth: L.solarShareOfGrowth,
  solar: L.solar,
  wind: L.wind,
  fossilShare: L.fossilShare,
  totalX: F.growth.totalX,
  solarX2015: F.growth.solarX2015,
  peakCoalShareValue: F.peakCoalShareValue,
  dCoal: L.dCoal,
};
const lines = Object.keys(mine).map((k) => ({
  k,
  node: mine[k],
  py: theirs[k],
  ok: Math.abs(mine[k] - theirs[k]) < 1e-9,
}));
const pass = lines.filter((l) => l.ok).length;
const report =
  lines.map((l) => `${l.ok ? "MATCH" : "DIFF "} ${l.k}: node=${l.node} python=${l.py}`).join("\n") +
  `\n\n${pass} of ${lines.length} match\n`;
writeFileSync("workflow/reports/02-recompute-check.txt", report);
console.log(report);
if (pass !== lines.length) process.exit(1);
