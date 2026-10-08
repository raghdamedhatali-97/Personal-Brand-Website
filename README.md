# Personal Brand Website

Raghda Medhat Ali's personal website: a single static page on warm paper, with a **hand-painted, looping hero animation** made in code.

The animation engine is [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) by John Heibel (MIT): Clawd, a character kit for [p5.js](https://p5js.org) and [p5.brush](https://github.com/acamposuribe/p5.brush), and a headless renderer that turns a scene into an MP4. This repo recreates that kit and adds the website on top of it.

![The hero animation](site/assets/hero-poster.jpg)

## What's here

| path | what it is |
|---|---|
| [site/](site/) | **The website.** Plain HTML and CSS, no build step. This folder is what gets published. |
| [site/index.html](site/index.html) | All the page content. Search for `EDIT:` to find what to personalise. |
| [site/styles.css](site/styles.css) | The look: paper, ink and clay, matching the animation's palette. |
| [site/assets/](site/assets/) | The rendered hero video, its poster frame and the favicon. |
| [src/scenes/hero.js](src/scenes/hero.js) | The hero animation, "Growing": Clawd waters bar-chart seedlings into a rising chart. Storyboard in [STORYBOARD.md](STORYBOARD.md). |
| [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) | The kit's rules, workflow and full API, for making or changing animations. |
| [src/](src/) | The animation engine: Clawd ([clawd.js](src/clawd.js)), painting and timing ([core.js](src/core.js)), shots ([timeline.js](src/timeline.js)) |
| [render.mjs](render.mjs) | Headless renderer: contact sheets, stills, MP4 |
| [studio.html](studio.html) | Open in Chrome to scrub the animation |
| [serve.mjs](serve.mjs) | Local preview server for the site |
| [.github/workflows/pages.yml](.github/workflows/pages.yml) | Publishes `site/` to GitHub Pages |

## Edit the website

1. Open [site/index.html](site/index.html) and replace everything marked `EDIT:` and every `[bracketed placeholder]`: your story, experience, links and email.
2. Preview it: `npm run site`, then open http://localhost:8080.

## Publish it (GitHub Pages)

1. Merge into `main`.
2. In the repo on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` then publishes the `site/` folder to `https://raghdamedhatali-97.github.io/<repo-name>/`. A custom domain can be added on the same Settings page.

## Change the animation

Open the repo in Claude Code and ask, for example:

> Read ANIMATION_GUIDE.md, then change the hero animation in src/scenes/hero.js so Clawd builds a tower of coins instead of watering bars. Keep it an 8-second seamless loop.

Then re-render it into the site:

```bash
npm install
npm run sheet     # contact sheet of the animation → out/check/hero.jpg (look before rendering)
npm run hero      # renders the video and poster into site/assets/
```

You need Node.js, Chrome or Chromium, and ffmpeg. If Chrome isn't found, add `--chrome=<path>` to the commands in package.json or set `CHROME_PATH`. On a machine without a GPU (a laptop with integrated graphics, a cloud container), add `--soft-gl`.

### Lite mode

This repo adds a `--lite` flag to the renderer (and `?lite` to studio.html). It swaps p5.brush's watercolour fills, by far the most expensive mark, for flat translucent washes. Without a GPU that takes a frame from about 30 seconds to about a tenth of a second, at the cost of some pigment texture. The hero scene is painted with washes only, so it looks the same either way. `npm run hero` uses lite mode; drop `--lite` for the full watercolour look on a machine with a GPU.

## Credits

Animation kit: [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) © 2026 John Heibel, MIT licence (see [LICENSE](LICENSE)). Built on p5.js and p5.brush.
