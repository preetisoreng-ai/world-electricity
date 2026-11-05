"""Tested stage: try to break the Original claims (ember-electricity).

Run from project root:  python -I workflow/analysis/pressure_test.py
Reads data/processed/findings.json and the raw CSV. Writes data/processed/pressure-test.json and
site/tested/assets/tested-data.js. Independent recompute: workflow/analysis/recompute_check.mjs.
"""
import csv
import json
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw" / "ember_yearly_electricity-generation - All electricity sources - World - breakdown.csv"
F = json.loads((ROOT / "data" / "processed" / "findings.json").read_text(encoding="utf-8"))
rows = list(csv.DictReader(RAW.open(encoding="utf-8-sig")))
T = {}
for r in rows:
    T.setdefault(int(r["date"]), {})[r["series"]] = float(r["generation_twh"])
years = sorted(T)
LAST = years[-1]
RENEW = ["Hydro", "Wind", "Solar", "Bioenergy", "Other renewables"]
FOSSIL = ["Coal", "Gas", "Other fossil"]
ren = lambda y: sum(T[y][s] for s in RENEW)
fos = lambda y: sum(T[y][s] for s in FOSSIL)
tot = lambda y: T[y]["Total generation"]

R, C, H, TOT = ren(LAST), T[LAST]["Coal"], T[LAST]["Hydro"], tot(LAST)
margin = R - C

# ---- Test A: revision sensitivity (renewables down k%, coal up k%) ----
k_flip = margin / (R + C)
revision = [{"k": k / 1000, "renew": R * (1 - k / 1000), "coal": C * (1 + k / 1000),
             "margin": R * (1 - k / 1000) - C * (1 + k / 1000)} for k in range(0, 21)]  # 0–2.0% in 0.1% steps

# ---- Test B: weather (dry year). Apply each observed hydro year-on-year % change to 2025 hydro ----
hydro_yoy = [{"year": y, "pct": (T[y]["Hydro"] - T[y - 1]["Hydro"]) / T[y - 1]["Hydro"]} for y in years[1:]]
# Scenario: 2025 hydro replaced by 2024 hydro × (1 + that year's % change); everything else as reported
dry = []
for h in hydro_yoy:
    hydro_s = T[LAST - 1]["Hydro"] * (1 + h["pct"])
    renew_s = R - H + hydro_s
    dry.append({"year": h["year"], "pct": h["pct"], "hydro": hydro_s, "margin": renew_s - C, "flips": renew_s <= C})
dry_flips = [d["year"] for d in dry if d["flips"]]
hydro_2025_pct = (H - T[LAST - 1]["Hydro"]) / T[LAST - 1]["Hydro"]
hydro_sd = statistics.pstdev(h["pct"] for h in hydro_yoy)

# ---- Test C: definitions ----
defs = {
    "renewShare": R / TOT, "coalShare": C / TOT,
    "hydroShare": H / TOT, "nonHydroRenewShare": (R - H) / TOT,
    "windSolarShare": (T[LAST]["Wind"] + T[LAST]["Solar"]) / TOT,
    "cleanShare": (R + T[LAST]["Nuclear"]) / TOT, "fossilShare": fos(LAST) / TOT,
    "gasShare": T[LAST]["Gas"] / TOT,
}
crossYearsNonHydro = [y for y in years if ren(y) - T[y]["Hydro"] > T[y]["Coal"]]

# ---- Test D: precedents. Years fossil / coal fell while demand grew, and what came next ----
def nxt(y, f):
    return f(y + 1) - f(y) if y + 1 in T else None
coal = lambda y: T[y]["Coal"]
precedents = []
for y in years[1:]:
    dD = tot(y) - tot(y - 1)
    dF, dC = fos(y) - fos(y - 1), coal(y) - coal(y - 1)
    if dD > 0 and (dF < 0 or dC < 0):
        precedents.append({"year": y, "dDemand": dD, "dFossil": dF, "dCoal": dC,
                           "nextFossil": nxt(y, fos), "nextCoal": nxt(y, coal)})
coal_yoy = [{"year": y, "d": coal(y) - coal(y - 1), "dDemand": tot(y) - tot(y - 1)} for y in years[1:]]
coal_max_year = max(years, key=coal)

