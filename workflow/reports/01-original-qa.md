# Original stage: QA

Page: `site/original/index.html` (assets: `original.css`, `original.js`, generated `original-data.js`). Tested 2026-11-05 in Chrome via a local no-cache static server; the page also works from `file://` (data loads by script tag).

| Check | Result |
|---|---|
| Calculations | Script re-run. Sources add up to the total within 0.02 TWh each year; shares to 100% within 0.02 pts; supplied year-on-year changes match a recompute within 0.01 TWh. Every displayed number is bound from `findings.json` via `original-data.js` (21 bound values checked live). |
| Copy vs data | "Gas held roughly steady" was wrong (17.9% → 21.7%); corrected to "gas gained almost four points" before review. |
| Theme | `<html class="theme-data radius-round-2">`; `../shared/data.css` resolves. Tokens not edited. Focus/comparison pair #7745ad / #c25d0b (validated, light). |
| Motion | Shared `motion.css` + `motion.js`; `html.motion` only without reduced motion; hidden start states scoped to `.motion`. |
| Charts | Crossover line chart (crosshair, keyboard ←/→ between years); yearly-change paired bars with total-demand dots (per-year tooltips, focusable); solar vs wind lines; 2000→2025 dumbbells. Legends on every multi-series chart; direct end labels. |
| Console | No errors. |
| Responsive | 1536px and 375px: no page overflow. Wide charts keep a 600px minimum and scroll inside their card on phones, opening at the latest years so the 2025 crossover is visible. |
| Accessibility | Skip link; each chart has a `<desc>`; tooltips also on keyboard focus; `<noscript>` fallback values. |
| Copy | No labels above titles (reviewer preference). |

## Fixes made during QA
- Gas sentence corrected (see above).
- 2025 annotation on the yearly-change chart overlapped 2024's dot → moved to the top with a leader line.
- Phone view opened charts at 2000 → now opens at 2025.

## Test-environment note
In the browser-automation tab, the first page load sometimes cancelled the last deferred script (status 0) with both Python's and a Node static server; a normal reload loaded every file (all 200). The page code was unchanged between the two loads, so this is a tooling artefact, not a page defect.
