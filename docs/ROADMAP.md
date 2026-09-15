# Roadmap

## Foundation — implemented

- [x] Astro static build with MDX and strict TypeScript configuration.
- [x] Responsive site shell, atlas, About page, and concept layout.
- [x] Gradient descent introduction with a static diagram.
- [x] Shared minimal visual language and contribution instructions.

## Learning navigation — implemented

- [x] 22 introductory lessons across foundational and applied subject groups.
- [x] Prerequisite graph with multiple parents, entry points, and derived next steps.
- [x] Map / List views, URL selection, and mobile vertical progression.
- [x] Worked examples and native expandable self-checks for generated lessons.
- [x] Validation of prerequisite references and cycles.

## Language-model journey — implemented

- [x] Ten-step overview linked to a continuous beginner narrative.
- [x] Combined what/why explanations with one concrete example per step.
- [x] Existing concepts and examples preserved in Map, List, and lesson pages.
- [x] Journey tab before Map and List, with existing map URLs preserved.
- [ ] Add executable character-tokenizer and bigram baseline exercises.
- [ ] Extend the build toward a tiny causal transformer and generation loop.

## Visual implementation planning

The [concept-by-concept assessment](VISUALIZATION-PLAN.md) covers static illustrations, animation, and interaction for all current lessons. Build the small shared plot/control components first, then use them for the gradient descent experiment below.

## Next — prove one learning experience

- [ ] Add a gradient descent experiment: learning rate, starting point, step, play/pause, reset, and current loss.
- [ ] Make convergence, overshooting, and divergence understandable.
- [ ] Test the numerical update and boundary behavior.
- [ ] Validate keyboard use, reduced motion, and phone usability.
- [ ] Get feedback from a few learners before extending the template.
- [ ] Configure automated checks and a first public deployment.

## Then — a connected introduction

- [x] Linear regression introduction: predictions, residuals, and loss.
- [ ] Backpropagation: how gradients flow through a small network.
- [x] Add prerequisites and related-concept links.
- [ ] Add equation rendering if notation outgrows plain text.

## Later — guided by actual use

Potential topics include vectors, matrix multiplication, probability, activation functions, regularization, convolution, attention, and transformers. Add concepts when there is a clear visual teaching approach, rather than targeting a page count.

Consider static search as the atlas grows. Offline support, quizzes, embeddings, and 3D experiments are optional future work. Accounts and a backend are outside the current scope; local bookmarks and progress would not inherently require either.
