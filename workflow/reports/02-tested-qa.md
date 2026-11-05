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
