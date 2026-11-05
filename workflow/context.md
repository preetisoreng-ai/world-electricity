# Dataset context: ember-electricity

## Identity

- Project name: ember-electricity (name supplied by the user)
- Source files: `data/raw/ember_yearly_electricity-generation - All electricity sources - World - breakdown.csv` (260 rows × 13 columns). Hash in `data/raw/source-manifest.json`.
- Source/publisher: Ember (from the file name: yearly electricity generation, World, all sources). No metadata file supplied; licence not stated in the file (unknown; Ember usually publishes under CC BY 4.0, not verified here).
- Retrieval or upload date: uploaded 2026-11-05.
- Dataset description: world electricity generation by source, yearly, 2000–2025: TWh, share of total, kWh per person, and year-on-year changes.
- Intended audience: unknown; assumed a general / policy-minded reader.
- User's stated question or decision: none stated. Assumption: "Is clean electricity now displacing fossil generation, not just adding to it?"

## Shape and grain

- Dataset type: time series (annual), one entity (World), 9 sources + 1 total series.
- Unit of observation: year × series.
- Row count / column count: 260 × 13 (26 years × 10 series).
- Entity keys: `date` + `series`; 0 duplicates.
- Time fields and frequency: `date`, annual, 2000–2025, no gaps.
- Geographic fields and level: World only (`entity_code` blank).
- Coverage start/end: 2000 to 2025.
- Latest-period completeness: 2025 has all 10 series. Whether 2025 is final or preliminary is not stated in the file (unknown); latest-year values from Ember are often revised.

## Field semantics

| Field                                                         | Meaning                   | Type   | Unit       | Range                                   | Missingness           | Notes                                                  |
| ------------------------------------------------------------- | ------------------------- | ------ | ---------- | --------------------------------------- | --------------------- | ------------------------------------------------------ |
| date                                                          | Year                      | int    | year       | 2000–2025                               | 0                     |                                                        |
| series                                                        | Source or total           | string | —          | 10 values                               | 0                     | `Total generation` flagged `is_aggregate_series=true`  |
| generation_twh                                                | Electricity generated     | float  | TWh        | 1.08 (Solar 2000) – 31,925 (Total 2025) | 0                     | Sources sum to total within 0.02 TWh                   |
| generation_share_pct                                          | Share of total generation | float  | %          | 0.01–100                                | 0                     | Sums to 100 within 0.02 pts                            |
| generation_kwh_per_capita                                     | Generation per person     | float  | kWh/person | —                                       | 0                     | Implies world population 6.17bn (2000) → 8.23bn (2025) |
| generation_yoy_change_twh                                     | Change vs previous year   | float  | TWh        | —                                       | 10 (year 2000)        | Matches recompute within 0.01 TWh                      |
| generation_yoy_change_pct                                     | % change vs previous year | float  | %          | —                                       | 10                    |                                                        |
| generation_share_yoy_change_pct_points                        | Share change              | float  | pts        | —                                       | 10                    |                                                        |
| generation_yoy_change_kwh_per_capita                          | Per-person change         | float  | kWh        | —                                       | 10                    |                                                        |
| entity, entity_code, is_aggregate_entity, is_aggregate_series | Constant identifiers      | string | —          | —                                       | entity_code all blank |                                                        |

## Measures and denominators

| Measure                  | Formula                                               | Numerator | Denominator      | Unit | Additive?          | Caveat                                |
| ------------------------ | ----------------------------------------------------- | --------- | ---------------- | ---- | ------------------ | ------------------------------------- |
| Source share             | source TWh ÷ total TWh                                | source    | Total generation | %    | yes across sources | Uses supplied total                   |
| Renewables share         | (Hydro+Wind+Solar+Bioenergy+Other renewables) ÷ total | 5 sources | total            | %    | yes                | Includes hydro and bioenergy          |
| Fossil share             | (Coal+Gas+Other fossil) ÷ total                       | 3 sources | total            | %    | yes                |                                       |
| Clean (low-carbon) share | renewables + nuclear ÷ total                          | 6 sources | total            | %    | yes                | Ember's "clean" grouping              |
| Yearly change            | TWh(y) − TWh(y−1)                                     | —         | —                | TWh  | yes                | Matches supplied YoY                  |
| Share of demand growth   | source change ÷ total change                          | —         | total change     | %    | —                  | Only meaningful when total change > 0 |

