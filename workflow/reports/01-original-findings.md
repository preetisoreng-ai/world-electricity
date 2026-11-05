# Original stage: findings

Reproduce: `python -I workflow/analysis/profile_and_analyse.py` → `data/processed/findings.json`, `profile.json`, `generation_long.csv`. Log: `workflow/reports/profile-run.txt`.

## Selected question

In 2025, did renewables overtake coal, and did clean power cover all new electricity demand?

## Candidate headline (not yet pressure-tested)

**Renewables passed coal in 2025.** Renewables made 33.5% of world electricity, coal 33.2%, the first time in this 2000–2025 series.

## Findings (observations)

1. Renewables share 18.7% (2000) → 33.5% (2025); coal 38.1% → 33.2%, peaking at 40.9% in 2007. They crossed in 2025 (C1, C7).
2. In 2025 total generation rose 855 TWh; clean sources (renewables + nuclear) rose 879 TWh; fossil fell 24 TWh (C2, C3).
3. Clean growth also covered demand growth in 2015 and 2019, but demand then grew only 259 and 395 TWh (C4).
4. Solar added 646 TWh in 2025, 76% of demand growth, and at 2,807 TWh passed wind (2,705 TWh) (C5, C6). Solar is 11× its 2015 level (C9).
5. Coal generation peaked in 2024 and fell 45 TWh in 2025 (C7).
6. World generation roughly doubled since 2000 (15,325 → 31,925 TWh) (C8).

## Interpretation vs hypothesis

- Interpretation: 2025 is the first year in the series where new clean supply exceeded strong demand growth and renewables out-generated coal.
- Hypothesis (to test): this is a turning point rather than a one-year blip. The margins (0.3 pts; 24 TWh) are small and 2025 values may be revised.

## Rejected / out of scope

- Causes (prices, policy, weather): not in the file.
- Emissions: not in the file (fossil generation is only a proxy).
- Country detail: World only.

## Data quality

- 0 duplicates; YoY blanks only in 2000; sources sum to total within 0.02 TWh; supplied YoY matches recompute within 0.01 TWh.
- No metadata or licence in the file.
