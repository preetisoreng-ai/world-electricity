"""Original stage: profile + exploratory analysis of Ember yearly world electricity generation.

Run from the project root:  python -I workflow/analysis/profile_and_analyse.py
Reads  data/raw/ember_yearly_electricity-generation - All electricity sources - World - breakdown.csv
Writes data/processed/{generation_long.csv, profile.json, findings.json}
       site/original/assets/original-data.js
"""
import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw" / "ember_yearly_electricity-generation - All electricity sources - World - breakdown.csv"
OUT = ROOT / "data" / "processed"
SITE = ROOT / "site" / "original" / "assets"

FOSSIL = ["Coal", "Gas", "Other fossil"]
RENEW = ["Hydro", "Wind", "Solar", "Bioenergy", "Other renewables"]
CLEAN = RENEW + ["Nuclear"]  # "low-carbon" in Ember's usage
SOURCES = FOSSIL + ["Nuclear"] + RENEW
NUM = ["generation_twh", "generation_share_pct", "generation_kwh_per_capita", "generation_yoy_change_twh",
       "generation_yoy_change_pct", "generation_share_yoy_change_pct_points", "generation_yoy_change_kwh_per_capita"]


def fnum(v):
    return float(v) if v not in ("", None) else None


def main():
    rows = list(csv.DictReader(RAW.open(encoding="utf-8-sig")))
    cols = list(rows[0].keys())
    years = sorted({int(r["date"]) for r in rows})
    series = sorted({r["series"] for r in rows})
    keys = [(r["date"], r["series"]) for r in rows]
    D = {}
    for r in rows:
        D.setdefault(int(r["date"]), {})[r["series"]] = {k: fnum(r[k]) for k in NUM}

    # ---------- Profile ----------
    missing = {k: sum(1 for r in rows if r[k] == "") for k in cols}
    sum_gap = {y: round(sum(D[y][s]["generation_twh"] for s in SOURCES) - D[y]["Total generation"]["generation_twh"], 3) for y in years}
    share_gap = {y: round(sum(D[y][s]["generation_share_pct"] for s in SOURCES) - 100, 3) for y in years}
    # Recompute YoY from levels and compare with the supplied column
    yoy_diffs = []
    for y in years[1:]:
        for s in SOURCES + ["Total generation"]:
            calc = D[y][s]["generation_twh"] - D[y - 1][s]["generation_twh"]
            yoy_diffs.append(abs(calc - D[y][s]["generation_yoy_change_twh"]))
    # Implied population (million) = total TWh / kWh per capita
    pop = {y: D[y]["Total generation"]["generation_twh"] * 1e3 / D[y]["Total generation"]["generation_kwh_per_capita"] for y in years}
    negatives = [(y, s) for y in years for s in SOURCES if D[y][s]["generation_twh"] < 0]

    profile = {
        "file": RAW.name,
        "sha256": hashlib.sha256(RAW.read_bytes()).hexdigest(),
        "rows": len(rows), "columns": len(cols), "column_names": cols,
        "entities": sorted({r["entity"] for r in rows}),
        "years": [years[0], years[-1]], "year_count": len(years),
        "series": series, "duplicate_keys": len(keys) - len(set(keys)),
        "missing_by_column": missing,
        "source_sum_minus_total_twh": {"max_abs": max(abs(v) for v in sum_gap.values())},
        "share_sum_minus_100_pct": {"max_abs": max(abs(v) for v in share_gap.values())},
        "yoy_recompute_max_abs_diff_twh": round(max(yoy_diffs), 4),
        "negative_values": negatives,
        "implied_population_million": {"2000": round(pop[2000]), "2025": round(pop[2025])},
    }

    # ---------- Measures ----------
    tw = lambda y, s: D[y][s]["generation_twh"]
    tot = lambda y: tw(y, "Total generation")
    grp = lambda y, group: sum(tw(y, s) for s in group)
    yearly = []
    for y in years:
        row = {
            "year": y, "total": tot(y),
            "coalShare": tw(y, "Coal") / tot(y), "fossilShare": grp(y, FOSSIL) / tot(y),
            "renewShare": grp(y, RENEW) / tot(y), "cleanShare": grp(y, CLEAN) / tot(y),
            "solarShare": tw(y, "Solar") / tot(y), "windShare": tw(y, "Wind") / tot(y),
            "coal": tw(y, "Coal"), "fossil": grp(y, FOSSIL), "renew": grp(y, RENEW), "clean": grp(y, CLEAN),
            "solar": tw(y, "Solar"), "wind": tw(y, "Wind"),
        }
        if y > years[0]:
            p = y - 1
            row.update({
                "dTotal": tot(y) - tot(p), "dFossil": grp(y, FOSSIL) - grp(p, FOSSIL),
                "dClean": grp(y, CLEAN) - grp(p, CLEAN), "dSolar": tw(y, "Solar") - tw(p, "Solar"),
                "dWind": tw(y, "Wind") - tw(p, "Wind"), "dCoal": tw(y, "Coal") - tw(p, "Coal"),
            })
        yearly.append(row)
    Y = {r["year"]: r for r in yearly}
    last, first = years[-1], years[0]
    L = Y[last]

    cross = [r["year"] for r in yearly if r["renewShare"] > r["coalShare"]]
    solar_wind = [r["year"] for r in yearly if r["solar"] > r["wind"]]
    fossil_falls = [{"year": r["year"], "dFossil": r["dFossil"], "dTotal": r["dTotal"]} for r in yearly[1:] if r["dFossil"] < 0]
    clean_covers = [r["year"] for r in yearly[1:] if r["dClean"] >= r["dTotal"] and r["dTotal"] > 0]

    mix = [{"source": s, "group": "fossil" if s in FOSSIL else "nuclear" if s == "Nuclear" else "renewable",
            "share2000": D[first][s]["generation_share_pct"] / 100, "share2025": D[last][s]["generation_share_pct"] / 100,
            "twh2000": tw(first, s), "twh2025": tw(last, s)} for s in SOURCES]

    findings = {
        "first": first, "last": last,
        "latest": {
            "total": L["total"], "dTotal": L["dTotal"], "dClean": L["dClean"], "dFossil": L["dFossil"],
            "dSolar": L["dSolar"], "dWind": L["dWind"], "dCoal": L["dCoal"],
            "renewShare": L["renewShare"], "coalShare": L["coalShare"], "cleanShare": L["cleanShare"],
            "fossilShare": L["fossilShare"], "solar": L["solar"], "wind": L["wind"],
            "solarShareOfGrowth": L["dSolar"] / L["dTotal"], "cleanShareOfGrowth": L["dClean"] / L["dTotal"],
            "renewMinusCoalPts": (L["renewShare"] - L["coalShare"]) * 100,
            "solarMinusWindTwh": L["solar"] - L["wind"],
        },
        "base": {"coalShare": Y[first]["coalShare"], "renewShare": Y[first]["renewShare"], "solar": Y[first]["solar"],
                 "total": Y[first]["total"], "fossilShare": Y[first]["fossilShare"]},
        "growth": {"totalX": L["total"] / Y[first]["total"], "solarX": L["solar"] / Y[first]["solar"],
                   "solar2015": Y[2015]["solar"], "solarX2015": L["solar"] / Y[2015]["solar"]},
        "renewOverCoalYears": cross, "solarOverWindYears": solar_wind,
        "fossilFalls": fossil_falls, "cleanCoversGrowthYears": clean_covers,
        "peakCoalShare": max(yearly, key=lambda r: r["coalShare"])["year"],
        "peakCoalShareValue": max(r["coalShare"] for r in yearly),
        "peakCoalTwhYear": max(yearly, key=lambda r: r["coal"])["year"],
        "yearly": yearly, "mix": mix,
    }

    OUT.mkdir(parents=True, exist_ok=True)
    with (OUT / "generation_long.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["year", "series", "group", "generation_twh", "share_pct"])
        for y in years:
            for s in SOURCES + ["Total generation"]:
                g = "fossil" if s in FOSSIL else "nuclear" if s == "Nuclear" else "renewable" if s in RENEW else "total"
                w.writerow([y, s, g, D[y][s]["generation_twh"], D[y][s]["generation_share_pct"]])
    (OUT / "profile.json").write_text(json.dumps(profile, indent=2), encoding="utf-8")
    (OUT / "findings.json").write_text(json.dumps(findings, indent=2), encoding="utf-8")
    SITE.mkdir(parents=True, exist_ok=True)
    (SITE / "original-data.js").write_text(
        "/* Generated by workflow/analysis/profile_and_analyse.py — do not edit. */\nwindow.ORIGINAL_DATA = "
        + json.dumps(findings) + ";\n", encoding="utf-8")

    print(json.dumps({k: v for k, v in profile.items() if k not in ("column_names",)}, indent=1))
    print(json.dumps({k: v for k, v in findings.items() if k not in ("yearly", "mix")}, indent=1))


if __name__ == "__main__":
    main()