## Quality and comparability

- Duplicates: none. Missing: only YoY columns in 2000 (expected).
- Invalid values: none negative; sums reconcile (≤0.02 TWh / 0.02 pts rounding).
- Definition/schema changes: unknown (single file, no metadata).
- Outliers: crisis years 2009 (financial crisis) and 2020 (Covid) show falls in total demand.
- Inflation/currency: n/a (physical units).
- Known biases: global total hides regional variation; latest year may be preliminary.

## Analytical frame

- Candidate questions (scored relevance/support/novelty/visual/misinterpretation risk, 1–5; risk lower is better):
  1. Did renewables overtake coal? 5/4/5/5/3 **(selected, with Q2)**
  2. Did clean power cover all demand growth in 2025, and did fossil generation fall? 5/4/4/4/3
  3. How fast has solar grown, and has it passed wind? 4/5/4/4/2
  4. How has the whole mix shifted 2000→2025? 3/5/2/4/2
  5. Is electricity per person rising? 3/5/2/3/2
- Primary question selected: "In 2025, did renewables overtake coal and clean power cover all new demand?"
- Comparison baseline: 2000, 2024, and earlier years when fossil generation fell (2009, 2015, 2019, 2020).
- Important segments: coal, gas, solar, wind, hydro; renewable / fossil / clean groupings.
- Uncertainty treatment: no sampling error; latest-year revision risk and grouping definitions matter. Margins (0.3 pts, 24 TWh) are small → pressure test.
- Causal claims allowed: no (no drivers, prices or policy in the file).

## Visual and interaction frame

- Natural chart forms: line chart of shares over time; paired bars of yearly change; line of solar vs wind TWh; dumbbell of 2000→2025 shares.
- Unsafe forms: dual-axis TWh vs %; stacked area hiding the crossover; pie of 26 years.
- Required filters: none needed for Original (one entity).
- Accessibility: focus series #7745ad (primary) vs comparison #c25d0b (orange-700), validated earlier (light, all checks pass); direct labels and legends; text alternatives.
- Data brand/radius/dark classes: `theme-data radius-round-2`.

## Evidence ledger

| Claim ID | Claim | Status | Calculation/script | Supporting fields | Limitations |
|---|---|---|---|---|---|
| C1 | In 2025 renewables (led by hydro) edged past coal for the first time: 33.5% vs 33.2% | qualified | pressure_test.py → margin, kFlip, dry | generation_twh | 95 TWh margin; undone by 0.44% opposite revision or a 2001-type hydro year; non-hydro renewables 19.6% |
| C2 | Clean sources grew by more than total demand in 2025 (879 vs 855 TWh) | verified | recompute_check.mjs (14/14) | generation_twh | Margin 24 TWh |
| C3 | Fossil generation was flat (−0.1%) despite strong demand growth | qualified | fossilPct, precedents | generation_twh | One year; 2015/2019 falls were followed by rises |
| C4 | Clean covered growth before only in 2015 and 2019, with 259 and 395 TWh demand growth | verified | precedents | generation_twh | — |
| C5 | Solar met about three-quarters (75.6%) of 2025's demand growth | verified | recompute | generation_twh | — |
| C6 | Solar generated slightly more than wind in 2025 | verified | recompute | generation_twh | 1.8% opposite revision would undo |
| C7 | Coal fell 45 TWh from its 2024 record; too early to call a peak | revised | coalYoy, precedents | generation_twh | Earlier falls were followed by new records |
| C8 | World generation doubled since 2000 (2.08×) | verified | recompute | generation_twh | — |
| C9 | Solar is 11× its 2015 level | verified | recompute | generation_twh | — |
| T1 | Clean power is now replacing fossil fuels | rejected | precedents | — | One year, −0.1% |
| T2 | Wind and solar out-generate coal | rejected | defs | — | 17.3% vs 33.2% |

## Decisions and unresolved questions

- Approved decisions: Original approved 2026-11-05. Tested pending.
- Tested-stage decisions: lead with "clean growth outpaced demand"; describe the crossover as led by hydro and reversible; no "coal has peaked" or "replacing fossil" claims.
- Unresolved: Is 2025 final? Which grouping does the reader expect ("renewables" vs "clean")?
- Assumptions requiring reviewer confirmation: audience; "renewables" = hydro + wind + solar + bioenergy + other renewables; "clean" adds nuclear.
