# Tensorium

A mobile-first visual atlas of machine learning. Clear explanations, useful diagrams, and eventually interactive experiments that connect intuition to mathematics.

## Current state

An early, working Astro template. It includes:

- A responsive atlas homepage and About page.
- A reusable MDX concept layout.
- A gradient descent introduction with a static SVG diagram and Python example.
- Shared styles, keyboard focus indicators, a skip link, and reduced-motion support.

Interactive experiments, search, offline access, and learning paths are **planned**, not implemented. See [the roadmap](docs/ROADMAP.md).

## Run locally

Use Node.js 22.19 or newer on a supported even-numbered release, and npm. `.nvmrc` selects Node 22.

```sh
git clone https://github.com/jipijipi/tensorium.git
cd tensorium
npm ci
npm run dev
```

Open the local URL printed by Astro (normally `http://localhost:4321`).

```sh
npm run check    # Astro and TypeScript diagnostics
npm run build    # Generate static files in dist/
npm run preview  # Inspect the production build locally
```

Deploy the generated `dist/` directory to a static host. No application server or database is required. Hosting and deployment automation are not configured yet; subdirectory hosting will require base-path configuration.

## Technical foundation

Astro generates static pages. MDX combines written explanations with Astro components. TypeScript uses Astro's strict configuration. Plain CSS provides the design system without a UI framework or utility library.

Introduce visualization or math libraries only when a concept needs them. The initial diagram uses native SVG and sends no component JavaScript to the browser.

```text
src/
  components/             Reusable diagrams and future experiments
  layouts/                Site shell and concept layout
  pages/
    index.astro           Atlas, generated from concept MDX metadata
    about.astro
    concepts/*.mdx        Concept pages and their metadata
  styles/global.css       Shared styles and design tokens
public/                   Static assets
```

## Add a concept

Create `src/pages/concepts/your-concept.mdx`. The filename becomes its URL and the atlas automatically lists it. Start with:

```mdx
---
layout: ../../layouts/ConceptLayout.astro
title: Your concept
description: One sentence describing the idea.
category: Foundations
difficulty: Beginner
---

## The intuition

Start with a concrete explanation.

## What to remember

Describe the useful insight and its limits.
```

All four descriptive metadata fields are expected by the template. Import diagrams from `src/components/` when needed. Use the existing gradient descent page as a complete example.

Before submitting, run the checks and production build, verify the mathematics, and inspect the page on a narrow screen and with keyboard navigation. Add meaningful numerical tests when introducing algorithmic behavior.

## Design direction

**Tech minimalism: uncluttered, functional, clean.**

Use generous space, readable typography, subtle rules, and restrained color. Controls should serve the explanation. See [design principles](docs/DESIGN.md) for the working conventions.

## Contributing

Open an [issue](https://github.com/jipijipi/tensorium/issues) for a proposal or submit a focused pull request. Explanations, corrections, accessibility improvements, and visual experiments are welcome.

## License

[MIT](LICENSE).
