# Storyboard v2: "The current beneath the crossover" (43.2 s, 18 bars at 100 BPM)

Source of every word and number: `../content.json` v1 (locked). Look: the site's "current" design guide
(`site/shared/current.css`). Frame 0 = cover.

**Metaphor (reviewer direction, 2026-11-05):** the two-currents chart is the skeleton of a transparent fish
in a pitch-dark ocean. Spine = the centreline (2000 → 2025). Ribs = the 26 yearly threads: clean generation
above the spine, fossil below, on the shared TWh scale. Rib tips = the bright endpoints. Between insights the
skeleton folds, swims to the bottom left, and morphs into the next chart; the copy scrolls up like a page at
the same moment. The motion never stops: the fish breathes and drifts, but **every number on screen is read
off a still, true-scale frame**, and text never moves while it is held.

| #   | Time        | Picture (landscape: copy left, ocean right · portrait: copy top, ocean below)                                                                                                                                                                                                                         | Copy held on screen (content.json)                                                                                                                                           | Sound                |
| --- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 1   | 0.0–6.0 s   | **Cover / the fish.** Frame 0 fully composed: the skeleton lies straight and true to scale, head at 2025 (largest ribs), tail at 2000; "CLEAN 13,507" and "FOSSIL 18,418" mark the head ribs. The fish breathes: a slow light pulse runs down the rib tips from tail to head; the spine sways ≤ 2 px. | meta row · **The current beneath the crossover** · 01 / The world's electricity, in two currents · **13,507 TWh** clean generation in 2025, against 18,418 TWh fossil · note | bed enters           |
| T1  | 6.0–7.8 s   | **Fold and swim.** Ribs fold back along the spine like a closing fin; the fish turns and swims down to the bottom left, shrinking. As it goes, the copy column scrolls up to beat 2. The folded spine stays on screen and splits into two strands.                                                    | (copy scrolling)                                                                                                                                                             | soft whoosh          |
| 2   | 7.8–13.0 s  | **Crossover.** The two strands swim out of the spine and become the renewables (solid) and coal (dashed) lines, drawing 2000 → 2025 until they meet; a ring closes on the 2025 point. Holds still for reading.                                                                                        | 02 / Renewables pass coal · **33.5% / 33.2%** · line · note                                                                                                                  | tick at the crossing |
| T2  | 13.2–15.0 s | The two lines braid back into a spine, ribs open, the fish swims bottom left; copy scrolls to beat 3. Nine ribs swing out sideways.                                                                                                                                                                   | (copy scrolling)                                                                                                                                                             | whoosh (second take) |
| 3   | 15.0–20.4 s | **Change by source.** The nine ribs settle as horizontal bars in their source tones from a zero line, solar longest, hydro and coal pointing back. Holds.                                                                                                                                             | 03 / Clean supply covers growth · **+879 TWh** · line · note                                                                                                                 | soft rustle          |
| T3  | 20.4–22.2 s | Bars fold into ribs, the fish swims bottom left; copy scrolls; the spine splits into a bright and a slate strand.                                                                                                                                                                                     | (copy scrolling)                                                                                                                                                             | whoosh               |
| 4   | 22.2–27.6 s | **Solar and wind.** Wind (slate dashed) and solar (bright solid) climb 2000 → 2025; solar passes wind in the last year. Holds.                                                                                                                                                                        | 04 / Solar overtakes wind · **2,807 TWh** · line · note                                                                                                                      | —                    |
| T4  | 27.6–29.4 s | Lines fold, fish swims; copy scrolls; three long ribs swing out.                                                                                                                                                                                                                                      | (copy scrolling)                                                                                                                                                             | whoosh (second take) |
| 5   | 29.4–34.8 s | **The margin.** Three bars: renewables, coal, renewables without hydro, with a dotted line at coal's length; the third bar stops far short. Holds.                                                                                                                                                    | 05 / The margin is narrow · **0.3 points** · line · note                                                                                                                     | bed thins            |
| 6   | 34.8–43.2 s | **End card.** The bars fold one last time into the whole skeleton, which swims back to centre at small size and holds straight (true scale). Title, site link, source line and the two notes.                                                                                                         | **The current beneath the crossover** · preetisoreng-ai.github.io/world-electricity · source line · notes                                                                    | bed resolves         |

Morph rules: each new chart grows out of the skeleton's own marks (spine → lines, ribs → bars), so the eye
follows one continuous object. The fold-and-swim always exits to the bottom left; the new chart always settles
in the same stage area, so reading position never jumps.

Formats: 1920x1080 master; 1080x1350, 1080x1080, 1080x1920 from `tools/make-variants.mjs` (portrait: the copy
scrolls vertically above the ocean; the fish swims to the lower left of the ocean area).
Covers: frame 0 of each format → `../social/covers/cover-{16x9,4x5,1x1,9x16}.jpg` (`cover_at: 0`).

## Music (chosen 2026-11-05, reviewer asked for free mid-tempo music)
"Relaxing piano-AR22-2_43" by AngeloRizzo, CC0 (freesound.org/s/717150, via Openverse); soft piano, first 43.2 s, −19 LUFS (replaced the Erokia synth loop 2026-11-06);
every scene change sits on the 1.2 s grid (two beats). Whooshes (bundled SFX, two takes alternating) peak at each swim; a soft click at the crossover.

## Revision v3 (reviewer direction, 2026-11-06) — supersedes the swim choreography above
- Opening = the data story's first screen: kinetic masked lines on title / dek, cue fades on meta and label; the
  two-currents threads grow out of the centreline 2000 → 2025; CLEAN / FOSSIL fade in last. Composed by 2.7 s (covers at 3.0 s).
- Layout: charts right, copy left on every beat; only the end card swaps (chart left, copy right). No "0N /" numbers.
- Change 1: the skeleton folds its ribs back in place (1.0 s), then opens out into the crossover chart (0.7–2.0 s). No swim.
- Changes 2–5: seamless staggered morph (1.6 s, sine.inOut, marks ripple left → right); the next chart arrives complete.
- End card: the margin bars morph into the centreline, then the threads grow like the opening.
- Music: soft piano (AngeloRizzo, CC0), −19 LUFS.
