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

## Revision 2026-11-05: "current" design
- New shared design guide `site/shared/current.css` loaded last on all four pages (`<html class="theme-data dark theme-current">`). Data tokens still load; the monochrome palette is a reviewer-requested exception, documented in the file.
- Monochrome series are never colour-only: solid / dashed / dotted line styles plus direct labels; source tones always come with a text label.
- Checked in Chrome: all six story scenes step and render; Original, Tested and Dashboard restyled with numbered section labels and meta rows; token overrides verified to win over the Data dark tokens (specificity raised); story buttons legible; phone (375 px): no overflow on any page, top bar on one line, dashboard tabs fit, story steps fit their screens (max 280/330 px).
- Not changed: any number, calculation, filter logic or claim wording beyond the story rewrite.

## Revision 2026-11-05: scroll-craft style effects (reviewer request)
Reviewer asked to apply github.com/nateherkai/scroll-craft (MIT) to the scroll animation, keeping one-flick-one-insight snapping, on the story, Original and Tested pages (dashboard unchanged). Nothing was downloaded or vendored: `site/shared/craft.js` + `craft.css` reimplement its documented behaviour.
- Story: kinetic masked lines on display type, numbers and statements (stagger across 0.62 of the window, smoothstep); cue fades (smoothstep ramp, 2.4vh rise) on labels, notes, legend, links; a clip-path wipe on each scene's chart (iris once, then left, up, right, down, left: never the same twice in a row). Lines split after web fonts load; punctuation stays attached to its word. "Scroll" cue arrow removed (scroll-craft rule).
- Original / Tested: chart wipes scrubbed by scroll position (flow progress, reveal-at 0.04–0.34, reversible); legends and table rows fade in once with 45–70ms stagger.
- Robustness: hidden start states only apply once the effects mount (`html.cr-on`); without JS, with reduced motion, or if a script fails, everything shows. The scroll loop keeps sampling ~0.6s after the last scroll event, then stops.
- Verified in Chrome with real wheel and key input: story lines start at translateY(100%) and rise in sequence; chart wipe values track scroll (0 → 1) and reverse; table rows stagger (last row delay 450ms). Not tested in a browser: reduced-motion mode (by code: no translation or wipes, content shown).