# ---- Test E: growth attribution 2025 ----
dT = tot(LAST) - tot(LAST - 1)
attrib = [{"source": s, "d": T[LAST][s] - T[LAST - 1][s]} for s in ["Solar", "Wind", "Nuclear", "Bioenergy", "Hydro", "Other renewables", "Gas", "Coal", "Other fossil"]]
clean_margin = sum(a["d"] for a in attrib if a["source"] not in FOSSIL) - dT
fossil_pct = (fos(LAST) - fos(LAST - 1)) / fos(LAST - 1)
# Revision needed to undo "clean covered growth": clean change down / total change unchanged → clean must shrink by clean_margin
clean_change = sum(a["d"] for a in attrib if a["source"] not in FOSSIL)

# ---- Test F: alternate window: share change per year, 2015–2025 vs 2000–2015 ----
pace = {
    "renew0015": (ren(2015) / tot(2015) - ren(2000) / tot(2000)) / 15 * 100,
    "renew1525": (R / TOT - ren(2015) / tot(2015)) / 10 * 100,
    "coal0015": (coal(2015) / tot(2015) - coal(2000) / tot(2000)) / 15 * 100,
    "coal1525": (C / TOT - coal(2015) / tot(2015)) / 10 * 100,
}

pct = lambda v, d=1: f"{v * 100:.{d}f}%".replace("-", "−")
claims = [
    {"id": "C1", "original": "Renewables passed coal in 2025 (33.5% vs 33.2%)", "status": "qualified",
     "found": f"True as reported, but by {margin:,.0f} TWh: a {pct(k_flip, 2)} revision in opposite directions would undo it, and a dry year like {', '.join(map(str, dry_flips))} would have too. Without hydro, renewables are {pct(defs['nonHydroRenewShare'])}.",
     "use": "In 2025 renewables, led by hydro, edged past coal for the first time, by a margin small enough to reverse."},
    {"id": "C2", "original": "Clean sources added 879 TWh, more than demand growth (855)", "status": "verified",
     "found": f"Recomputed. Clean growth exceeded demand by {clean_margin:,.0f} TWh; solar alone was {pct((T[LAST]['Solar'] - T[LAST - 1]['Solar']) / dT, 0)} of it.",
     "use": "Clean sources grew by more than total demand in 2025."},
    {"id": "C3", "original": "Fossil generation fell 24 TWh", "status": "qualified",
     "found": f"A {pct(fossil_pct, 2)} change. Fossil also fell in 2015 and 2019 while demand grew; it rose again in 2016, and after the 2020 pandemic dip it hit new highs from 2021.",
     "use": "Fossil generation was flat (−0.1%) despite strong demand growth; one year is not a trend."},
    {"id": "C4", "original": "Clean covered growth before only in 2015 and 2019, with smaller demand growth", "status": "verified",
     "found": "Recomputed: demand grew 259 and 395 TWh then, 855 TWh in 2025.", "use": "As stated."},
    {"id": "C5", "original": "Solar met 76% of demand growth", "status": "verified",
     "found": "646 ÷ 855 = 75.6%.", "use": "Solar met about three-quarters of 2025's demand growth."},
    {"id": "C6", "original": "Solar passed wind in 2025", "status": "verified",
     "found": f"2,807 vs 2,705 TWh; a {pct((T[LAST]['Solar'] - T[LAST]['Wind']) / (T[LAST]['Solar'] + T[LAST]['Wind']), 1)} opposite revision would undo it, larger than the coal crossover's margin.",
     "use": "Solar generated slightly more than wind in 2025."},
    {"id": "C7", "original": "Coal TWh peaked in 2024", "status": "revised",
     "found": "2024 is the highest coal year on record, but coal also fell in 2015 and 2019 and rose to new highs afterwards.",
     "use": "Coal generation fell 45 TWh from its 2024 record; too early to call a peak."},
    {"id": "C8", "original": "World generation doubled since 2000", "status": "verified", "found": "2.08×.", "use": "As stated."},
    {"id": "C9", "original": "Solar is 11× its 2015 level", "status": "verified", "found": "2,807 ÷ 256 = 11.0.", "use": "As stated."},
    {"id": "T1", "original": "(tempting) Clean power is now replacing fossil fuels", "status": "rejected",
     "found": "Fossil fell 0.1% in one year; it is still 57.7% of generation and fell in 2015 and 2019 before rising to new highs.", "use": "Do not claim."},
    {"id": "T2", "original": "(tempting) Wind and solar now out-generate coal", "status": "rejected",
     "found": f"Wind + solar = {pct(defs['windSolarShare'])} vs coal {pct(defs['coalShare'])}.", "use": "Do not claim."},
]

