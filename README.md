# TensorAtlas

A mobile-first visual atlas of machine learning. Clear explanations, useful diagrams, and eventually interactive experiments that connect intuition to mathematics.

## Current state

An early, working learning atlas with 22 introductory lessons across 16 subject groups.

- A Lab / Journey / Map / List switch. Lab is the default for new visits; existing concept links still open the map.
- A seven-step tiny-model journey: examples, boundaries, pair counts, probabilities, sampling, generation, and limitations.
- A working cat/car/can experiment with editable frequencies, a live count table, token-by-token generation, and an explicit END marker.
- Part Two continues from observed limitations: a live context-length experiment, unseen contexts, shared representations, and visual explanations of the neural prediction path.
- One short explanation and concrete example per step, with a linked overview and semantic color highlights.
- A branching prerequisite explorer.
- Four starting concepts with no earlier lesson: vectors, functions, probability, and graphs.
- A focused view of each concept’s prerequisites and next steps; branching connections on desktop and vertical progression on narrow screens.
- Shareable selection in the URL, browser back/forward support, and a return link from each lesson.
- Short explanations, concrete examples, and self-checks; the original gradient descent lesson includes a static SVG diagram and Python example.
- A fully usable lesson list without JavaScript.

Connections represent suggested preparation for these introductions, not an exhaustive curriculum or formal proof that a topic is mastered. More interactive experiments, search, and offline access remain planned. See [the roadmap](docs/ROADMAP.md).

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

## Publish at tensoratlas.org

The site is configured for `https://tensoratlas.org`. No application server or database is required. The repository can retain its `tensorium` name.

1. In the repository's Settings → Pages, choose **GitHub Actions** as the source and save **tensoratlas.org** as the custom domain before changing DNS.
2. At your DNS provider, configure these records (replace conflicting parking records for these names):

   | Type | Name | Value |
   | --- | --- | --- |
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | jipijipi.github.io |

3. Push these changes to `main`. `.github/workflows/deploy.yml` checks, builds, and deploys the site on each push. You can also run it manually from Actions.
4. Once GitHub's DNS check and certificate provisioning finish, enable **Enforce HTTPS** in Pages settings. DNS and certificate availability can take up to 24 hours.

The custom domain serves the site at `/`, so no repository base path is configured. GitHub Actions deployments use the custom domain saved in Pages settings; a repository `CNAME` file is not required.

See [Astro's deployment guide](https://docs.astro.build/en/guides/deploy/github/) and [GitHub's domain setup guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

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

The full first journey stays on the homepage. Part Two lives in `src/data/neural-journey.json` at `/journey/neural/`. It follows 11 problem-led steps and includes `ContextExperiment.astro`: real character counts from three explicitly introduced sentences, with 1/3/8-character memory and an unseen-context option. `NeuralVisual.astro` adds static diagrams for embedding lookup, weighted sums, probability comparisons, positions, attention mixtures, and the transformer block. Neural values on the Journey are illustrative; the Lab runs real neural training. The 22 concept lessons remain in Map and List. With JavaScript disabled, the lesson and initial count table remain readable.

## Browser model lab

The homepage Lab trains a character language model from pasted text entirely in a dedicated browser worker. Click **Build my models**, **Train the transformer**, then pause and generate one character at a time or 80 at once. **Watch one update** exposes a real input/target passage, its correct-answer probability before and after, and one output bias with its gradient and update. A one-character count baseline uses the same training split. Live views show token IDs, raw next-character probabilities, learned embeddings, causal attention, and training/held-out loss.

The neural model has one decoder block, one attention head, width 16, context 16, a 32-unit ReLU feed-forward layer, learned positions, residual connections, and non-affine layer normalization. It uses TensorFlow.js on the CPU, cross-entropy loss and Adam (learning rate 0.005, elementwise gradient clipping to ±1). The included 19-token example has 2,979 trainable parameters. Batch size is eight, with a 400-update cap per reset. Training yields after each update; leaving the Lab or hiding the page pauses it. Worker termination handles resets and text edits.

Input accepts 160–50,000 Unicode code points and 2–128 distinct characters. IDs label characters, including spaces and newlines. The last 10% is held out before windows are sampled; no training window crosses that split. The loss chart evaluates eight fixed passages per split every ten updates. The repeated sample is deliberately easy and is not evidence of generalization. Generation uses at most the previous 16 characters, rejects unknown prompt characters, and stops by length (there is no END token in this continuous-text model). Temperature changes sampling probabilities only. The count baseline falls back to training-character frequencies if no successor was observed.

All model values shown in the Lab come from the current model. Attention is a mixing weight, not a complete explanation. Training and generation are mutually exclusive. This experiment is a tiny neural language model, not a pretrained LLM or instruction-following assistant. Text and weights stay in tab memory; they are not uploaded or saved. The packaged worker and numerical library load from the site's own origin only when a model is built.

Implementation: `src/components/ModelLab.astro` (layout), `src/lib/lab-client.ts` (interaction), `src/workers/lab.worker.ts` (scheduling), and `src/lib/browser-model.ts` (model). `npm test` checks numerical gradients, causal masking, learning, Unicode, sampling, and tensor cleanup in addition to the existing counting experiments.

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
