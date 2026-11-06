/*
  craft.js: scroll effects modelled on scroll-craft (github.com/nateherkai/scroll-craft, MIT), using its
  documented parameters, written for this project (no scroll-craft code vendored):
  - Kinetic lines: text split into masked lines after fonts load; lines rise (1 − u) × 100% and stagger
    across 0.62 of the reveal window, smoothstep easing.
  - Cue: smoothstep ramps, rise of (1 − vis) × 2.4vh.
  - Flow reveal: IntersectionObserver once (rootMargin 0 0 −12% 0), stagger in ms per child.
  - Scrubbed wipe: flow progress p = (y + vh − top) / (height + vh), mapped through reveal-at "from to"
    (default 0.04 0.34 here; scroll-craft uses 0.15 0.55 inside pinned acts) and smoothstep, published as --cr-t. Reverses when scrolling back.
  Reduced motion: no translation or wipe; text and charts show at once.
  API: window.Craft = { splitLines, playLines, cue, smooth, mountFlow }
*/
(function (global) {
  "use strict";
  var reduce = false;
  try {
    reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}
  var motion = document.documentElement.classList.contains("motion") && !reduce;
  var clamp01 = function (v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  };
  var smooth = function (t) {
    t = clamp01(t);
    return t * t * (3 - 2 * t);
  };

  /* ---------- Kinetic lines ---------- */
  // Splits an element's text into masked lines. Nested inline elements (e.g. <span data-bind>, sr-only)
  // are kept whole as single "words"; sr-only text stays outside the visual lines.
  function splitLines(el) {
    if (!el || el.__crLines) return el && el.__crLines;
    var tokens = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          tokens.push(/^\s+$/.test(part) ? { space: true } : { text: part });
        });
      } else if (n.nodeType === 1) {
        if (n.classList.contains("sr-only")) tokens.push({ keep: n, hidden: true });
        else if (n.tagName === "BR") tokens.push({ br: true });
        else tokens.push({ node: n });
      }
    });
    el.textContent = "";
    // Only whitespace ends a word: "2025" + "." or "2.1" + "×" stay together as one word
    var words = [],
      w = null;
    var endWord = function () {
      w = null;
    };
    tokens.forEach(function (t) {
      if (t.space) {
        endWord();
        el.appendChild(document.createTextNode(" "));
        return;
      }
      if (t.hidden) {
        el.appendChild(t.keep);
        return;
      }
      if (t.br) {
        endWord();
        el.appendChild(document.createElement("br"));
        return;
      }
      if (!w) {
        w = document.createElement("span");
        w.style.display = "inline-block";
        el.appendChild(w);
        words.push(w);
      }
      if (t.node) w.appendChild(t.node);
      else w.appendChild(document.createTextNode(t.text));
    });
    // Group words by rendered line
    var lines = [],
      cur = null,
      top = null;
    words.forEach(function (w) {
      var y = w.offsetTop;
      if (top === null || Math.abs(y - top) > 2) {
        cur = [];
        lines.push(cur);
        top = y;
      }
      cur.push(w);
    });
    var hidden = Array.prototype.filter.call(el.childNodes, function (n) {
      return n.nodeType === 1 && n.classList && n.classList.contains("sr-only");
    });
    el.textContent = "";
    hidden.forEach(function (h) {
      el.appendChild(h);
    });
    var inners = lines.map(function (ws, i) {
      var line = document.createElement("span");
      line.className = "cr-line";
      var inner = document.createElement("span");
      inner.className = "cr-line__i";
      ws.forEach(function (w, k) {
        w.style.display = "";
        inner.appendChild(w);
        if (k < ws.length - 1) inner.appendChild(document.createTextNode(" "));
      });
      // trailing space so screen readers and copy/paste never merge the last and next words
      if (i < lines.length - 1) inner.appendChild(document.createTextNode(" "));
      line.appendChild(inner);
      el.appendChild(line);
      return inner;
    });
    el.__crLines = inners;
    return inners;
  }
  // t in 0..1: each line rises from behind its mask; lines stagger across 0.62 of the window
  function playLines(el, t) {
    var inners = el && el.__crLines;
    if (!inners) return;
    var n = inners.length,
      span = 0.62,
      each = 1 - span;
    inners.forEach(function (inner, i) {
      var start = n > 1 ? (i / (n - 1)) * span : 0;
      var u = motion ? smooth((t - start) / each) : 1;
      inner.style.transform = u >= 1 ? "" : "translateY(" + ((1 - u) * 100).toFixed(2) + "%)";
    });
  }

  /* ---------- Cue: opacity + rise for a window [from, to] with ramps ---------- */
  function cue(el, p, from, to, rampIn) {
    if (from == null) from = 0;
    if (to == null) to = 1;
    var r = (rampIn == null ? 0.3 : rampIn) * (to - from);
    var vis = motion ? smooth((p - from) / Math.max(r, 0.001)) : 1;
    el.style.opacity = vis.toFixed(3);
    el.style.transform =
      motion && vis < 1 ? "translateY(" + ((1 - vis) * 2.4).toFixed(2) + "vh)" : "";
  }

  /* ---------- Flow pages: once-reveals + scrubbed wipes ---------- */
  function mountFlow(root) {
    root = root || document;
    if (root.__crMounted) return;
    root.__crMounted = true;
    if (motion) document.documentElement.classList.add("cr-on");
    var ins = Array.prototype.slice.call(root.querySelectorAll("[data-cr-in]"));
    if (!motion || !("IntersectionObserver" in global)) {
      ins.forEach(function (el) {
        el.classList.add("cr-in");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var el = e.target,
              stagger = parseFloat(el.getAttribute("data-cr-stagger"));
            if (!isNaN(stagger))
              Array.prototype.forEach.call(el.children, function (kid, i) {
                kid.style.transitionDelay = i * stagger + "ms";
              });
            el.classList.add("cr-in");
            io.unobserve(el);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
      );
      ins.forEach(function (el) {
        io.observe(el);
      });
    }

    var wipes = Array.prototype.slice
      .call(root.querySelectorAll("[data-cr-reveal]"))
      .map(function (el) {
        var at = (el.getAttribute("data-cr-reveal-at") || "0.04 0.34").split(/\s+/).map(Number);
        return { el: el, from: at[0], to: at[1], last: -1 };
      });
    if (!wipes.length) return;
    if (!motion) {
      wipes.forEach(function (w) {
        w.el.style.setProperty("--cr-t", "1");
      });
      return;
    }
    var queued = false,
      lastInput = 0;
    function frame() {
      queued = false;
      var vh = innerHeight;
      // reads first, then writes
      var vals = wipes.map(function (w) {
        var r = w.el.getBoundingClientRect();
        var p = (vh - r.top) / (r.height + vh); // flow progress
        return smooth((p - w.from) / Math.max(w.to - w.from, 0.001));
      });
      wipes.forEach(function (w, i) {
        var v = Math.round(vals[i] * 1000) / 1000;
        if (v !== w.last) {
          w.el.style.setProperty("--cr-t", String(v));
          w.last = v;
        }
      });
      // Keep sampling for a short tail after the last scroll event (smooth scrolling, momentum and
      // programmatic scrolls can settle after their final event), then stop: no idle loop.
      if (performance.now() - lastInput < 600) loop();
    }
    function loop() {
      if (!queued) {
        queued = true;
        requestAnimationFrame(frame);
      }
    }
    function schedule() {
      lastInput = performance.now();
      loop();
    }
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    if ("onscrollend" in global) addEventListener("scrollend", schedule);
    schedule();
  }

  // Flow pages opt in with <html data-craft="flow">; mount after every deferred page script has run
  // (craft.js loads last; if the document is already parsed, mount now rather than wait for an event
  // that may have fired already)
  if (document.documentElement.getAttribute("data-craft") === "flow") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        mountFlow(document);
      });
    } else {
      mountFlow(document);
    }
  }

  global.Craft = {
    splitLines: splitLines,
    playLines: playLines,
    cue: cue,
    smooth: smooth,
    mountFlow: mountFlow,
    motion: motion,
  };
})(window);
