# Tested stage: QA

Page: `site/tested/index.html` (assets: `base.css` copied from Original, `tested.css`, `tested.js`, generated `tested-data.js`). Tested 2026-11-05 in Chrome via a local no-cache static server.

| Check | Result |
|---|---|
| Calculations | `pressure_test.py` re-run; `recompute_check.mjs` 14/14. All page numbers bound from `tested-data.js`. |
| Theme / motion | `theme-data radius-round-2`; `../shared/data.css` resolves; shared motion layer loaded; reveals only under `html.motion`. |
| Interaction | Revision slider (native range, keyboard): 0% → lead 95 TWh; 0.4% → 9 TWh; 0.5% → "Crossover undone". Live text readout (`aria-live`). Hydro-scenario and coal bars have focusable per-bar tooltips. |
| Charts | Composition bars (hydro / other / coal); 25 hydro scenarios (1 fails: 2001); coal yearly change with 2015/2019/2025 highlighted. Legends on all. |
| Responsive | 1536px and 375px: no page overflow; wide bar charts scroll in their card and open at the latest years; composition labels enlarged on phones. |
| Accessibility | Tables with captions; chart `<desc>`s; status shown as text chips. |
| Console | No errors. |
| Copy | No labels above titles. |

## Fixes made during QA
- Precedent wording was wrong ("rose again the next year both times"): after 2019, fossil fell again in 2020 (pandemic). Corrected everywhere.
- Negative percentages now use a true minus sign.
- Composition chart text enlarged on phones.

## Test-environment note
As on the Original page, the automated browser cancelled the page's last script request on load (≈1 s, status 0); the same file loads normally when requested again (200 in 6 ms), and the server returns it correctly. The page was tested with the script re-requested; its code is unchanged by this.

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
