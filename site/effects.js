// effects.js: motion for the site, built on GSAP (+ ScrollTrigger, SplitText) and Lenis smooth scrolling.
// The text reveal, count-up, scroll-velocity marquee and magnet buttons are vanilla ports of React Bits components
// (https://github.com/DavidHDev/react-bits): SplitText, CountUp, ScrollVelocity and Magnet.
//   React Bits: Copyright (c) 2026 David Haz. MIT + Commons Clause License Condition v1.0. Permission is hereby granted,
//   free of charge, to any person obtaining a copy of this software and associated documentation files (the
//   "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
//   modify, merge, publish, and distribute the Software as part of an application, website, or product, subject to
//   the conditions that this notice is included in all copies or substantial portions of the Software, and that the
//   components themselves are not sold, sublicensed or redistributed, alone, in a bundle, or as a ported version.
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
//
// Everything here is progressive: with reduced motion, or if a library fails to load, the page stays fully static.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || !window.ScrollTrigger || !window.SplitText) { root.classList.remove('fx'); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const fine = matchMedia('(pointer: fine)').matches;

  // ---------- Lenis: smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync ----------
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, anchors: { offset: -80 } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ---------- nav: tucks away while scrolling down, comes back on the way up ----------
  const nav = document.querySelector('.nav');
  ScrollTrigger.create({
    start: 120, end: 'max',
    onUpdate: self => nav.classList.toggle('tucked', self.direction === 1),
    onLeaveBack: () => nav.classList.remove('tucked')
  });

  document.fonts.ready.then(() => {
    // ---------- hero intro ----------
    const name = new SplitText('.hero h1', { type: 'lines,chars', mask: 'lines' });
    const lede = new SplitText('.lede', { type: 'lines', mask: 'lines' });
    gsap.set('.hero-text, .hero-art', { autoAlpha: 1 });
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hello > *', { autoAlpha: 0, y: 14, scale: .8, stagger: .08, duration: .6, ease: 'back.out(2)' })
      .from(name.chars, { yPercent: 110, rotate: 6, duration: .9, stagger: .025 }, '-=.3')
      .from(lede.lines, { yPercent: 100, duration: .8, stagger: .08 }, '-=.6')
      .to('.lede em', { backgroundSize: '100% 100%', duration: .6, ease: 'power2.inOut' }, '-=.2')
      .from('.hero .cta .btn', { autoAlpha: 0, y: 20, stagger: .08, duration: .6 }, '-=.6')
      .from('.hero .tags li', { autoAlpha: 0, y: 12, stagger: .04, duration: .4 }, '-=.4')
      .from('.hero-art video', { autoAlpha: 0, scale: .9, rotate: -5, duration: 1.1, ease: 'back.out(1.4)' }, .25)
      .from('.hero-art figcaption', { autoAlpha: 0, x: 20, rotate: 4, duration: .6 }, '-=.4');

    // the painting drifts slower than the page, and leans toward the pointer
    gsap.to('.hero-art', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    if (fine) {
      const art = document.querySelector('.hero-art video');
      const rx = gsap.quickTo(art, 'x', { duration: .8, ease: 'power3' }), ry = gsap.quickTo(art, 'y', { duration: .8, ease: 'power3' });
      const rr = gsap.quickTo(art, 'rotation', { duration: .8, ease: 'power3' });
      document.querySelector('.hero').addEventListener('pointermove', e => {
        const r = art.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
        rx(dx * 24); ry(dy * 18); rr(.8 + dx * 3);
      });
    }

    // ---------- SplitText (React Bits): section titles rise in letter by letter ----------
    document.querySelectorAll('.section h2').forEach(h => {
      const split = new SplitText(h, { type: 'words,chars' });
      gsap.from(split.chars, { opacity: 0, y: 40, duration: 1.25, ease: 'power3.out', stagger: .03,
        scrollTrigger: { trigger: h, start: 'top 90%', once: true } });
    });

    // ---------- cards and blocks arrive in a staggered wave ----------
    gsap.set('.section .card, .timeline li, .prose p, .section-lede, .follow', { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch('.section .card, .timeline li, .prose p, .section-lede, .follow', {
      start: 'top 88%', once: true,
      onEnter: els => gsap.to(els, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1 })
    });

    // the budgeting tile's bars grow on their beat, then the trend line draws across
    const bars = gsap.utils.toArray('.mini-chart rect');
    if (bars.length) {
      const trend = document.querySelector('.mini-chart .trend');
      gsap.timeline({ scrollTrigger: { trigger: '.mini-chart', start: 'top 85%', once: true } })
        .from(bars, { scaleY: 0, transformOrigin: '50% 100%', duration: .8, ease: 'back.out(1.8)', stagger: .15 })
        .from(trend, { opacity: 0, x: -20, duration: .6, ease: 'power2.out' }, '-=.3');
    }

    // ---------- CountUp (React Bits): the numbers tick up when they scroll into view ----------
    document.querySelectorAll('.stat b').forEach(b => {
      const m = b.textContent.match(/^(\D*)([\d.,]+)(.*)$/); if (!m) return;
      const [, pre, num, post] = m, target = parseFloat(num.replace(/,/g, '')), dec = (num.split('.')[1] || '').length;
      const fmt = v => pre + (num.includes(',') ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec)) + post;
      const o = { v: 0 }; b.textContent = fmt(0);
      gsap.to(o, { v: target, duration: 2, ease: 'power2.out', onUpdate: () => { b.textContent = fmt(o.v); },
        scrollTrigger: { trigger: b, start: 'top 90%', once: true } });
    });
    gsap.from('.stats', { autoAlpha: 0, y: 40, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.stats', start: 'top 92%', once: true } });

    ScrollTrigger.refresh();
  });

  // ---------- ScrollVelocity (React Bits): marquee rows that speed up and flip with the scroll ----------
  document.querySelectorAll('.marquee-row').forEach((row, i) => {
    const track = row.querySelector('.marquee-track'), copy = track.firstElementChild;
    for (let k = 0; k < 5; k++) track.appendChild(copy.cloneNode(true)).setAttribute('aria-hidden', 'true');
    const base = (+row.dataset.velocity || 60) * (i % 2 ? -1 : 1), setX = gsap.quickSetter(track, 'x', 'px');
    let x = 0, dirF = 1, vel = 0;
    gsap.ticker.add((_, dt) => {
      const w = copy.offsetWidth; if (!w) return;
      const raw = lenis ? lenis.velocity * 60 : 0;            // px/s, like motion's useVelocity(scrollY)
      vel += (raw - vel) * .12;                                // spring-ish smoothing
      const factor = vel / 1000 * 5;                           // velocityMapping { input: [0, 1000], output: [0, 5] }
      if (factor < 0) dirF = -1; else if (factor > 0) dirF = 1;
      x += dirF * base * (dt / 1000) * (1 + Math.abs(factor));
      x = gsap.utils.wrap(-w, 0, x);
      setX(x);
    });
  });

  // ---------- Magnet (React Bits): buttons lean toward a nearby pointer ----------
  if (fine) document.querySelectorAll('.btn').forEach(btn => {
    const padding = 60, strength = 3;
    const qx = gsap.quickTo(btn, 'x', { duration: .3, ease: 'power3.out' }), qy = gsap.quickTo(btn, 'y', { duration: .3, ease: 'power3.out' });
    window.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const near = Math.abs(cx - e.clientX) < r.width / 2 + padding && Math.abs(cy - e.clientY) < r.height / 2 + padding;
      qx(near ? (e.clientX - cx) / strength : 0); qy(near ? (e.clientY - cy) / strength : 0);
    }, { passive: true });
  });
})();
