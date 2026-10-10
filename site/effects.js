// effects.js: motion for the site, built on GSAP (+ ScrollTrigger, SplitText) and Lenis smooth scrolling.
// The word-by-word text reveal and the scroll-linked speed of the card wall are vanilla ports of React Bits components
// (https://github.com/DavidHDev/react-bits): SplitText and ScrollVelocity.
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

  // ---------- Lenis: smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync ----------
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, anchors: { offset: -80 } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.fonts.ready.then(() => {
    // ---------- hero intro: the headline rises word by word, the badge rolls in ----------
    const head = new SplitText('.hero h1', { type: 'lines,words', mask: 'lines' });
    gsap.set('.hero h1, .badge', { autoAlpha: 1 });
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .from(head.words, { yPercent: 110, duration: 1.1, stagger: .07 })
      .from('.badge', { autoAlpha: 0, scale: .6, rotate: -90, duration: 1, ease: 'back.out(1.6)' }, '-=.7')
      .from('.wall .col', { yPercent: 18, autoAlpha: 0, duration: 1.2, stagger: { each: .06, from: 'center' } }, '-=.9');

    // ---------- card wall: each column drifts on its own loop, alternating up and down ----------
    gsap.utils.toArray('.wall .col').forEach((col, i) => {
      [...col.children].forEach(c => col.appendChild(c.cloneNode(true)).setAttribute('aria-hidden', 'true'));
      const dir = i % 2 ? 1 : -1, half = () => (col.scrollHeight + parseFloat(getComputedStyle(col).rowGap || 0)) / 2;   // one set plus one gap: a seamless loop
      const tween = gsap.fromTo(col, { y: dir < 0 ? 0 : () => -half() }, { y: dir < 0 ? () => -half() : 0, duration: 38 + (i % 3) * 7, ease: 'none', repeat: -1, invalidateOnRefresh: true });
      // scrolling the page nudges the wall along, like ScrollVelocity
      if (lenis) lenis.on('scroll', ({ velocity }) => tween.timeScale(1 + Math.min(4, Math.abs(velocity) * .25)));
      col.addEventListener('pointerenter', () => gsap.to(tween, { timeScale: .15, duration: .5 }));
      col.addEventListener('pointerleave', () => gsap.to(tween, { timeScale: 1, duration: .5 }));
    });

    // ---------- SplitText (React Bits): statements and section titles rise in word by word ----------
    document.querySelectorAll('.statement, .section-head h2, .quote-band blockquote').forEach(el => {
      const split = new SplitText(el, { type: 'lines,words', mask: 'lines' });
      gsap.from(split.words, { yPercent: 100, duration: 1, ease: 'power3.out', stagger: .025,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });

    // ---------- blocks arrive in a staggered wave ----------
    const wave = '.partner-side > *, .do-list li, .case, .section-head .eyebrow, .quote-band figcaption, .contact .cta';
    gsap.set(wave, { autoAlpha: 0, y: 36 });
    ScrollTrigger.batch(wave, { start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08 }) });

    // the work illustrations draw themselves when they arrive
    gsap.utils.toArray('.a-cream rect').forEach((r, i) => gsap.from(r, { scaleY: 0, transformOrigin: '50% 100%', duration: .7, ease: 'back.out(1.6)', delay: i * .1,
      scrollTrigger: { trigger: '.a-cream', start: 'top 80%', once: true } }));
    gsap.from('.node', { autoAlpha: 0, scale: .8, transformOrigin: '50% 50%', duration: .6, stagger: .08, ease: 'back.out(2)', scrollTrigger: { trigger: '.a-navy', start: 'top 80%', once: true } });
    const spark = document.querySelector('.spark');
    if (spark) { const len = spark.getTotalLength(); gsap.fromTo(spark, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: '.a-blush', start: 'top 80%', once: true } }); }

    ScrollTrigger.refresh();
  });

})();
