# Design principles

Tensorium should feel like a precise reading tool. The concept is the focal point.

## Visual language

- Warm off-white background, near-black text, muted secondary text.
- One dark green accent for links, active controls, and meaningful diagram elements.
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
