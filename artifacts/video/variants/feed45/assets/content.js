// GENERATED from artifacts/content.json v1 by artifacts/tools/build-assets.mjs — do not edit
window.EM_CONTENT = {
  "version": 1,
  "title": "The current beneath the crossover",
  "kicker": "Ember / World electricity",
  "period": "2000—2025 / 26 annual observations",
  "dek": "In 2025 clean power grew faster than world demand, and renewables, led by hydro, edged past coal for the first time.",
  "insights": [
    {
      "id": "currents",
      "label": "The world’s electricity, in two currents",
      "value": "13,507 TWh",
      "line": "clean generation in 2025, against 18,418 TWh fossil",
      "note": "Clean = renewables + nuclear. Total 31,925 TWh, 2.1× the 2000 level.",
      "chart": "currents",
      "source": [
        "data/processed/findings.json#yearly[].clean,fossil",
        "data/processed/findings.json#growth.totalX"
      ]
    },
    {
      "id": "crossover",
      "label": "Renewables pass coal",
      "value": "33.5% / 33.2%",
      "line": "renewables and coal, as shares of world electricity in 2025",
      "note": "First crossover in the 2000–2025 series, led by hydropower.",
      "chart": "crossover",
      "source": [
        "data/processed/findings.json#latest.renewShare,coalShare"
      ]
    },
    {
      "id": "growth",
      "label": "Clean supply covers growth",
      "value": "+879 TWh",
      "line": "clean generation added in 2025, against 855 TWh of total growth",
      "note": "Fossil generation dipped 24 TWh (−0.1%).",
      "chart": "growth",
      "source": [
        "data/processed/findings.json#latest.dClean,dTotal,dFossil",
        "data/processed/pressure-test.json#fossilPct"
      ]
    },
    {
      "id": "solar",
      "label": "Solar overtakes wind",
      "value": "2,807 TWh",
      "line": "solar generation, passing wind’s 2,705 TWh",
      "note": "Solar added 646 TWh, 76% of 2025’s growth.",
      "chart": "solar",
      "source": [
        "data/processed/findings.json#latest.solar,wind,dSolar,solarShareOfGrowth"
      ]
    },
    {
      "id": "margin",
      "label": "The margin is narrow",
      "value": "0.3 points",
      "line": "renewables’ lead over coal",
      "note": "A 0.44% revision or a dry hydro year would undo it. Without hydro, renewables are 19.6%. One year is not a trend.",
      "chart": "margin",
      "source": [
        "data/processed/findings.json#latest.renewMinusCoalPts",
        "data/processed/pressure-test.json#kFlip,defs.nonHydroRenewShare"
      ]
    }
  ],
  "charts": [
    {
      "id": "currents",
      "type": "two-currents",
      "unit": "TWh",
      "columns": [
        "year",
        "clean",
        "fossil"
      ],
      "rows": [
        [
          2000,
          5407.96,
          9917.31
        ],
        [
          2001,
          5418.15,
          10129.44
        ],
        [
          2002,
          5537.07,
          10560.98
        ],
        [
          2003,
          5509.52,
          11166.73
        ],
        [
          2004,
          5859.99,
          11604.03
        ],
        [
          2005,
          6017.76,
          12165.79
        ],
        [
          2006,
          6205.11,
          12684.54
        ],
        [
          2007,
          6256.16,
          13510.76
        ],
        [
          2008,
          6505.22,
          13651.77
        ],
        [
          2009,
          6549.01,
          13448.8
        ],
        [
          2010,
          6928.24,
          14399.03
        ],
        [
          2011,
          7016.16,
          15020.87
        ],
        [
          2012,
          7163.43,
          15421.46
        ],
        [
          2013,
          7481.95,
          15754.47
        ],
        [
          2014,
          7787.38,
          16017.08
        ],
        [
          2015,
          8052.94,
          16010.53
        ],
        [
          2016,
          8440.81,
          16298.42
        ],
        [
          2017,
          8819.46,
          16666.63
        ],
        [
          2018,
          9294.79,
          17212.59
        ],
        [
          2019,
          9740.56,
          17161.55
        ],
        [
          2020,
          10105.62,
          16697.41
        ],
        [
          2021,
          10662.32,
          17683.37
        ],
        [
          2022,
          11112.45,
          17888.97
        ],
        [
          2023,
          11641.84,
          18146.81
        ],
        [
          2024,
          12628.73,
          18442.02
        ],
        [
          2025,
          13507.3,
          18418.05
        ]
      ],
      "source": "data/processed/findings.json#yearly[].clean,fossil"
    },
    {
      "id": "crossover",
      "type": "two-lines",
      "unit": "% of generation",
      "columns": [
        "year",
        "renewables",
        "coal"
      ],
      "rows": [
        [
          2000,
          18.71,
          38.11
        ],
        [
          2001,
          18.04,
          38.1
        ],
        [
          2002,
          17.9,
          38.38
        ],
        [
          2003,
          17.44,
          39.63
        ],
        [
          2004,
          17.98,
          39.11
        ],
        [
          2005,
          18.1,
          39.6
        ],
        [
          2006,
          18.23,
          40.24
        ],
        [
          2007,
          17.97,
          40.92
        ],
        [
          2008,
          18.9,
          40.25
        ],
        [
          2009,
          19.46,
          39.95
        ],
        [
          2010,
          19.7,
          39.9
        ],
        [
          2011,
          19.99,
          40.72
        ],
        [
          2012,
          20.95,
          39.96
        ],
        [
          2013,
          21.66,
          40.88
        ],
        [
          2014,
          22.22,
          40.58
        ],
        [
          2015,
          22.94,
          38.8
        ],
        [
          2016,
          23.72,
          37.91
        ],
        [
          2017,
          24.43,
          38.12
        ],
        [
          2018,
          25.03,
          38.1
        ],
        [
          2019,
          25.97,
          36.76
        ],
        [
          2020,
          27.82,
          35.47
        ],
        [
          2021,
          27.88,
          36.15
        ],
        [
          2022,
          29.21,
          35.74
        ],
        [
          2023,
          30.03,
          35.35
        ],
        [
          2024,
          31.71,
          34.28
        ],
        [
          2025,
          33.52,
          33.23
        ]
      ],
      "source": "data/processed/findings.json#yearly[].renewShare,coalShare"
    },
    {
      "id": "growth",
      "type": "change-bars",
      "unit": "TWh change, 2024 → 2025",
      "columns": [
        "source",
        "change"
      ],
      "rows": [
        [
          "Solar",
          646
        ],
        [
          "Wind",
          198.55
        ],
        [
          "Nuclear",
          30.05
        ],
        [
          "Gas",
          28.46
        ],
        [
          "Bioenergy",
          16.97
        ],
        [
          "Other renewables",
          2.51
        ],
        [
          "Other fossil",
          -7.57
        ],
        [
          "Hydro",
          -15.51
        ],
        [
          "Coal",
          -44.86
        ]
      ],
      "source": "data/processed/pressure-test.json#attrib"
    },
    {
      "id": "solar",
      "type": "two-lines",
      "unit": "TWh",
      "columns": [
        "year",
        "solar",
        "wind"
      ],
      "rows": [
        [
          2000,
          1.08,
          31.16
        ],
        [
          2001,
          1.43,
          38.2
        ],
        [
          2002,
          1.79,
          52.22
        ],
        [
          2003,
          2.19,
          63.2
        ],
        [
          2004,
          2.86,
          85.47
        ],
        [
          2005,
          4.03,
          104.4
        ],
        [
          2006,
          5.49,
          133.18
        ],
        [
          2007,
          7.37,
          171.15
        ],
        [
          2008,
          11.93,
          220.85
        ],
        [
          2009,
          19.88,
          276.25
        ],
        [
          2010,
          32.28,
          346.05
        ],
        [
          2011,
          63.65,
          440.04
        ],
        [
          2012,
          97,
          529.31
        ],
        [
          2013,
          131.8,
          634.25
        ],
        [
          2014,
          197.8,
          706.24
        ],
        [
          2015,
          256.07,
          829.84
        ],
        [
          2016,
          327.52,
          960.59
        ],
        [
          2017,
          444.14,
          1139.39
        ],
        [
          2018,
          575.16,
          1268.26
        ],
        [
          2019,
          697.86,
          1421.12
        ],
        [
          2020,
          852.46,
          1591.66
        ],
        [
          2021,
          1054.12,
          1856.32
        ],
        [
          2022,
          1334.86,
          2105.71
        ],
        [
          2023,
          1669.7,
          2317.97
        ],
        [
          2024,
          2160.64,
          2506.32
        ],
        [
          2025,
          2806.64,
          2704.87
        ]
      ],
      "source": "data/processed/findings.json#yearly[].solar,wind"
    },
    {
      "id": "margin",
      "type": "bars",
      "unit": "TWh, 2025",
      "columns": [
        "series",
        "twh"
      ],
      "rows": [
        [
          "Renewables",
          10702.27
        ],
        [
          "Coal",
          10607.58
        ],
        [
          "Renewables without hydro",
          6254.88
        ]
      ],
      "source": "data/processed/pressure-test.json#renew,coal,hydro"
    }
  ],
  "notes": [
    "The 2025 figures may be revised.",
    "Generation only: the data gives no measure of emissions or the causes of the shift."
  ],
  "source_line": "Source / Ember yearly electricity generation, World, all sources, 2000–2025",
  "site": "https://preetisoreng-ai.github.io/world-electricity/",
  "cover_insight": "currents"
};
