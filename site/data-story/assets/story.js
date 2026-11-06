/*
  World electricity story: "current" redesign.
  Step playback follows run-framework/assets/data-story-template.js (oil-motion segment-play, one
  gesture = one step, latest target wins, reduced motion = final states). Visuals follow the reviewer's
  reference: two currents (clean above / fossil below a centreline, dotted threads, bright endpoints),
  monochrome lines, source-toned bars. Every number comes from window.STORY_DATA
  (workflow/analysis/build_story_data.py).
*/
(() => {
  "use strict";
  const SVG = "http://www.w3.org/2000/svg";
  const motion = document.documentElement.classList.contains("motion");
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const lerp = (a, b, t) => a + (b - a) * t;
  const n0 = (v) => Math.round(v).toLocaleString("en-US");
  const MINUS = "−";
  function el(tag, attrs, parent, text) {
    const n = document.createElementNS(SVG, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.append(n);
    return n;
  }

  const S = window.STORY_DATA;
  if (!S) {
    document.documentElement.classList.remove("motion");
    return;
  }
  const N = S.years.length,
    L = N - 1;
  const SRC = {
    Coal: "--src-coal",
    Gas: "--src-gas",
    "Other fossil": "--src-other-fossil",
    Nuclear: "--src-nuclear",
    Hydro: "--src-hydro",
    Wind: "--src-wind",
    Solar: "--src-solar",
    Bioenergy: "--src-bioenergy",
    "Other renewables": "--src-other-renewables",
  };
  const srcColor = (s) => `var(${SRC[s]})`;
  const shift = S.mix.reduce((a, m) => a + Math.max(0, m.share2025 - m.share2000), 0) * 100;

  /* ---------------- Bound text ---------------- */
  const pct1 = (v) => (v * 100).toFixed(1);
  const bind = {
    last: String(S.last),
    total: n0(S.total[L]),
    totalX: S.totalX.toFixed(1),
    renewPct: pct1(S.renewShare[L]),
    coalPct: pct1(S.coalShare[L]),
    coalPeak: pct1(S.coalPeak),
    coalPeakYear: String(S.coalPeakYear),
    dClean: n0(S.dClean),
    dTotal: n0(S.dTotal),
    dFossilAbs: n0(Math.abs(S.dFossil)),
    fossilPct: (S.fossilPct < 0 ? MINUS : "+") + (Math.abs(S.fossilPct) * 100).toFixed(1),
    precedents: S.precedentYears.join(" and "),
    solar: n0(S.solar[L]),
    wind: n0(S.wind[L]),
    dSolar: n0(S.dSolarTwh),
    solarPct: String(Math.round(S.solarShareOfGrowth * 100)),
    solarX: String(Math.round(S.solarX2015)),
    gap: S.gapLast.toFixed(1),
    kFlip: (S.kFlip * 100).toFixed(2),
    dryYear: S.dryFlips.join(", "),
    nonHydro: pct1(S.nonHydroShare),
  };
  $$("[data-bind]").forEach((s) => {
    if (bind[s.dataset.bind] != null) s.textContent = bind[s.dataset.bind];
  });
  $("#t-mix").textContent =
    `Between ${S.first} and ${S.last}, about ${Math.round(shift)} points of the world’s power mix changed hands.`;
  $("#mixLegend").innerHTML = [...S.mix]
    .map(
      (m) =>
        `<li><i style="background:${srcColor(m.source)}"></i>${m.source} ${(m.share2000 * 100).toFixed(m.share2000 < 0.001 ? 2 : 1)}% → ${(m.share2025 * 100).toFixed(1)}%</li>`
    )
    .join("");

  /* ---------------- 01 Two currents ---------------- */
  function currents(svg) {
    const W = 900,
      H = 600,
      m = { l: 64, r: 120, t: 34, b: 34 };
    const UP = 15000,
      DOWN = 20000;
    const k = (H - m.t - m.b) / (UP + DOWN);
    const c = m.t + UP * k;
    const x = (i) => m.l + 18 + (i / L) * (W - m.l - m.r - 36);
    const yUp = (v) => c - v * k,
      yDn = (v) => c + v * k;
    // glow filter for endpoints
    const defs = el("defs", {}, svg);
    const f = el(
      "filter",
      { id: "cur-glow", x: "-200%", y: "-200%", width: "500%", height: "500%" },
      defs
    );
    el("feGaussianBlur", { stdDeviation: "3.2" }, f);
    // axis
    el("text", { class: "t-label", x: m.l - 54, y: yUp(UP) + 4 }, svg, "TWh");
    [5000, 10000].forEach((v) => {
      el("line", { class: "g-rule", x1: m.l, x2: W - m.r, y1: yUp(v), y2: yUp(v) }, svg);
      el(
        "text",
        { class: "t-axis", x: m.l - 10, y: yUp(v) + 4, "text-anchor": "end" },
        svg,
        v / 1000 + "k"
      );
    });
    [5000, 10000, 15000, 20000].forEach((v) => {
      el("line", { class: "g-rule", x1: m.l, x2: W - m.r, y1: yDn(v), y2: yDn(v) }, svg);
      el(
        "text",
        { class: "t-axis", x: m.l - 10, y: yDn(v) + 4, "text-anchor": "end" },
        svg,
        v / 1000 + "k"
      );
    });
    el("line", { class: "g-center", x1: m.l, x2: W - m.r, y1: c, y2: c }, svg);
    S.years.forEach((yr, i) => {
      if (yr % 5 === 0)
        el("text", { class: "t-year", x: x(i), y: c + 22, "text-anchor": "middle" }, svg, yr);
    });

    const band = (W - m.l - m.r - 36) / L;
    // Deterministic wiggle: a slow sine whose phase depends on the year
    const thread = (xc, y0, y1, amp, phase) => {
      const pts = [];
      for (let s = 0; s <= 24; s++) {
        const t = s / 24;
        pts.push(
          `${(xc + Math.sin(phase + t * Math.PI * 1.6) * amp * Math.sin(Math.PI * t)).toFixed(1)},${lerp(y0, y1, t).toFixed(1)}`
        );
      }
      return "M" + pts.join(" L");
    };
    const lens = (xc, y0, y1, w, j, phase) => {
      const pts = [];
      for (let s = 0; s <= 24; s++) {
        const t = s / 24;
        const spread = Math.sin(Math.PI * t) * w * (j / 3);
        pts.push(
          `${(xc + spread + Math.sin(phase + j + t * 5) * 1.5).toFixed(1)},${lerp(y0, y1, t).toFixed(1)}`
        );
      }
      return "M" + pts.join(" L");
    };
    const years = S.years.map((yr, i) => {
      const xc = x(i),
        phase = i * 1.7;
      const gUp = el("g", {}, svg),
        gDn = el("g", {}, svg);
      const wUp = band * 0.42 * (0.75 + 0.25 * Math.sin(i * 2.3)),
        wDn = band * 0.42 * (0.75 + 0.25 * Math.cos(i * 1.9));
      for (let j = -3; j <= 3; j++) {
        if (j === 0) continue;
        el("path", { class: "texture", d: lens(xc, c, yUp(S.clean[i]), wUp, j, phase) }, gUp);
        el("path", { class: "texture", d: lens(xc, c, yDn(S.fossil[i]), wDn, j, phase + 1) }, gDn);
      }
      el("path", { class: "thread", d: thread(xc, c, yUp(S.clean[i]), 4, phase) }, gUp);
      el("path", { class: "thread", d: thread(xc, c, yDn(S.fossil[i]), 4, phase + 2) }, gDn);
      const last = i === L;
      const r = last ? 5 : 3.2;
      const haloU = el(
        "circle",
        { class: "endpoint-halo", r: r * 2.2, cx: xc, cy: c, filter: "url(#cur-glow)" },
        svg
      );
      const dotU = el("circle", { class: "endpoint", r, cx: xc, cy: c }, svg);
      const haloD = el(
        "circle",
        { class: "endpoint-halo", r: r * 2.2, cx: xc, cy: c, filter: "url(#cur-glow)" },
        svg
      );
      const dotD = el("circle", { class: "endpoint", r, cx: xc, cy: c }, svg);
      el("circle", { class: "mid-dot", r: 2, cx: xc, cy: c }, svg);
      return { gUp, gDn, dotU, dotD, haloU, haloD, i, xc };
    });
    // End labels (reference)
    const lx = x(L) + 16;
    const endC = el("g", { opacity: 0 }, svg),
      endF = el("g", { opacity: 0 }, svg);
    el(
      "line",
      { class: "leader", x1: x(L) + 8, x2: lx + 10, y1: yUp(S.clean[L]), y2: yUp(S.clean[L]) },
      endC
    );
    el("text", { class: "t-label", x: lx + 16, y: yUp(S.clean[L]) - 18 }, endC, "Clean");
    el("text", { class: "t-value", x: lx + 16, y: yUp(S.clean[L]) + 10 }, endC, n0(S.clean[L]));
    el(
      "line",
      { class: "leader", x1: x(L) + 8, x2: lx + 10, y1: yDn(S.fossil[L]), y2: yDn(S.fossil[L]) },
      endF
    );
    el("text", { class: "t-label", x: lx + 16, y: yDn(S.fossil[L]) - 18 }, endF, "Fossil");
    el("text", { class: "t-value", x: lx + 16, y: yDn(S.fossil[L]) + 10 }, endF, n0(S.fossil[L]));

    return (p) => {
      const reach = p * (N + 5);
      years.forEach((Y) => {
        const t = easeOut(clamp((reach - Y.i) / 5));
        const tf = `translate(0 ${c}) scale(1 ${Math.max(0.0001, t).toFixed(4)}) translate(0 ${-c})`;
        Y.gUp.setAttribute("transform", tf);
        Y.gDn.setAttribute("transform", tf);
        const yu = lerp(c, yUp(S.clean[Y.i]), t),
          yd = lerp(c, yDn(S.fossil[Y.i]), t);
        Y.dotU.setAttribute("cy", yu.toFixed(1));
        Y.haloU.setAttribute("cy", yu.toFixed(1));
        Y.dotD.setAttribute("cy", yd.toFixed(1));
        Y.haloD.setAttribute("cy", yd.toFixed(1));
        const o = t > 0.02 ? 1 : 0;
        Y.dotU.setAttribute("opacity", o);
        Y.dotD.setAttribute("opacity", o);
        Y.haloU.setAttribute("opacity", o * 0.9);
        Y.haloD.setAttribute("opacity", o * 0.9);
      });
      const e = seg(p, 0.85, 1).toFixed(2);
      endC.setAttribute("opacity", e);
      endF.setAttribute("opacity", e);
    };
  }

  /* ---------------- Two-series line chart (solid / dashed) ---------------- */
  function twoLines(svg, { a, b, labelA, labelB, max, step, fmtAxis, fmtEnd }) {
    const W = 800,
      H = 560,
      m = { l: 60, r: 170, t: 40, b: 50 };
    const x = (i) => m.l + (i / L) * (W - m.l - m.r);
    const y = (v) => m.t + (1 - v / max) * (H - m.t - m.b);
    for (let v = 0; v <= max + 1e-9; v += step) {
      el("line", { class: "g-rule", x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, svg);
      el(
        "text",
        { class: "t-axis", x: m.l - 10, y: y(v) + 4, "text-anchor": "end" },
        svg,
        fmtAxis(v)
      );
    }
    S.years.forEach((yr, i) => {
      if (yr % 5 === 0)
        el("text", { class: "t-year", x: x(i), y: H - m.b + 26, "text-anchor": "middle" }, svg, yr);
    });
    const pb = el("path", { class: "s-dash" }, svg),
      pa = el("path", { class: "s-solid" }, svg);
    const ring = el(
      "circle",
      { r: 0, cx: x(L), cy: y(a[L]), fill: "none", stroke: "var(--cur-ink)", "stroke-width": 1.5 },
      svg
    );
    const dot = el("circle", { r: 0, cx: x(L), cy: y(a[L]), class: "endpoint", filter: "" }, svg);
    const la = el("g", { opacity: 0 }, svg),
      lb = el("g", { opacity: 0 }, svg);
    const ya = y(a[L]),
      yb = y(b[L]);
    const sep = Math.abs(ya - yb) < 46 ? 23 : 0;
    const yA = ya <= yb ? ya - sep : ya + sep,
      yB = yb < ya ? yb - sep : yb + sep;
    el("text", { class: "t-label", x: W - m.r + 18, y: yA - 8 }, la, labelA);
    el("text", { class: "t-num", x: W - m.r + 18, y: yA + 12 }, la, fmtEnd(a[L]) + "  ——");
    el("text", { class: "t-label", x: W - m.r + 18, y: yB - 8 }, lb, labelB);
    el("text", { class: "t-num", x: W - m.r + 18, y: yB + 12 }, lb, fmtEnd(b[L]) + "  - - -");
    const path = (arr, upto) => {
      const kk = Math.floor(upto),
        fr = upto - kk;
      const pts = arr.slice(0, kk + 1).map((v, i) => [x(i), y(v)]);
      if (kk < L && fr > 0)
        pts.push([lerp(x(kk), x(kk + 1), fr), lerp(y(arr[kk]), y(arr[kk + 1]), fr)]);
      return pts.length
        ? "M" + pts.map((q) => q.map((v) => v.toFixed(1)).join(",")).join(" L")
        : "";
    };
    return (p) => {
      const upto = easeInOut(seg(p, 0.05, 0.8)) * L;
      pa.setAttribute("d", p > 0 ? path(a, upto) : "");
      pb.setAttribute("d", p > 0 ? path(b, upto) : "");
      const e = seg(p, 0.8, 0.95);
      la.setAttribute("opacity", e.toFixed(2));
      lb.setAttribute("opacity", e.toFixed(2));
      ring.setAttribute("r", (14 * easeOut(e)).toFixed(1));
      dot.setAttribute("r", (4 * easeOut(e)).toFixed(1));
    };
  }

  /* ---------------- 03 Change by source (source-toned bars) ---------------- */
  function changeBarsReal(svg, list) {
    const W = 800,
      H = 560,
      m = { l: 150, r: 110, t: 30, b: 30 };
    const lo = Math.min(0, ...list.map((r) => r.d)),
      hi = Math.max(0, ...list.map((r) => r.d));
    const x = (v) => m.l + ((v - lo) / (hi - lo)) * (W - m.l - m.r);
    const rh = (H - m.t - m.b) / list.length;
    el("line", { class: "g-center", x1: x(0), x2: x(0), y1: m.t - 10, y2: H - m.b + 10 }, svg);
    const bars = list.map((r, i) => {
      const yy = m.t + i * rh;
      el(
        "text",
        { class: "t-small", x: m.l - 14, y: yy + rh / 2 + 5, "text-anchor": "end" },
        svg,
        r.s
      );
      const bar = el(
        "rect",
        { y: yy + rh * 0.22, height: rh * 0.56, fill: srcColor(r.s), x: x(0), width: 0 },
        svg
      );
      const val = el("text", { class: "t-num", y: yy + rh / 2 + 5 }, svg);
      return { r, bar, val, t0: 0.05 + i * 0.05 };
    });
    el(
      "text",
      { class: "t-label", x: m.l, y: H - 4 },
      svg,
      `TWh change, ${S.last - 1} → ${S.last}`
    );
    return (p) => {
      bars.forEach((b) => {
        const t = easeOut(seg(p, b.t0, b.t0 + 0.4));
        const v = b.r.d * t;
        const x0 = Math.min(x(0), x(v)),
          w = Math.abs(x(v) - x(0));
        b.bar.setAttribute("x", x0.toFixed(1));
        b.bar.setAttribute("width", w.toFixed(1));
        b.val.setAttribute("x", (b.r.d >= 0 ? x(v) + 8 : x(0) + 8).toFixed(1));
        b.val.textContent = t > 0 ? (b.r.d >= 0 ? "+" : MINUS) + n0(Math.abs(v)) : "";
      });
    };
  }

  /* ---------------- 05 Mix bars, 2000 vs 2025 ---------------- */
  function mixBars(svg) {
    const W = 800,
      H = 560,
      m = { l: 90, r: 20 };
    const order = [
      "Coal",
      "Gas",
      "Other fossil",
      "Nuclear",
      "Hydro",
      "Wind",
      "Solar",
      "Bioenergy",
      "Other renewables",
    ];
    const byS = Object.fromEntries(S.mix.map((mm) => [mm.source, mm]));
    const rows = [
      { label: String(S.first), key: "share2000", y: 200 },
      { label: String(S.last), key: "share2025", y: 300 },
    ];
    const segs = [];
    rows.forEach((r) => {
      el("text", { class: "t-value", x: 0, y: r.y + 30, style: "font-size:20px" }, svg, r.label);
      let acc = 0;
      order.forEach((s, j) => {
        const v = byS[s][r.key];
        const x0 = m.l + acc * (W - m.l - m.r),
          w = v * (W - m.l - m.r);
        const rect = el("rect", { x: x0, y: r.y, width: 0, height: 44, fill: srcColor(s) }, svg);
        rect.append(el("title", {}, null, `${s} ${r.label}: ${(v * 100).toFixed(1)}%`));
        segs.push({
          rect,
          w: Math.max(0, w - 1.5),
          t0: (r.key === "share2025" ? 0.35 : 0.05) + j * 0.025,
        });
        acc += v;
      });
    });
    el("text", { class: "t-label", x: m.l, y: 420 }, svg, "Share of world generation, by source");
    return (p) => {
      segs.forEach((sg) =>
        sg.rect.setAttribute("width", (sg.w * easeOut(seg(p, sg.t0, sg.t0 + 0.3))).toFixed(1))
      );
    };
  }

  /* ---------------- 06 Margin: renewables vs coal vs renewables without hydro ---------------- */
  function marginBars(svg) {
    const W = 800,
      m = { l: 0, r: 150 };
    const list = [
      { name: "Renewables", v: S.renew, fill: "var(--ser-1)" },
      { name: "Coal", v: S.coal, fill: "var(--ser-2)" },
      { name: "Renewables without hydro", v: S.renew - S.hydro, fill: "var(--ser-1)", op: 0.35 },
    ];
    const max = Math.max(...list.map((d) => d.v));
    const w = (v) => (v / max) * (W - m.l - m.r);
    const rows = list.map((d, i) => {
      const y = 110 + i * 130;
      el("text", { class: "t-label", x: 0, y }, svg, d.name);
      const bar = el(
        "rect",
        { x: 0, y: y + 14, height: 46, width: 0, fill: d.fill, "fill-opacity": d.op || 1 },
        svg
      );
      const val = el("text", { class: "t-num", y: y + 44 }, svg);
      return { d, bar, val, t0: 0.05 + i * 0.16 };
    });
    const ref = el(
      "line",
      {
        x1: w(S.coal),
        x2: w(S.coal),
        y1: 90,
        y2: 110 + 3 * 130 - 40,
        stroke: "var(--cur-ink)",
        "stroke-dasharray": "1 4",
        opacity: 0,
      },
      svg
    );
    el(
      "text",
      { class: "t-axis", x: 0, y: 545 },
      svg,
      `TWh, ${S.last}. Lead over coal: ${n0(S.margin)} TWh.`
    );
    return (p) => {
      rows.forEach((r) => {
        const t = easeOut(seg(p, r.t0, r.t0 + 0.35));
        r.bar.setAttribute("width", (w(r.d.v) * t).toFixed(1));
        r.val.setAttribute("x", (w(r.d.v) * t + 12).toFixed(1));
        r.val.textContent = t > 0 ? n0(r.d.v * t) + " TWh" : "";
      });
      ref.setAttribute("opacity", (0.7 * seg(p, 0.7, 0.9)).toFixed(2));
    };
  }

  /* ---------------- Insights ---------------- */
  const drawCurrents = currents($("#currents"));
  const drawCross = twoLines($("#cross"), {
    a: S.renewShare.map((v) => v * 100),
    b: S.coalShare.map((v) => v * 100),
    labelA: "Renewables",
    labelB: "Coal",
    max: 50,
    step: 10,
    fmtAxis: (v) => v + "%",
    fmtEnd: (v) => v.toFixed(1) + "%",
  });
  const drawChange = changeBarsReal(
    $("#change"),
    S.change.slice().sort((p, q) => q.d - p.d)
  );
  const drawSolar = twoLines($("#solarWind"), {
    a: S.solar,
    b: S.wind,
    labelA: "Solar",
    labelB: "Wind",
    max: 3000,
    step: 1000,
    fmtAxis: (v) => (v ? v / 1000 + "k" : "0"),
    fmtEnd: (v) => n0(v) + " TWh",
  });
  const drawMix = mixBars($("#mix"));
  const drawMargin = marginBars($("#margin"));
  const renewNum = $("#renewNum"),
    cleanNum = $("#cleanNum"),
    solarNum = $("#solarNum"),
    gapNum = $("#gapNum");

  const insights = [
    { ms: 2800, render: (t) => drawCurrents(t) },
    {
      ms: 2600,
      render: (t) => {
        drawCross(t);
        renewNum.textContent = lerp(
          S.renewShare[0] * 100,
          S.renewShare[L] * 100,
          easeInOut(seg(t, 0.05, 0.8))
        ).toFixed(1);
      },
    },
    {
      ms: 2400,
      render: (t) => {
        drawChange(t);
        cleanNum.textContent = n0(S.dClean * easeOut(seg(t, 0.05, 0.85)));
      },
    },
    {
      ms: 2600,
      render: (t) => {
        drawSolar(t);
        solarNum.textContent = n0(lerp(S.solar[0], S.solar[L], easeInOut(seg(t, 0.05, 0.8))));
      },
    },
    { ms: 2400, render: (t) => drawMix(t) },
    {
      ms: 2400,
      render: (t) => {
        drawMargin(t);
        gapNum.textContent = (S.gapLast * easeOut(seg(t, 0.1, 0.85))).toFixed(1);
      },
    },
  ];

  /* ---------------- Step controller (template, unchanged behaviour) ---------------- */
  const steps = $$(".step"),
    items = $$(".viz-item");
  const bar = $("#progress");
  let active = -1,
    raf = 0;
  const resetTimers = new Map();

  /* ---------------- scroll-craft style layer (site/shared/craft.js) ----------------
     Kinetic lines on display type, cue fades on supporting copy, a clip-path wipe on each scene's
     chart (iris once, then alternating directions: never the same wipe twice in a row). */
  const C = window.Craft;
  if (C && C.motion) document.documentElement.classList.add("cr-on"); // enables the CSS wipe start states
  const WIPES = ["iris", "left", "up", "right", "down", "left"];
  const craft = steps.map((st, i) => ({
    kin: [...st.querySelectorAll(".display, .big, .statement, .lede")],
    cue: [...st.querySelectorAll(".kicker-num, .note, .meta-row, .mix-legend, .links")],
    stage: items[i] && items[i].firstElementChild,
  }));
  craft.forEach((c, i) => c.stage && c.stage.setAttribute("data-cr-reveal", WIPES[i]));
  let craftReady = false;
  function craftStep(i, t) {
    const c = craft[i];
    if (!C || !c) return;
    if (c.stage) c.stage.style.setProperty("--cr-t", C.smooth(seg(t, 0, 0.5)).toFixed(3));
    c.cue.forEach((el, k) => C.cue(el, t, 0.22 + k * 0.06, 1, 0.45));
    if (craftReady) c.kin.forEach((el, k) => C.playLines(el, seg(t, k * 0.08, 0.6 + k * 0.08)));
  }
  insights.forEach((ins, i) => {
    const base = ins.render;
    ins.render = (t) => { base(t); craftStep(i, t); };
  });
  // Split into lines only once the web font has loaded, so line breaks are final
  if (C) {
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      craft.forEach((c) => c.kin.forEach((el) => C.splitLines(el)));
      craftReady = true;
      craft.forEach((c, i) => c.kin.forEach((el) => C.playLines(el, i === active || !motion ? 1 : 0)));
    });
  }
  insights.forEach((ins) => ins.render(motion ? 0 : 1));
  function play(i) {
    cancelAnimationFrame(raf);
    const ins = insights[i];
    if (!motion) return ins.render(1);
    ins.render(0);
    const t0 = performance.now() + 120;
    const frame = (now) => {
      const t = clamp((now - t0) / ins.ms);
      ins.render(t);
      if (t < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }
  function activate(i) {
    if (i === active || i < 0 || i >= insights.length) return;
    const prevI = active,
      down = i > prevI;
    active = i;
    steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
    items.forEach((it, k) => {
      it.classList.remove("leave-up", "leave-down");
      it.classList.toggle("is-active", k === i);
    });
    clearTimeout(resetTimers.get(i));
    if (prevI >= 0) {
      const out = items[prevI];
      out.classList.add(down ? "leave-up" : "leave-down");
      clearTimeout(resetTimers.get(prevI));
      resetTimers.set(
        prevI,
        setTimeout(() => {
          out.classList.remove("leave-up", "leave-down");
          if (active !== prevI && motion) insights[prevI].render(0);
        }, 950)
      );
    }
    if (bar) bar.style.transform = `scaleX(${((i + 1) / insights.length).toFixed(4)})`;
    play(i);
  }

  /* ---------------- Step gestures (template): one flick / swipe / key = one insight ---------------- */
  const BAR = 72;
  const targets = () => steps.map((st) => st.getBoundingClientRect().top + scrollY - BAR);
  const footerTop = () => document.documentElement.scrollHeight - innerHeight;
  function currentIndex() {
    const t = targets(),
      y = scrollY;
    if (y > t.at(-1) + 4) return steps.length;
    let best = 0;
    t.forEach((v, k) => {
      if (Math.abs(v - y) < Math.abs(t[best] - y)) best = k;
    });
    return best;
  }
  let locked = false,
    accum = 0,
    lastInput = 0,
    lastScroll = 0;
  addEventListener("scroll", () => (lastScroll = performance.now()), { passive: true });
  function go(dir) {
    const from = currentIndex();
    const to = clamp(from + dir, 0, steps.length);
    if (to === from) return;
    const top = to === steps.length ? footerTop() : targets()[to];
    locked = true;
    lastScroll = performance.now();
    scrollTo({ top, behavior: motion ? "smooth" : "auto" });
    const release = () => {
      const now = performance.now();
      if (now - lastScroll > 140 && now - lastInput > 260) locked = false;
      else setTimeout(release, 80);
    };
    setTimeout(release, 200);
  }
  addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey || e.target.closest(".version-menu")) return;
      e.preventDefault();
      lastInput = performance.now();
      if (locked) return;
      accum += e.deltaY;
      if (Math.abs(accum) < 24) return;
      const dir = Math.sign(accum);
      accum = 0;
      go(dir);
    },
    { passive: false }
  );
  let touchY = null;
  addEventListener(
    "touchstart",
    (e) => {
      touchY = e.touches[0].clientY;
    },
    { passive: true }
  );
  addEventListener(
    "touchmove",
    (e) => {
      if (touchY != null && !e.target.closest(".version-menu")) e.preventDefault();
    },
    { passive: false }
  );
  addEventListener("touchend", (e) => {
    if (touchY == null) return;
    const dy = touchY - e.changedTouches[0].clientY;
    touchY = null;
    lastInput = performance.now();
    if (!locked && Math.abs(dy) > 40) go(Math.sign(dy));
  });
  addEventListener("keydown", (e) => {
    if (
      e.target.closest("input, select, textarea, summary, [contenteditable]") ||
      e.altKey ||
      e.ctrlKey ||
      e.metaKey
    )
      return;
    const k = e.key;
    const dir =
      k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey)
        ? 1
        : k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey)
          ? -1
          : 0;
    if (k === "Home" || k === "End") {
      e.preventDefault();
      scrollTo({ top: k === "Home" ? 0 : footerTop(), behavior: motion ? "smooth" : "auto" });
      return;
    }
    if (!dir) return;
    e.preventDefault();
    if (!locked) go(dir);
  });
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) activate(steps.indexOf(e.target));
      }),
    {
      rootMargin: matchMedia("(max-width: 760px)").matches
        ? "-62% 0px -30% 0px"
        : "-45% 0px -45% 0px",
    }
  );
  steps.forEach((s) => io.observe(s));
  if (active < 0) activate(0);
})();
