# Design principles

TensorAtlas should feel like a precise reading tool. The concept is the focal point.

## Visual language

- Warm off-white background, near-black text, muted secondary text.
- Dark green remains the navigation accent. Journey explanations use semantic highlights: blue for prediction/probability, violet for representations, amber for learning/loss, teal for context, and green for generation.
- System sans-serif typography; monospace for small labels and code.
- Generous whitespace, subtle one-pixel rules, minimal ornament.
- Avoid decorative gradients, shadows, oversized badges, and unnecessary cards.
- Keep paragraphs at a comfortable reading width. Use a wider area only when a visualization benefits.

Tokens and responsive rules live in `src/styles/global.css`. Prefer shared conventions over page-specific overrides.

## Interaction

- Every control must answer a learning question.
- Provide visible labels and keyboard focus; never rely on color alone.
- Aim for at least 48px touch targets on controls.
- Keep the explanation readable without JavaScript.
- Respect reduced motion. Future animated experiments need pause and reset controls.
- Keep phone layouts readable without horizontal page scrolling. Code may scroll within its own container.

## Concept structure

1. A short title and one-sentence description.
2. Intuition grounded in a concrete example.
3. A diagram or experiment with a clear caption and text alternative.
4. The mathematical connection and a small code example when helpful.
5. A takeaway that states limitations as well as the insight.

## Review

Inspect desktop and narrow phone layouts, keyboard navigation, contrast, text wrapping, and diagram labels. Mathematical accuracy and explanatory clarity matter as much as appearance.

## Learning map

Show one concept’s neighborhood at a time: before this, learn this, explore next. Group the subject picker by category. Use fine branch lines on wide screens and a vertical flow on phones. Keep all lessons available in a list without scripting. Store selection in the URL so a lesson can return to the same neighborhood. Never lock a lesson behind prerequisites or imply completion merely from opening it.

## Journey view

Start with a complete working count model, not the machinery of a neural model. Seven short sections explain the cat/car/can collection, boundaries, pair counts, normalization, sampling, generation, and limitations. Keep its experiment on the same page. Learners can inspect every count and sampling step. A second page preserves the earlier neural-model progression; Map and List retain all concept lessons.

No automatic playback or hidden training. Changing frequencies rebuilds counts and resets generation. END stops output without becoming part of the displayed word. An empty collection has no model to sample. The default table remains readable without JavaScript.

## Explanatory typography

Use larger monospace characters, token IDs, vectors, and numeric comparisons to make examples legible as diagrams. Pair every highlight with a label or explicit operation; color alone never carries meaning. Keep body text neutral and highlight selected terms consistently through `ConceptText.astro`. `JourneyExample.astro` supplies labelled static typographic examples. All examples remain readable without JavaScript and are explicitly illustrative rather than live model output.

Keep the cat/car/can collection and one set of scoring values throughout the representation explanation. Establish that counts already solve the toy task. Motivate embeddings through short token-specific recipes and shared scoring patterns, with an explicit parameter-count comparison and expressiveness tradeoff. Introduce longer sentence contexts only as an explicit extension of the original collection. Never imply that the toy data requires embeddings or that invented attention shares came from training.

## Part Two: problems before mechanisms

Extend the cat/car/can data explicitly into sentences. Let users observe a memory limitation and an unseen context in a real counting experiment before introducing shared calculations. Keep computed probabilities distinct from invented neural examples. Pair embedding lookup, weights, training, order, and attention explanations with labelled diagrams. End by reconnecting the improved predictor to the same sample/append/stop loop from Part One. The context control remains keyboard accessible; forgotten text uses strikethrough as well as color.
