/*
  World electricity story — step playback, following run-framework/assets/data-story-template.js
  (oil-motion "segment-play", one gesture = one step). Each insight renders render(t) over its own
  duration; a newer step cancels the running one. Reduced motion: final states, no dissolve.
  All numbers come from window.STORY_DATA (workflow/analysis/build_story_data.py).
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
  function el(tag, attrs, parent) {
    const n = document.createElementNS(SVG, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.append(n);
    return n;
  }

  const S = window.STORY_DATA;
  if (!S) {
    document.documentElement.classList.remove("motion"); // text reads at full strength without data
    return;
  }
  const N = S.years.length;

  /* ---------------- Bound text ---------------- */
  const facts = {
    solarPct: Math.round(S.solarShareOfGrowth * 100),
    renew: S.renewShare[N - 1] * 100,
    coal: S.coalShare[N - 1] * 100,
    kFlip: S.kFlip * 100,
    solarX: S.solarX2015,
  };
  const bind = {
    total: n0(S.total[N - 1]),
    last: String(S.last),
    totalX: S.totalX.toFixed(1),
    solarPct: String(facts.solarPct),
    dTotal: n0(S.dTotal),
    dClean: n0(S.dClean),
    renewPct: facts.renew.toFixed(1),
    coalPct: facts.coal.toFixed(1),
    coalPeak: (S.coalPeak * 100).toFixed(1),
    coalPeakYear: String(S.coalPeakYear),
    nonHydro: (S.nonHydroShare * 100).toFixed(1),
    windSolar: (S.windSolarShare * 100).toFixed(1),
    dryYear: S.dryFlips.join(", "),
    solarXText: String(Math.round(facts.solarX)),
    fossilPct: (Math.abs(S.fossilPct) * 100).toFixed(1),
    precedents: S.precedentYears.join(" and "),
  };
  $$("[data-bind]").forEach((s) => {
    if (bind[s.dataset.bind] != null) s.textContent = bind[s.dataset.bind];
  });

  /* ---------------- Colour: lavender → lime blend (template) ---------------- */
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const LAV = hex("#8c7cff"),
    LIME = hex("#c6e48b");
  const mix = (t) => `rgb(${LAV.map((c, i) => Math.round(lerp(c, LIME[i], t))).join(",")})`;

  /* ---------------- Radial: one spoke per year (template form) ---------------- */
  function radial(svg, values, labelFirst, labelLast) {
    const n = values.length,
      max = Math.max(...values);
    const r0 = 58,
      R = 290,
      step = (Math.PI * 2) / n,
      gap = step * 0.18;
    el("circle", { r: R, fill: "none", stroke: "#1d1d1d", "stroke-width": 1 }, svg);
    el("circle", { r: r0 - 8, fill: "none", stroke: "#1d1d1d", "stroke-width": 1 }, svg);
    const g = el("g", {}, svg);
    const pol = (r, a) => `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
    const spokes = values.map((v, i) => ({
      len: (R - r0) * (v / max), // linear: spoke length is proportional to TWh
      a0: -Math.PI / 2 + i * step + gap / 2,
      a1: -Math.PI / 2 + (i + 1) * step - gap / 2,
      path: el("path", { fill: mix(i / (n - 1)) }, g),
      last: -1,
    }));
    // Year labels for the first and last spoke, outside the ring
    const lab = (i, text) => {
      const a = (spokes[i].a0 + spokes[i].a1) / 2,
        r = R + 18;
      return el(
        "text",
        {
          x: (r * Math.cos(a)).toFixed(1),
          y: (r * Math.sin(a) + 5).toFixed(1),
          "text-anchor": i === 0 ? "start" : "end",
          class: "stage-muted",
          opacity: 0,
        },
        svg
      );
    };
    const l0 = lab(0),
      l1 = lab(n - 1);
    l0.textContent = labelFirst;
    l1.textContent = labelLast;
    return (f, spin = 0) => {
      g.setAttribute("transform", `rotate(${spin.toFixed(2)})`);
      const reach = f * (n + 6);
      spokes.forEach((s, i) => {
        const t = easeOut(clamp((reach - i) / 6));
        if (Math.abs(t - s.last) < 0.002) return;
        s.last = t;
        const r = r0 + s.len * t;
        s.path.setAttribute(
          "d",
          t <= 0
            ? ""
            : `M${pol(r0, s.a0)} L${pol(r, s.a0)} A${r},${r} 0 0 1 ${pol(r, s.a1)} L${pol(r0, s.a1)} A${r0},${r0} 0 0 0 ${pol(r0, s.a0)} Z`
        );
      });
      const o = spin === 0 ? seg(f, 0.8, 1).toFixed(2) : 0;
      l0.setAttribute("opacity", o);
      l1.setAttribute("opacity", o);
    };
  }

  /* ---------------- Unit dot grid (template form) ---------------- */
  function dotGrid(svg, lavCount) {
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const cell = 60,
      R = 25;
    const dots = Array.from({ length: 100 }, (_, i) => {
      const lav = i < lavCount;
      const sx = 20 + rnd() * 560,
        sy = lav ? 20 + rnd() * 380 : 420 + rnd() * 160;
      return {
        gx: (i % 10) * cell + cell / 2,
        gy: Math.floor(i / 10) * cell + cell / 2,
        sx,
        sy,
        size: 0.25 + rnd() * 0.75,
        t: 0.02 + rnd() * 0.38,
        c: el("circle", { r: 0, cx: sx, cy: sy, fill: lav ? "var(--lav)" : "var(--lime)" }, svg),
      };
    });
    return (p) => {
      const settle = easeInOut(seg(p, 0.5, 0.86));
      dots.forEach((d) => {
        const a = easeOut(seg(p, d.t, d.t + 0.12));
        d.c.setAttribute("r", (R * lerp(d.size, 1, settle) * a).toFixed(2));
        d.c.setAttribute("cx", lerp(d.sx, d.gx, settle).toFixed(1));
        d.c.setAttribute("cy", lerp(d.sy, d.gy, settle).toFixed(1));
      });
    };
  }

  /* ---------------- Crossing share lines (new form, template palette) ---------------- */
  function crossLines(svg) {
    const W = 600,
      H = 600,
      m = { l: 40, r: 120, t: 60, b: 70 };
    const lo = 0.15,
      hi = 0.45;
    const x = (i) => m.l + (i / (N - 1)) * (W - m.l - m.r);
    const y = (v) => m.t + ((hi - v) / (hi - lo)) * (H - m.t - m.b);
    [0.2, 0.3, 0.4].forEach((v) => {
      el("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: "#1d1d1d" }, svg);
      el(
        "text",
        { x: m.l - 6, y: y(v) + 5, "text-anchor": "end", class: "stage-muted" },
        svg
      ).textContent = Math.round(v * 100) + "%";
    });
    [0, N - 1].forEach(
      (i) =>
        (el(
          "text",
          { x: x(i), y: H - m.b + 28, "text-anchor": "middle", class: "stage-muted" },
          svg
        ).textContent = S.years[i])
    );
    const coalP = el(
      "path",
      {
        fill: "none",
        stroke: "var(--lime)",
        "stroke-width": 5,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      svg
    );
    const renP = el(
      "path",
      {
        fill: "none",
        stroke: "var(--lav)",
        "stroke-width": 5,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      svg
    );
    const coalL = el(
      "text",
      { class: "stage-value", fill: "var(--lime)", style: "fill: var(--lime)" },
      svg
    );
    const renL = el("text", { class: "stage-value", style: "fill: var(--lav)" }, svg);
    const ring = el(
      "circle",
      {
        r: 0,
        cx: x(N - 1),
        cy: y(S.renewShare[N - 1]),
        fill: "none",
        stroke: "#fff",
        "stroke-width": 2,
      },
      svg
    );
    const path = (arr, upto) => {
      const k = Math.floor(upto),
        f = upto - k;
      const pts = arr.slice(0, k + 1).map((v, i) => [x(i), y(v)]);
      if (k < N - 1 && f > 0)
        pts.push([lerp(x(k), x(k + 1), f), lerp(y(arr[k]), y(arr[k + 1]), f)]);
      return pts.length
        ? "M" + pts.map((p) => p.map((c) => c.toFixed(1)).join(",")).join(" L")
        : "";
    };
    return (p) => {
      const upto = easeInOut(seg(p, 0.05, 0.8)) * (N - 1);
      coalP.setAttribute("d", p > 0 ? path(S.coalShare, upto) : "");
      renP.setAttribute("d", p > 0 ? path(S.renewShare, upto) : "");
      const k = Math.min(N - 1, Math.round(upto));
      const show = p > 0.05;
      coalL.setAttribute("x", x(k) + 12);
      coalL.setAttribute("y", y(S.coalShare[k]) + (k === N - 1 ? 18 : 6));
      coalL.textContent = show ? `Coal ${(S.coalShare[k] * 100).toFixed(1)}%` : "";
      renL.setAttribute("x", x(k) + 12);
      renL.setAttribute("y", y(S.renewShare[k]) - (k === N - 1 ? 8 : -6));
      renL.textContent = show ? `Renewables ${(S.renewShare[k] * 100).toFixed(1)}%` : "";
      ring.setAttribute("r", (16 * easeOut(seg(p, 0.82, 0.95))).toFixed(1));
    };
  }

  /* ---------------- Horizontal bars (TWh) ---------------- */
  function hbars(svg, list) {
    const top = 120,
      left = 20,
      right = 560,
      rowH = 120;
    const max = Math.max(...list.map((d) => d.value));
    const w = (v) => ((right - left - 80) * v) / max;
    const rows = list.map((d, i) => {
      const y = top + i * rowH;
      el("text", { class: "stage-label", x: left, y: y + 4 }, svg).textContent = d.name;
      const bar = el(
        "rect",
        { x: left, y: y + 16, height: 44, rx: 4, width: 0, fill: d.color },
        svg
      );
      const val = el("text", { class: "stage-value", y: y + 46 }, svg);
      return { d, bar, val, t0: 0.05 + i * 0.18 };
    });
    // coal reference line across all rows
    const coal = list.find((d) => d.ref);
    const refX = left + w(coal.value);
    const ref = el(
      "line",
      {
        x1: refX,
        x2: refX,
        y1: top - 10,
        y2: top + rowH * list.length - 40,
        stroke: "#fff",
        "stroke-dasharray": "4 5",
        opacity: 0,
      },
      svg
    );
    return (p) => {
      rows.forEach((r) => {
        const t = easeOut(seg(p, r.t0, r.t0 + 0.35));
        const ww = w(r.d.value) * t;
        r.bar.setAttribute("width", Math.max(0, ww).toFixed(1));
        r.val.setAttribute("x", (left + ww + 10).toFixed(1));
        r.val.textContent = t > 0 ? n0(r.d.value * t) + " TWh" : "";
      });
      ref.setAttribute("opacity", (0.6 * seg(p, 0.75, 0.9)).toFixed(2));
    };
  }

  /* ---------------- Mini line chart (template form) ---------------- */
  function miniLine(svg, pts) {
    const W = 320,
      H = 150,
      m = { l: 14, r: 14, t: 30, b: 24 };
    const vals = pts.map((p) => p.v),
      lo = Math.min(...vals, 0),
      hi = Math.max(...vals, 0);
    const x = (i) => m.l + (i * (W - m.l - m.r)) / (pts.length - 1);
    const y = (v) => m.t + ((hi - v) / (hi - lo || 1)) * (H - m.t - m.b);
    const zero = el(
      "line",
      {
        x1: m.l,
        x2: W - m.r,
        y1: y(0),
        y2: y(0),
        stroke: "#555",
        "stroke-dasharray": "3 4",
        opacity: 0,
      },
      svg
    );
    const P = pts.map((p, i) => [x(i), y(p.v)]);
    const path = el("path", { class: "ln" }, svg);
    const marks = pts.map((p, i) => {
      const gg = el("g", { opacity: 0 }, svg);
      el("circle", { class: "pt", cx: P[i][0], cy: P[i][1], r: 4.5 }, gg);
      el("text", { class: "val", x: P[i][0], y: P[i][1] - 10 }, gg).textContent = p.t;
      el("text", { class: "yr", x: P[i][0], y: H - 4 }, gg).textContent = p.x;
      return gg;
    });
    return (f) => {
      zero.setAttribute("opacity", f > 0 ? 1 : 0);
      const reach = f * (pts.length - 1),
        k = Math.floor(reach),
        frac = reach - k;
      const drawn = P.slice(0, k + 1);
      if (k < P.length - 1 && frac > 0)
        drawn.push([lerp(P[k][0], P[k + 1][0], frac), lerp(P[k][1], P[k + 1][1], frac)]);
      path.setAttribute("d", f <= 0 ? "" : `M${drawn.map((q) => q.join(",")).join(" L")}`);
      marks.forEach((gg, i) =>
        gg.setAttribute("opacity", f <= 0 ? 0 : clamp((reach - i) * 3 + 1).toFixed(2))
      );
    };
  }

  /* ---------------- Word-by-word statement reveal (template) ---------------- */
  function splitWords(node) {
    const words = [];
    const walk = (n) => {
      [...n.childNodes].forEach((c) => {
        if (c.nodeType === 1) {
          if (!c.classList.contains("sr-only")) walk(c);
          return;
        }
        if (c.nodeType !== 3 || !c.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(part);
          const s = document.createElement("span");
          s.className = "sw";
          s.textContent = part;
          words.push(s);
          frag.append(s);
        });
        c.replaceWith(frag);
      });
    };
    walk(node);
    return words;
  }

  /* ---------------- Insights ---------------- */
  const heroDraw = radial($("#radial"), S.total, String(S.first), String(S.last));
  const dotsDraw = dotGrid($("#dots"), facts.solarPct);
  const solarNum = $("#solarNum"),
    growthWords = splitWords($("#t-growth"));
  const crossDraw = crossLines($("#cross"));
  const renewNum = $("#renewNum"),
    crossWords = splitWords($("#t-cross"));
  const barsDraw = hbars($("#bars"), [
    { name: "Renewables", value: S.renew, color: "var(--lav)" },
    { name: "Coal", value: S.coal, color: "var(--lime)", ref: true },
    { name: "Renewables without hydro", value: S.renew - S.hydro, color: "var(--lav)" },
  ]);
  $("#bars").setAttribute(
    "aria-label",
    `Bars, ${S.last} TWh: renewables ${n0(S.renew)}, coal ${n0(S.coal)}, renewables without hydro ${n0(S.renew - S.hydro)}.`
  );
  const gapLine = miniLine(
    $("#gapLine"),
    S.gapPts.map((g) => ({
      v: g.pts,
      t: (g.pts > 0 ? "+" : MINUS) + Math.abs(g.pts).toFixed(1),
      x: String(g.year),
    }))
  );
  const thinPanel = $("#thinPanel"),
    thinNum = $("#thinNum");
  const solarDraw = radial($("#radialSolar"), S.solar, String(S.first), String(S.last));
  const solarX = $("#solarX");

  const insights = [
    { ms: 2200, render: (t) => heroDraw(t, 0) },
    {
      ms: 2600,
      render: (t) => {
        dotsDraw(t);
        solarNum.textContent = Math.round(facts.solarPct * easeOut(seg(t, 0.04, 0.88)));
        const lit = seg(t, 0, 0.6) * growthWords.length;
        growthWords.forEach((w, i) => w.classList.toggle("dim", i >= lit));
      },
    },
    {
      ms: 2800,
      render: (t) => {
        crossDraw(t);
        renewNum.textContent = lerp(
          S.renewShare[0] * 100,
          facts.renew,
          easeInOut(seg(t, 0.05, 0.8))
        ).toFixed(1);
        const lit = seg(t, 0, 0.6) * crossWords.length;
        crossWords.forEach((w, i) => w.classList.toggle("dim", i >= lit));
      },
    },
    { ms: 2400, render: (t) => barsDraw(t) },
    {
      ms: 2400,
      render: (t) => {
        gapLine(easeInOut(seg(t, 0.05, 0.8)));
        thinPanel.style.setProperty("--reveal", easeOut(seg(t, 0, 0.3)).toFixed(3));
        thinPanel.style.setProperty("--glow", easeOut(seg(t, 0.25, 0.85)).toFixed(3));
        thinNum.textContent = (facts.kFlip * easeOut(seg(t, 0.15, 0.9))).toFixed(2);
      },
    },
    {
      ms: 2400,
      render: (t) => {
        const f = easeOut(t);
        solarDraw(f, 0);
        solarX.textContent = String(Math.round(lerp(1, facts.solarX, f)));
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
    const prev = active,
      down = i > prev;
    active = i;
    steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
    items.forEach((it, k) => {
      it.classList.remove("leave-up", "leave-down");
      it.classList.toggle("is-active", k === i);
    });
    clearTimeout(resetTimers.get(i));
    if (prev >= 0) {
      const out = items[prev];
      out.classList.add(down ? "leave-up" : "leave-down");
      clearTimeout(resetTimers.get(prev));
      resetTimers.set(
        prev,
        setTimeout(() => {
          out.classList.remove("leave-up", "leave-down");
          if (active !== prev && motion) insights[prev].render(0);
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
