# Dashboard stage: QA

Page: `site/dashboard/index.html` (assets: `dashboard.css` from the house dashboard base + additions, `dashboard.js`, generated `dashboard-data.js`). Tested 2026-11-05 in Chrome via a local no-cache static server.

| Check | Result |
|---|---|
| Data | `build_dashboard_data.py` packages TWh and kWh per person for 9 sources, the total and 5 groups; measure catalog in `03-measure-catalog.md`. |
| Filter calculations | Default 2025 vs 2024, share: renewables 33.5% (+1.8 pts), coal 33.2% (−1.1), clean 42.3% (+1.7), fossil 57.7% (−1.7). TWh: renewables +849, coal −45, clean +879, fossil −24 (match Tested). 2015 vs 2014: coal −323 TWh, fossil −7 (match precedents). kWh mode works. |
| Invalid comparisons | Comparison list only offers earlier years; if the chosen comparison becomes invalid it falls back to the year before; 2000 has no comparison (deltas hidden, change chart shows a prompt). No NaN anywhere after switching 2000 ↔ 2025 ↔ 2005. |
| State / reset | Filter state names every change; Reset restores 2025 vs 2024, share, "Renewables vs coal" and disables itself. |
| Latest year | "may be revised" tag on every 2025 KPI and table row; notice gives the 95 TWh / 0.44% sensitivity when 2025 is selected. |
| Charts | Trend (4 fixed views, 3-colour palette validated for all pairs incl. colour-blindness; colours fixed per view slot); selected/comparison year markers; crosshair with keyboard ←/→; change by source; mix dumbbells. |
| Table | Year × 13 series in the selected measure, selected year highlighted; CSV download of the table (built in the browser) and link to the processed CSV. Download button not clicked in testing, to avoid saving a file. |
| Definitions | Info tooltips on KPIs and cards; Definitions tab. |
| Dropdown carets | Inside every control at 1536px and 375px (reserved padding). |
| Responsive | No page overflow at 375px; filters stack; trend chart scrolls inside its card, opening at the latest years; view buttons wrap below the title. |
| Console | No errors. |
| Copy | No labels above titles. |

## Fixes made during QA
- Comparison year could become 1999 after visiting 2000 → values showed NaN. Fixed: invalid comparison years fall back to the nearest earlier year.
- Year-marker labels for adjacent years overlapped → stacked.
- "−0.0 pts" → "±0.0 pts" when the rounded change is zero.
- Negative change labels ran into source names → placed beside the zero line.
- Filter state no longer lists an impossible comparison year; mix title reads "Mix, 2000" when there is no comparison.
- View buttons wrap on phones.

## Test-environment note
As on the earlier pages, the automated browser cancelled the page's last script on first load; the identical file loads normally when requested again. Tested with the script re-requested; page code unaffected.