checks = [
    {"check": "Independent recompute", "result": "See recompute_check.mjs (Node, own CSV parser).", "effect": "None if all match."},
    {"check": "Totals and shares", "result": "Sources sum to the total within 0.02 TWh; shares within 0.02 pts; supplied YoY matches recompute within 0.01 TWh.", "effect": "None."},
    {"check": "Latest-year completeness", "result": "2025 has all series; the file does not say whether it is final.", "effect": "Revision risk carried into C1."},
    {"check": "Revision sensitivity", "result": f"Crossover margin {margin:,.0f} TWh; undone by a {pct(k_flip, 2)} opposite revision.", "effect": "C1 qualified."},
    {"check": "Weather (hydro)", "result": f"2025 hydro {pct(hydro_2025_pct)} vs 2024. Applying each observed yearly hydro change (2001–2025) to 2025: the crossover fails with a year like {', '.join(map(str, dry_flips))}. Year-to-year hydro s.d. {pct(hydro_sd)}.", "effect": "C1 qualified."},
    {"check": "Definition: renewables without hydro", "result": f"{pct(defs['nonHydroRenewShare'])} vs coal {pct(defs['coalShare'])}; never above coal in any year.", "effect": "Crossover depends on hydro."},
    {"check": "Definition: clean vs fossil", "result": f"Clean {pct(defs['cleanShare'])}, fossil {pct(defs['fossilShare'])}.", "effect": "Fossil is still the majority."},
    {"check": "Precedents", "result": "Fossil and coal fell with growing demand in 2015 and 2019. Both rose in 2016; after 2019 came the 2020 pandemic fall, then record rises from 2021.", "effect": "C3 qualified, C7 revised, T1 rejected."},
    {"check": "Alternate window (pace)", "result": f"Renewables share +{pace['renew0015']:.2f} pts/yr 2000–15, +{pace['renew1525']:.2f} pts/yr 2015–25; coal {pace['coal0015']:+.2f} and {pace['coal1525']:+.2f}.", "effect": "The crossover follows a decade of faster change, not a 2025 jump alone."},
    {"check": "Crisis years", "result": "2009 and 2020 demand fell; excluded from 'fossil fell while demand grew'.", "effect": "Comparisons use growth years only."},
    {"check": "Uncertainty", "result": "No sampling error; uncertainty is revision and weather, shown as scenarios.", "effect": "Scenarios replace confidence intervals."},
    {"check": "Causation", "result": "No prices, policy or weather variables in the file.", "effect": "No causal claims."},
]

out = {
    "last": LAST, "renew": R, "coal": C, "hydro": H, "total": TOT, "margin": margin, "kFlip": k_flip,
    "revision": revision, "hydroYoy": hydro_yoy, "dry": dry, "dryFlips": dry_flips, "hydro2025Pct": hydro_2025_pct,
    "hydroSd": hydro_sd, "defs": defs, "crossYearsNonHydro": crossYearsNonHydro, "precedents": precedents,
    "coalYoy": coal_yoy, "coalMaxYear": coal_max_year, "attrib": attrib, "dTotal": dT, "cleanChange": clean_change,
    "cleanMargin": clean_margin, "fossilPct": fossil_pct, "pace": pace, "claims": claims, "checks": checks,
    "statusCounts": {s: sum(1 for c in claims if c["status"] == s) for s in ["verified", "qualified", "revised", "rejected"]},
}
(ROOT / "data" / "processed" / "pressure-test.json").write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
site = ROOT / "site" / "tested" / "assets"
site.mkdir(parents=True, exist_ok=True)
(site / "tested-data.js").write_text("/* Generated by workflow/analysis/pressure_test.py — do not edit. */\nwindow.TESTED_DATA = "
                                     + json.dumps(out, ensure_ascii=False) + ";\n", encoding="utf-8")
print(f"margin {margin:.1f} TWh  kFlip {k_flip:.4%}  dryFlips {dry_flips}  hydro2025 {hydro_2025_pct:.2%}  sd {hydro_sd:.2%}")
print("defs", {k: round(v, 4) for k, v in defs.items()}, "nonHydroCross", crossYearsNonHydro)
print("precedents", precedents)
print("pace", {k: round(v, 3) for k, v in pace.items()}, "cleanMargin", round(clean_margin, 1), "fossilPct", f"{fossil_pct:.3%}")
print("status", out["statusCounts"])
