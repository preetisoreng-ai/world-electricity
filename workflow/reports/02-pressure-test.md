# Tested stage: pressure test

Reproduce from project root: `python -I workflow/analysis/pressure_test.py` → `data/processed/pressure-test.json` (log `pressure-test-run.txt`); `node workflow/analysis/recompute_check.mjs` → `workflow/reports/02-recompute-check.txt`.

Dataset type: annual time series, one entity (World). Sampling, weights and seasonality don't apply (annual totals, no sample). Inflation doesn't apply (physical units).

| # | Check | Method | Result | Impact |
|---|---|---|---|---|
| 1 | Independent recompute | Node script with its own CSV parser vs Python findings | 14 of 14 match | None |
| 2 | Missing, duplicates, sums | Key uniqueness; sources vs total; shares vs 100; YoY vs recompute | 0 dupes; ≤0.02 TWh; ≤0.02 pts; ≤0.01 TWh | None |
| 2 | Latest-period completeness | All series present for 2025; finality not stated | Unknown | Revision risk → C1 |
| 3 | Alternate definition | Renewables without hydro; wind + solar; clean vs fossil | Non-hydro 19.6%, wind+solar 17.3% vs coal 33.2%; never above coal in any year. Clean 42.3% vs fossil 57.7% | Crossover depends on hydro; T2 rejected |
| 3 | Alternate window | Share change per year 2000–15 vs 2015–25 | Renewables +0.28 → +1.06 pts/yr; coal +0.05 → −0.56 pts/yr | The crossover follows a decade of faster change |
| 4 | Consistency across sources | 2025 growth by source | Solar +646, wind +199, nuclear, bioenergy up; hydro −0.3%; coal −45 | Clean growth broad-based but solar-led |
| 5 | Sensitivity: revision | Renewables −k%, coal +k% | Crossover undone at k = 0.44% (95 TWh margin) | C1 qualified |
| 6 | Weather (hydro) | Replace 2025 hydro with 2024 × each observed yearly hydro change (2001–2025) | Fails only with a 2001-type year (−2.5%); hydro s.d. 2.5%/yr; 2025 was −0.3% | C1 qualified |
| 9 | Precedent / survivorship of "turning point" | Years fossil or coal fell while demand grew | 2015 and 2019 (larger coal falls). Fossil and coal rose in 2016; after 2019 came the 2020 pandemic fall, then record rises from 2021 | C3 qualified, C7 revised, T1 rejected |
| 9 | Crisis years | 2009, 2020 demand fell | Excluded from "fell while demand grew" | — |
| 7 | Uncertainty | No sampling error; scenarios for revision and weather | — | Scenarios, not intervals |
| 8 | Causation | No drivers in the file | — | No causal claims |

## Strongest supported conclusion
In Ember's 2025 figures, clean sources grew by more than world demand, mostly through solar, and renewables (led by hydro) edged past coal for the first time, by a margin a small revision or a dry year could reverse.

## Tempting but unsupported
- Clean power is now replacing fossil fuels (fossil −0.1% in one year; precedents rebounded).
- Coal has peaked.
- Wind and solar out-generate coal.
