// hero.js: "Growing", the 8-second looping hero animation for the personal website.
//   Clawd tends a row of seedling bar-chart bars. A bulb: Clawd tips a watering can, and each bar shoots up on the
//   beat, the last one tallest. A trend arrow paints itself over the tops; Clawd is starstruck, then proud, hops and
//   waves. Brush wipe out, and the wipe in at 0 s is its other half, so the video loops seamlessly.
// Storyboard: STORYBOARD.md. Painted with washes only, so it renders fast in lite mode too.
(() => {
  const G = 860, U = 26, CX = 600;                         // ground line, Clawd's size and position
  const BARS = [                                            // x, final height, colour
    [1000, 170, PAL.teal], [1180, 245, PAL.ochre], [1360, 320, PAL.rose], [1540, 470, PAL.clay]
  ];
  const BW = 116, SEED_H = 34;
  const tPour0 = 2.0, tPour1 = 4.3, tGrow = i => 2.3 + i * .5;   // bar i starts growing on a beat
  const tPeak = 4.55, tArrow0 = 4.6, tArrow1 = 5.3, tWow = 4.85, tProud = 5.7, tHop0 = 5.85, tHop1 = 6.3, tHappy = 6.7;
  const WIPE = [PAL.clay, PAL.ochre];

  // ---------- set pieces ----------
  function world(t) {
    boilSeed('sky');
    paint(rectPts(-300, -300, W + 600, H + 600), { wash: mixCol(PAL.sky, PAL.cream, .62), ink: null });
    boilSeed('sun');
    const sx = 430, sy = 255, sp = 1 + .05 * pulse(t, 4);
    glow(sx, sy, 230, '#FFD27A', .9);
    for (let i = 0; i < 10; i++) {   // rays turn slowly and breathe on the beat
      const a = i / 10 * TAU + t * .15, r0 = 92 * sp, r1 = (128 + 14 * (i % 2)) * sp;
      inkLine([[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], .7, PAL.ochre, 'inkfine', 0);
    }
    paint(ellPts(sx, sy, 72 * sp, 72 * sp, 26, 1.5), { wash: mixCol(PAL.ochre, PAL.cream, .45), ink: PAL.clayDk, sw: .7 });
    for (let i = 0; i < 3; i++) {     // clouds drift right; the brush wipe hides the jump at the loop seam
      boilSeed('cloud' + i);
      const x = ((1000 + i * 620 + t * (14 + 6 * i)) % (W + 500)) - 250, y = 150 + 90 * hash(i + 4);
      paint(ellPts(x, y + 4, 170, 46, 22, 2), { wash: PAL.cream, washOp: 235, ink: mixCol(PAL.sky, PAL.ink, .3), sw: .5 });
      paint(ellPts(x - 40, y - 26, 80, 44, 18, 2), { wash: PAL.cream, washOp: 235, ink: null });
      paint(ellPts(x + 50, y - 18, 64, 36, 18, 2), { wash: PAL.cream, washOp: 235, ink: null });
    }
    boilSeed('hills');
    paint(ellPts(420, G + 80, 760, 250, 40, 2), { wash: mixCol(PAL.teal, PAL.cream, .55), ink: null });
    paint(ellPts(1500, G + 120, 900, 300, 40, 2), { wash: mixCol(PAL.sap, PAL.cream, .5), ink: null });
    boilSeed('ground');
    paint(rectPts(-300, G - 14, W + 600, 500, 3), { wash: mixCol(PAL.sap, PAL.cream, .18), ink: null });
    paint(rectPts(-300, G + 60, W + 600, 440, 3), { wash: mixCol(PAL.sap, PAL.ink, .12), washOp: 120, ink: null });
    inkLine([[-200, G - 12], [W / 2, G - 18], [W + 200, G - 10]], .9, PAL.ink, 'ink', .5);
    for (let i = 0; i < 26; i++) {    // grass tufts sway, each on its own phase
      boilSeed('tuft' + i);
      const x = hash(i + 50) * (W + 200) - 100, y = G - 12 + 50 * hash(i + 80), s = wob(t, .5, hash(i) * 3) * 4;
      for (const k of [-1, 0, 1]) inkLine([[x + k * 6, y], [x + k * 9 + s, y - 16 - 7 * hash(i + k)]], .6, mixCol(PAL.sap, PAL.ink, .3), 'inkfine', .4);
    }
  }

  // Bar i's height at time t: a seedling stub, then a springy growth spurt on its beat. The last bar is the payoff:
  // it grows slower, overshoots harder and lands tallest.
  function barH(i, t) {
    const [, h1] = BARS[i], last = i === BARS.length - 1, t0 = tGrow(i), t1 = last ? tPeak : t0 + .4;
    const k = last ? elasticOut(seg(t, t0, t1)) : backOut(seg(t, t0, t1));
    return lerp(SEED_H, h1, k) * (1 + .015 * Math.sin(t * TAU * .5 + i));
  }
  function bar(i, t) {
    const [x, , col] = BARS[i], h = barH(i, t), top = G - 10 - h, bob = .5 + .5 * pulse(t, 5);
    boilSeed('bar' + i);
    paint(ellPts(x, G - 6, BW * .62, 9, 16), { wash: PAL.ink, washOp: 60, ink: null });
    paint(rrPts(x - BW / 2, top, BW, h, 10, 1.5), { wash: col, ink: PAL.ink, sw: .9 });
    paint(rrPts(x - BW / 2 + 12, top + 10, 18, Math.max(6, h - 20), 8), { wash: mixCol(col, PAL.cream, .45), washOp: 200, ink: null });
    // two leaves on top, nodding on the beat, one a little behind the other (no twins)
    for (const s of [-1, 1]) {
      const sway = (s < 0 ? .12 : .2) * wob(t, .5, i * .3 + (s < 0 ? 0 : .15)) - .1 * bob * s;
      const L = 46 + 8 * hash(i * 7 + s), a = -Math.PI / 2 + s * .75 + sway;
      const base = [x + s * 4, top + 2], mid = [base[0] + Math.cos(a - s * .25) * L * .5, base[1] + Math.sin(a - s * .25) * L * .5];
      const tip = [base[0] + Math.cos(a) * L, base[1] + Math.sin(a) * L];
      paint(ribbon([base, mid, tip], 4, 2), { wash: mixCol(PAL.sap, PAL.ink, .15), ink: null });
      const P = [base, [mid[0] - Math.sin(a) * 14 * s, mid[1] + Math.cos(a) * 14 * s], tip, [mid[0] + Math.sin(a) * 6 * s, mid[1] - Math.cos(a) * 6 * s]];
      paint(through(P.concat([P[0]]), 4), { wash: PAL.sap, ink: PAL.ink, sw: .55 });
    }
    return [x, top];
  }
  const sparkle = (x, y, r, k) => { if (k > 0 && k < 1) paint(starPts(x, y, r * backOut(k) * (1 - k * .6), .25, 4, k * 2), { wash: PAL.cream, washOp: 255 * (1 - k * k), ink: PAL.ochre, sw: .4 }); };

  // The watering can, held at the right arm tip (arm space: +x runs outward along the arm). tilt rotates it to pour.
  const SPOUT = [4.3, -1.7];   // spout tip, in u, in can space
  function can(u, sw, tilt) {
    rotate(tilt);
    paint(ribbon([[2.1 * u, -.2 * u], [3.3 * u, -.9 * u], [SPOUT[0] * u, SPOUT[1] * u]], .55 * u, .4 * u), { wash: PAL.indigo, ink: PAL.ink, sw: sw * .7 });
    paint(ellPts(SPOUT[0] * u, SPOUT[1] * u, .45 * u, .3 * u, 10, 0, -.6), { wash: mixCol(PAL.indigo, PAL.ink, .3), ink: PAL.ink, sw: sw * .5 });
    paint(rrPts(-.6 * u, -1.2 * u, 2.9 * u, 2.3 * u, .5 * u, u * .04), { wash: PAL.indigo, ink: PAL.ink, sw: sw * .8 });
    paint(rrPts(-.3 * u, -.9 * u, .5 * u, 1.6 * u, .25 * u), { wash: mixCol(PAL.indigo, PAL.sky, .5), washOp: 220, ink: null });
    inkLine([[-.4 * u, -1.1 * u], [.8 * u, -2.1 * u], [2 * u, -1.1 * u]], sw * .8, PAL.ink, 'ink', .6);
  }
  const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

  // ---------- the shot ----------
  function grow(t, lt, dur) {
    camBegin(1070 + 14 * Math.sin(t * TAU / 8), 600 - 6 * Math.sin(t * TAU / 4), 1.16 + .012 * Math.sin(t * TAU / 8));
    world(t);

    // Clawd's arc: curious → the idea → hopeful while watering → starstruck at the payoff → proud hop → happy dance
    const mood = emotions(t, [[0, 'thinking', { lookX: .8, lookY: .3 }], [1.2, 'idea', { lookX: .5 }], [tPour0 + .1, 'hopeful', { lookX: .9, lookY: .1 }],
                              [tWow, 'starstruck', { lookX: .7, lookY: -.4 }], [tProud, 'proud'], [tHappy, 'happy']]);
    const hop = jump(t, tHop0, tHop1, 3.2);
    // right arm: hangs with the can → lifts it (anticipation) → tips it to pour → sets it down for the payoff
    const aR = kf(t, [[0, -.55], [1.5, -.55], [1.75, .55], [tPour0, .2], [tPour1, .05], [tPour1 + .35, -.6], [tHappy, -.6]], ease) ;
    // the can's tilt in world terms (0 = upright, + = spout down), so it hangs level whatever the arm does
    const tilt = kf(t, [[0, 0], [1.5, 0], [1.75, -.2], [tPour0 + .1, .6], [tPour1, .65], [tPour1 + .35, 0]], ease) + aR;
    // left arm: the mood's, then thrown up for the proud hop, then a happy wave to the viewer
    const base = mood.aL ?? .2, up = 1.35 + .2 * Math.sin((t - tHop0) * 9), wave = 1.1 + .35 * Math.sin((t - tHappy) * 11);
    const aL = lerp(lerp(base, up, ease(seg(t, tHop0 - .2, tHop0))), wave, ease(seg(t, tHappy, tHappy + .3)));
    const sq = (mood.sq || 0) + hop.sq, dy = (mood.dy || 0) + hop.dy;
    clawd(CX, G, U, { ...mood, view: 'front', aR, aL, sq, dy, armR: (u, sw) => can(u, sw, tilt) });

    // the spout tip in world space, from the same pose, for the water
    const lift = .55 * clamp((Math.abs(aR) - .7) / .9);
    const piv = [CX + (4.9 + lift) * U * (1 + sq * .6), G + dy * U - 4.5 * U * (1 - sq)];
    const tip = rot([2.2 * U, 0], -aR), sp = rot([SPOUT[0] * U, SPOUT[1] * U], -aR + tilt);
    const spout = [piv[0] + tip[0] + sp[0], piv[1] + tip[1] + sp[1]];

    // bars, back to front
    const tops = BARS.map((_, i) => bar(i, t));

    // water: a drop leaves the spout every 0.05 s while pouring, arcing to the bar that's growing (or about to)
    boilSeed('water');
    for (let s = tPour0 + .15; s < tPour1 - .1; s += .05) {
      const age = t - s, life = .5; if (age < 0 || age > life) continue;
      const i = clamp(Math.floor((s - tPour0 + .15) / .5), 0, BARS.length - 1), n = Math.round(s * 20);
      const goal = [BARS[i][0] + (hash(n) - .5) * BW * .8, G - 10 - barH(i, s + life) + 6];
      const k = age / life, p = arcPt(spout, goal, 60 + 40 * hash(n + 3), k);
      paint(ellPts(p[0], p[1], 7, 11, 8, .5, Math.atan2(goal[1] - spout[1], goal[0] - spout[0]) * k), { wash: mixCol(PAL.sky, PAL.indigo, .25), ink: null });
    }
    // each bar puffs a little sparkle as it lands; the last one gets the big flare
    BARS.forEach((b, i) => {
      const last = i === BARS.length - 1, k = seg(t, (last ? tPeak : tGrow(i) + .4) - .05, (last ? tPeak : tGrow(i) + .4) + (last ? .6 : .35));
      sparkle(tops[i][0] + (last ? 0 : 40), tops[i][1] - 30, last ? 70 : 26, k);
      if (last) for (let j = 0; j < 6; j++) { const a = -Math.PI / 2 + (j - 2.5) * .45, q = seg(t, tPeak + j * .03, tPeak + .55 + j * .03); sparkle(tops[i][0] + Math.cos(a) * 150 * q, tops[i][1] - 40 + Math.sin(a) * 120 * q, 16, q); }
    });
    if (t > tPeak - .1) glow(tops[3][0], tops[3][1] - 30, 120 + 60 * Math.exp(-(t - tPeak) * 3), '#FFE9A8', .5 * Math.exp(-(t - tPeak) * 1.5));

    // the trend arrow paints itself across the tops, left to right, then sits there breathing on the beat
    const ka = easeOut(seg(t, tArrow0, tArrow1));
    if (ka > .02) {
      boilSeed('arrow');
      const P = through(tops.map(([x, y], j) => [x + (j === 0 ? -90 : 0), y - 70 - 12 * j]), 10), n = Math.max(2, Math.round(P.length * ka));
      const path = P.slice(0, n), e = path[n - 1], d = path[n - 2], a = Math.atan2(e[1] - d[1], e[0] - d[0]), w = 16 + 3 * pulse(t, 5);
      paint(ribbon(path, w * .5, w), { wash: PAL.clayDk, ink: PAL.ink, sw: .6 });
      const head = [[0, 0], [-34, -26], [-24, 0], [-34, 26]].map(q => { const r = rot(q, a); return [e[0] + r[0] + Math.cos(a) * 22, e[1] + r[1] + Math.sin(a) * 22]; });
      paint(head, { wash: PAL.clayDk, ink: PAL.ink, sw: .6 });
    }
    camEnd();

    // loop seam: the wipe covers the frame by the end, and the start of the video is its other half
    boilSeed('transition');
    if (lt < .3) brushWipe(.5 + lt / .6, WIPE);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, WIPE);
  }

  shots([[0, grow]]);
})();
