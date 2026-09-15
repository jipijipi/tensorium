# Design principles

Tensorium should feel like a precise reading tool. The concept is the focal point.

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

Use a continuous beginner narrative: a need introduces an idea, a small example makes it concrete, and a transition motivates the next idea. Keep the ten-step overview linked to visible sections. Combine what and why in one explanation. No deeper sections or quizzes in this view; the concept library remains in Map and List. Start with characters, then distinguish token IDs, probability vectors, and learned embeddings. Opening or reading a section never implies completion.

## Explanatory typography

Use larger monospace characters, token IDs, vectors, and numeric comparisons to make examples legible as diagrams. Pair every highlight with a label or explicit operation; color alone never carries meaning. Keep body text neutral and highlight selected terms consistently through `ConceptText.astro`. `JourneyExample.astro` supplies labelled static typographic examples. All examples remain readable without JavaScript and are explicitly illustrative rather than live model output.
