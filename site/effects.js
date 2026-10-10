// effects.js: motion for the site, built on GSAP (+ ScrollTrigger, SplitText) and Lenis smooth scrolling.
// The word-by-word text reveal is a vanilla port of the React Bits SplitText component
// (https://github.com/DavidHDev/react-bits).
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
    // ---------- hero intro: the name rises word by word, then the details follow ----------
    const head = new SplitText('.hero h1', { type: 'lines,words', mask: 'lines' });
    gsap.set('.hero > *', { autoAlpha: 1 });
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .from('.hero .eyebrow', { autoAlpha: 0, y: 12, duration: .6 })
      .from(head.words, { yPercent: 110, duration: 1.1, stagger: .08 }, '-=.3')
      .from('.hero-lede, .hero .cta', { autoAlpha: 0, y: 24, duration: .8, stagger: .1 }, '-=.6')
      .from('.facts div', { autoAlpha: 0, y: 16, duration: .6, stagger: .06 }, '-=.5')
      .from('.badge', { autoAlpha: 0, scale: .6, rotate: -90, duration: 1, ease: 'back.out(1.6)' }, '-=1');

    // ---------- SplitText (React Bits): statements and section titles rise in word by word ----------
    document.querySelectorAll('.statement, .section-head h2, .quote-band blockquote').forEach(el => {
      const split = new SplitText(el, { type: 'lines,words', mask: 'lines' });
      gsap.from(split.words, { yPercent: 100, duration: 1, ease: 'power3.out', stagger: .025,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });

    // ---------- blocks arrive in a staggered wave ----------
    const wave = '.about > *, .roles > li, .case, .skill-groups > div, .edu li, .section-head .eyebrow, .quote-band figcaption, .contact .cta';
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
