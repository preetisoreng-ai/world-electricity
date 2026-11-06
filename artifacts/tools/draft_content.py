"""First lock of artifacts/content.json for ember-electricity (run once; later runs reuse the lock).

Run from the project root:  python -I artifacts/tools/draft_content.py [--force]
Wording follows the approved pages (data story, pressure test). Every value is formatted from
data/processed/*.json, never typed by hand, and carries its source field.
Writes artifacts/content.json, artifacts/content.lock and a line in artifacts/CHANGELOG.md.
Refuses to overwrite an existing content.json unless --force (use only after the user approves a diff).
"""
import datetime
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
A = ROOT / "artifacts"
P = ROOT / "data" / "processed"
if (A / "content.json").exists() and "--force" not in sys.argv:
    sys.exit("content.json already locked; refresh only with user approval (--force)")

F = json.loads((P / "findings.json").read_text(encoding="utf-8"))
T = json.loads((P / "pressure-test.json").read_text(encoding="utf-8"))
L, Y = F["latest"], F["yearly"]
n0 = lambda v: f"{round(v):,}"
p1 = lambda v: f"{v * 100:.1f}%"
MINUS = "−"

content = {
    "version": 1,
    "title": "The current beneath the crossover",
    "kicker": "Ember / World electricity",
    "period": f"{F['first']}—{F['last']} / {len(Y)} annual observations",
    "dek": (f"In {F['last']} clean power grew faster than world demand, and renewables, led by hydro, "
            f"edged past coal for the first time."),
    "insights": [
        {
            "id": "currents",
            "label": "The world’s electricity, in two currents",
            "value": f"{n0(L['cleanShare'] * L['total'])} TWh",
            "line": f"clean generation in {F['last']}, against {n0(L['fossilShare'] * L['total'])} TWh fossil",
            "note": f"Clean = renewables + nuclear. Total {n0(L['total'])} TWh, {F['growth']['totalX']:.1f}× the {F['first']} level.",
            "chart": "currents",
            "source": ["data/processed/findings.json#yearly[].clean,fossil", "data/processed/findings.json#growth.totalX"],
        },
        {
            "id": "crossover",
            "label": "Renewables pass coal",
            "value": f"{p1(L['renewShare'])} / {p1(L['coalShare'])}",
            "line": f"renewables and coal, as shares of world electricity in {F['last']}",
            "note": f"First crossover in the {F['first']}–{F['last']} series, led by hydropower.",
            "chart": "crossover",
            "source": ["data/processed/findings.json#latest.renewShare,coalShare"],
        },
        {
            "id": "growth",
            "label": "Clean supply covers growth",
            "value": f"+{n0(L['dClean'])} TWh",
            "line": f"clean generation added in {F['last']}, against {n0(L['dTotal'])} TWh of total growth",
            "note": f"Fossil generation dipped {n0(abs(L['dFossil']))} TWh ({MINUS}{abs(T['fossilPct']) * 100:.1f}%).",
            "chart": "growth",
            "source": ["data/processed/findings.json#latest.dClean,dTotal,dFossil", "data/processed/pressure-test.json#fossilPct"],
        },
        {
            "id": "solar",
            "label": "Solar overtakes wind",
            "value": f"{n0(L['solar'])} TWh",
            "line": f"solar generation, passing wind’s {n0(L['wind'])} TWh",
            "note": f"Solar added {n0(L['dSolar'])} TWh, {round(L['solarShareOfGrowth'] * 100)}% of {F['last']}’s growth.",
            "chart": "solar",
            "source": ["data/processed/findings.json#latest.solar,wind,dSolar,solarShareOfGrowth"],
        },
        {
            "id": "margin",
            "label": "The margin is narrow",
            "value": f"{L['renewMinusCoalPts']:.1f} points",
            "line": "renewables’ lead over coal",
            "note": (f"A {T['kFlip'] * 100:.2f}% revision or a dry hydro year would undo it. "
                     f"Without hydro, renewables are {p1(T['defs']['nonHydroRenewShare'])}. One year is not a trend."),
            "chart": "margin",
            "source": ["data/processed/findings.json#latest.renewMinusCoalPts", "data/processed/pressure-test.json#kFlip,defs.nonHydroRenewShare"],
        },
    ],
    "charts": [
        {"id": "currents", "type": "two-currents", "unit": "TWh", "columns": ["year", "clean", "fossil"],
         "rows": [[r["year"], round(r["clean"], 2), round(r["fossil"], 2)] for r in Y],
         "source": "data/processed/findings.json#yearly[].clean,fossil"},
        {"id": "crossover", "type": "two-lines", "unit": "% of generation", "columns": ["year", "renewables", "coal"],
         "rows": [[r["year"], round(r["renewShare"] * 100, 2), round(r["coalShare"] * 100, 2)] for r in Y],
         "source": "data/processed/findings.json#yearly[].renewShare,coalShare"},
        {"id": "growth", "type": "change-bars", "unit": f"TWh change, {F['last'] - 1} → {F['last']}", "columns": ["source", "change"],
         "rows": sorted([[a["source"], round(a["d"], 2)] for a in T["attrib"]], key=lambda r: -r[1]),
         "source": "data/processed/pressure-test.json#attrib"},
        {"id": "solar", "type": "two-lines", "unit": "TWh", "columns": ["year", "solar", "wind"],
         "rows": [[r["year"], round(r["solar"], 2), round(r["wind"], 2)] for r in Y],
         "source": "data/processed/findings.json#yearly[].solar,wind"},
        {"id": "margin", "type": "bars", "unit": f"TWh, {F['last']}", "columns": ["series", "twh"],
         "rows": [["Renewables", round(T["renew"], 2)], ["Coal", round(T["coal"], 2)], ["Renewables without hydro", round(T["renew"] - T["hydro"], 2)]],
         "source": "data/processed/pressure-test.json#renew,coal,hydro"},
    ],
    "notes": [f"The {F['last']} figures may be revised.", "Generation only: the data gives no measure of emissions or the causes of the shift."],
    "source_line": f"Source / Ember yearly electricity generation, World, all sources, {F['first']}–{F['last']}",
    "site": "https://preetisoreng-ai.github.io/world-electricity/",
    "cover_insight": "currents",
}

A.mkdir(exist_ok=True)
text = json.dumps(content, indent=2, ensure_ascii=False) + "\n"
(A / "content.json").write_bytes(text.encode("utf-8"))  # exact bytes, LF line endings
sha = lambda b: hashlib.sha256(b).hexdigest()
sources = ["data/processed/findings.json", "data/processed/pressure-test.json",
           "data/raw/ember_yearly_electricity-generation - All electricity sources - World - breakdown.csv",
           "site/data-story/index.html", "site/tested/index.html"]
lock = {"version": content["version"], "locked_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "content_sha256": sha((A / "content.json").read_bytes()), "sources": {s: sha((ROOT / s).read_bytes()) for s in sources}}
(A / "content.lock").write_text(json.dumps(lock, indent=2) + "\n", encoding="utf-8")
log = A / "CHANGELOG.md"
if not log.exists():
    log.write_text("# Artifact content changelog\n\n| Date | Version | Change | Approved by |\n|---|---|---|---|\n", encoding="utf-8")
with log.open("a", encoding="utf-8") as f:
    f.write(f"| {datetime.date.today().isoformat()} | {content['version']} | First lock: title, dek, 5 insights (currents, crossover, growth, solar, margin), 5 charts, 2 notes, source line; drafted from the approved pages | Pending storyboard review |\n")
for i in content["insights"]:
    print(f"{i['id']:9s} {i['value']:>16s}  {i['line']}")
