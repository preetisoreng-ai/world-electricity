# Dashboard: measure catalog

**User:** an analyst or policy reader tracking the world power mix each year.
**Recurring decisions:** how far the mix has moved since a reference year; whether a crossover or fall is large enough to mean anything.
**Primary KPI:** share of world generation (renewables, clean, coal, fossil). **Comparison logic:** selected year against an earlier comparison year (default 2025 vs 2024).
**Cadence:** annual; Ember's latest year may be revised (finality not stated in the file).
**Filters:** year · comparison year (must be earlier) · measure (share / TWh / kWh per person) · comparison view (tabs). Not offered: countries (World only), months (annual data).

| Measure | Formula | Unit | Grain | Valid aggregation | Comparison | Caveat | Source fields |
|---|---|---|---|---|---|---|---|
| Generation | generation_twh | TWh | year × source | Sum across sources and groups | Earlier year | — | generation_twh |
| Share of generation | series TWh ÷ Total generation | % | year × source | Sums to 100% across the 9 sources | Earlier year (pts) | Within 0.02 pts | generation_twh |
| Per person | generation_kwh_per_capita; groups = sum of members | kWh/person | year × source | Sum across sources | Earlier year | Ember's population basis | generation_kwh_per_capita |
| Change | value(year) − value(comparison) | TWh / pts / kWh | year pair × series | Sum across sources (TWh, kWh) | — | Comparison year must be earlier | derived |
| Renewables | Hydro + Wind + Solar + Bioenergy + Other renewables | — | group | Sum | Coal | Hydro swings with rainfall (s.d. 2.5%/yr) | — |
| Renewables excl. hydro | Wind + Solar + Bioenergy + Other renewables | — | group | Sum | Coal | Never above coal 2000–2025 | — |
| Clean | Renewables + Nuclear | — | group | Sum | Fossil | Ember's low-carbon grouping | — |
| Fossil | Coal + Gas + Other fossil | — | group | Sum | Clean | Not emissions | — |

Guardrails from the Tested stage: the 2025 renewables-over-coal lead (95 TWh) is shown with its revision sensitivity (0.44%); no "coal has peaked" or "replacing fossil" wording.

Reproduce: `python -I workflow/analysis/build_dashboard_data.py` → `site/dashboard/assets/dashboard-data.js`.
