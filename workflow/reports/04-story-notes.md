# Data story: notes

**Takeaway (one sentence):** In 2025 clean power grew faster than the world's demand for electricity, mostly through solar, and renewables (led by hydro) edged past coal for the first time, by a margin small enough to reverse.

**Arc:** change over time with an uncertainty turn: context → what met new demand → the crossover → what "renewables" is made of → how thin the lead is → implication and limit.

Precedence: narrative from the approved Original (headline crossover, clean growth vs demand, solar); guardrails from the approved Tested stage (crossover qualified: 95 TWh, 0.44%, hydro-dependent, dry-year 2001; fossil fall qualified; "coal peaked" revised; "replacing fossil" and "wind+solar beat coal" rejected); definitions from the approved Dashboard catalog (renewables, clean, fossil groupings; latest year may be revised).

| # | Scene | Question | Visual (template form) | Claims | Guardrail applied |
|---|---|---|---|---|---|
| 1 | The power shift | How much electricity does the world make? | Radial, one spoke per year (linear length) | C8 | — |
| 2 | 76% from solar | What met 2025's new demand? | 100-dot unit grid (76 solar / 24 other clean) | C2, C5 | "Fossil dipped slightly", not "fell" |
| 3 | 33.5% vs 33.2% | Did renewables pass coal? | Two share lines drawing to the crossover (new form, template palette) | C1 | "Just ahead"; peak context |
| 4 | Hydro carries it | What is inside "renewables"? | Bars: renewables, coal, renewables without hydro (TWh) | C1 qualification, T2 | Wind + solar 17.3% stated |
| 5 | 0.44% | How solid is the lead? | Mini line of renewables − coal gap + gradient number panel | C1 robustness | Revision and dry-year (2001) caveats inline |
| 6 | 11× solar | So what? | Radial of solar per year | C9, C3, C7 | "One year is not yet a trend"; 2015/2019 precedents |

Not used: per-person figures, gas and nuclear detail, mix dumbbells (dashboard covers them).

Template adaptations: hero and closing radials use linear spoke length (the template's square-root scaling hid the 2× growth); scene 3 adds a line form in the template's lavender/lime palette, since the crossover is a change over time.

Reproduce: `python -I workflow/analysis/build_story_data.py` → `site/data-story/assets/story-data.js`.

## Revision 2026-11-05: "current" design (reviewer reference)
Reviewer supplied a reference ("The current beneath the crossover") and asked to rebuild the story in its design language and palette, and restyle the other pages to match.
- Story rebuilt: same scroll mechanics as the framework template (snapped insights, sticky stage, dissolve, progress line, mobile visual-above-copy, reduced-motion final states); visuals and palette replaced: two currents (clean above / fossil below, dotted threads, bright endpoints), renewables vs coal lines (solid/dashed), change by source (source tones), solar vs wind lines, 2000 vs 2025 mix bars, margin bars.
- Scenes now: 01 two currents (C8) · 02 renewables pass coal (C1) · 03 clean supply covers growth (C2, C3) · 04 solar overtakes wind (C5, C6, C9) · 05 generation mix · 06 the margin is narrow (C1 robustness, T1/T2 limits). Tested guardrails kept: "edged past", "led by hydropower", 0.44% / dry-year caveat, precedents, no emissions or causal claims.
- New data in story-data.js: clean and fossil per year, wind series, mix, 2024→2025 change by source (from pressure_test.py attribution).
