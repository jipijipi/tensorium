# Tensorium

A mobile-first visual atlas of machine learning. Clear explanations, useful diagrams, and eventually interactive experiments that connect intuition to mathematics.

## Current state

An early, working learning atlas with 22 introductory lessons across 16 subject groups.

- A Journey / Map / List switch. Journey is the default for new visits; existing concept links still open the map.
- A seven-step tiny-model journey: examples, boundaries, pair counts, probabilities, sampling, generation, and limitations.
- A working cat/car/can experiment with editable frequencies, a live count table, token-by-token generation, and an explicit END marker.
- The earlier neural-model journey preserved as a separate Part Two.
- One short explanation and concrete example per step, with a linked overview and semantic color highlights.
- A branching prerequisite explorer.
- Four starting concepts with no earlier lesson: vectors, functions, probability, and graphs.
- A focused view of each concept’s prerequisites and next steps; branching connections on desktop and vertical progression on narrow screens.
- Shareable selection in the URL, browser back/forward support, and a return link from each lesson.
- Short explanations, concrete examples, and self-checks; the original gradient descent lesson includes a static SVG diagram and Python example.
- A fully usable lesson list without JavaScript.

Connections represent suggested preparation for these introductions, not an exhaustive curriculum or formal proof that a topic is mastered. Interactive experiments, search, and offline access remain planned. See [the roadmap](docs/ROADMAP.md).

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
  data/concepts.json        Content and prerequisite relationships
  pages/
    index.astro           Map and list generated from concept data
    about.astro
    concepts/[id].astro   Generated introductory lessons
    concepts/*.mdx        Bespoke concept pages
  styles/global.css       Shared styles and design tokens
public/                   Static assets
```

## Journey content

`src/data/journey.json` defines the seven-step counting-model introduction. `src/components/TinyModel.astro` exposes the full training table and generation trace. `src/lib/tiny-model.ts` implements counting and sampling; `npm test` checks normalization, boundaries, stopping, and invalid input handling. Input counts are whole numbers from 0 to 100; an empty collection disables generation. Sampling uses browser randomness and does not promise exact proportions in small runs.

The full first journey stays on the homepage. The existing neural explanation is preserved in `src/data/neural-journey.json` at `/journey/neural/`. The 22 concept lessons remain in Map and List. With JavaScript disabled, the lesson and initial count table remain readable.

## Add a concept

Add an entry to `src/data/concepts.json` with a unique `id`, `title`, `category`, `prerequisites` (an array of existing IDs), `description`, `intuition`, `example`, `takeaway`, `question`, and `answer`.

The atlas and `src/pages/concepts/[id].astro` generate the navigation and introductory lesson automatically. No prerequisite means an entry point. Only add a connection when the earlier lesson helps explain the later one; a concept may have multiple prerequisites. Next-step links are derived from those relationships.

For a richer lesson, add a dedicated MDX page using `ConceptLayout.astro` and exclude its ID from the generic route in `[id].astro`, as done for gradient descent. Keep the shared metadata aligned with the lesson. The layout derives prerequisite links from the URL’s concept ID.

`npm run check` validates content, unique IDs, prerequisite references, and absence of cycles before running Astro diagnostics. Before submitting, also build, verify examples, and inspect keyboard and narrow-screen behavior.

## Design direction

**Tech minimalism: uncluttered, functional, clean.**

Use generous space, readable typography, subtle rules, and restrained color. Controls should serve the explanation. See [design principles](docs/DESIGN.md) for the working conventions.

## Visual lesson planning

See the [visualization feasibility assessment](docs/VISUALIZATION-PLAN.md) for all 22 concepts: separate illustration, animation, and interaction difficulty ratings, concrete teaching ideas, implementation pitfalls, and a suggested build order. These are proposals, not implemented experiments.

## Contributing

Open an [issue](https://github.com/jipijipi/tensorium/issues) for a proposal or submit a focused pull request. Explanations, corrections, accessibility improvements, and visual experiments are welcome.

## License

[MIT](LICENSE).
