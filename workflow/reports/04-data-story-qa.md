# Data story: QA

Page: `site/data-story/index.html` (assets: `story.css` from the framework template + additions, `story.js` adapted from the template controller, generated `story-data.js`). Tested 2026-11-05 in Chrome via a local no-cache static server.

| Check | Result |
|---|---|
| Calculations | All numbers bound from `story-data.js` (built from approved findings + pressure test): 31,925 TWh, 2.1×, 76%, 855, 879, 33.5 vs 33.2%, 40.9% (2007), 19.6%, 17.3%, 0.44%, 2001, gap series −19.4 → +0.3 pts, 11×, 0.1%, 2015 and 2019. |
| Template format | Dark full-viewport scrollytelling; one insight per snapped viewport; copy column beside sticky stage; visuals dissolve and replay per step (radial, dot grid, crossing lines, bars, mini line + number panel, radial); progress line; lavender/lime; Archivo/Newsreader; signature. |
| Interaction | Keyboard ↓ stepped through all six insights; each visual played to its final state. Wheel/touch use the template's one-gesture-one-step controller. |
| Theme | `theme-data dark radius-round-2`; `../shared/data.css` resolves; shared motion layer loaded (its `.story` paint and duplicate progress bar overridden, as in the template adaptation). |
| Reduced motion | Checked in code, not in a browser: without `html.motion`, every insight renders its final state with no dissolve; without data, dimmed-step styling is removed so text reads fully. |
| Responsive | 375px: visual above copy; no overflow; each step's copy fits its screen (tightest 306/305 px). |
| Accessibility | Each visual has an aria-label with its numbers; animated numbers are aria-hidden with sr-only equivalents. |
| Console | No errors. |

## Stitching (all four pages)
- Same top bar (⚡ World electricity → Data story) and native `<details>` dropdown on Original, Tested, Dashboard and Data story, current page marked `class="active" aria-current="page"`.
- `../shared/topbar.css` (unedited) + `../shared/topbar-brand.css` (Data primary; keeps the dropdown visible on narrow Original/Tested pages).
- Verified: 16/16 links return 200 and open the intended page; summary label and current state correct on all four; bar 72 px at the same position at 375 px; no page overflow. Section links on Original/Tested kept beside the dropdown. Approved page content untouched apart from the top-bar swap and two stylesheet links.

## Fixes made during QA
- Hero radial used square-root spoke lengths (from the template), which made 2000 and 2025 look similar; switched to linear so the doubling shows.

## Test-environment note
As on earlier pages, the automated browser sometimes cancelled the page's last script on load; the identical file loads normally when requested again. Scenes were verified with the script re-requested; page code unaffected.
