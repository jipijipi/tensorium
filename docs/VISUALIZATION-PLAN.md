# Visualization feasibility

Assessment of all 22 current concepts, dated 2026-09-15. These are design and engineering judgments for TensorAtlas’s introductory lessons, not estimates for implementing full research systems.

## Scope and rating scale

The aim is one clear learning experiment per concept, usable on a phone. Each proposal has three independently useful forms:

- **Illustration:** a static diagram that teaches something without movement or input.
- **Animation:** a paced explanation of change or a sequence of computational steps. Learners can pause, step, and reset.
- **Interaction:** learners change a meaningful input and observe a mathematically consistent result. Clicking to reveal text alone does not count.

**Easy:** small deterministic calculation or diagram, few states, reusable controls. **Moderate:** coordinated views, iterative state, sampling, or nontrivial numerical and explanatory edge cases. **Hard:** model artifacts or training, a learning simulation, or substantial work to keep the example both responsive and faithful.

Ratings include an accessible, responsive implementation and explanatory polish. They assume shared plotting and playback components exist; building those first adds setup work. They are relative difficulty ratings, not delivery dates. A concept can be easy to depict but much harder to simulate honestly.

**Current implementation:** gradient descent has a static SVG illustration. The other lesson proposals below are not built. The atlas navigation and answer reveals are interactive UI, but there are no interactive mathematical experiments or animated lesson diagrams yet.

## At a glance

Difficulty applies to the bounded proposals below. An asterisk marks where the simplest experiment demonstrates only part of the concept; the fuller version is harder.

| Concept | Category | Illustration | Animation | Interaction | Teaching opportunity |
|---|---|---|---|---|---|
| [Vectors](#vectors) | Linear algebra | Easy | Easy | Easy | Components become position and direction |
| [Dot product](#dot-product) | Linear algebra | Easy | Easy | Easy | Inputs and weights combine into one score |
| [Matrices](#matrices) | Linear algebra | Easy | Moderate | Moderate | Several weighted sums transform a vector |
| [Functions](#functions) | Calculus | Easy | Easy | Easy | Distinguish changing an input from changing a rule |
| [Derivatives](#derivatives) | Calculus | Easy | Moderate | Moderate | Local slope predicts a small change |
| [Probability](#probability) | Probability & statistics | Easy | Easy | Easy | Compare theoretical probability and observed frequency |
| [Distributions](#distributions) | Probability & statistics | Easy | Easy | Easy | A Bernoulli parameter changes the whole distribution |
| [Loss functions](#loss) | Optimization | Easy | Easy | Easy | Error becomes a training objective |
| [Gradient descent](#gradient-descent) | Optimization | Easy | Moderate | Moderate | Step size changes convergence |
| [Linear regression](#linear-regression) | Supervised learning | Easy | Moderate | Moderate | A fitted line balances residuals |
| [Artificial neurons](#neurons) | Neural networks | Easy | Easy | Easy | Weighted sum, bias, and activation are separate steps |
| [Convolution](#convolution) | Vision | Easy | Moderate | Moderate | One filter is reused across positions |
| [Sequences](#sequences) | Sequence models | Easy | Easy | Easy | Order changes meaning |
| [Attention](#attention) | Sequence models | Moderate | Moderate | Moderate | Scores become weights and a weighted output |
| [Clustering](#clustering) | Unsupervised learning | Easy | Moderate | Moderate | Assignments and centers update in turn |
| [Graphs](#graphs) | Graph learning | Easy | Easy | Moderate | Direction changes reachable neighbors |
| [Agents & rewards](#reinforcement-learning) | Reinforcement learning | Easy | Moderate | Moderate* | Actions accumulate rewards over a trajectory |
| [Train & test](#evaluation) | Evaluation | Easy | Moderate | Moderate | Fitting and evaluation have different roles |
| [Regularization](#regularization) | Generalization | Moderate | Moderate | Moderate | A penalty trades fitting accuracy for smaller weights |
| [Inference & deployment](#deployment) | Deployment | Easy | Easy | Easy* | Preprocessing must match the saved model |
| [Autoencoders](#autoencoders) | Architectural patterns | Easy | Moderate | Hard | A bottleneck limits reconstruction |
| [Feature effects](#feature-effects) | Interpretability | Easy | Easy | Easy* | A model response differs from a causal claim |

## Concrete treatments

### Vectors

- **Illustrate:** show [x, y] beside an arrow on a labelled two-dimensional plane; match each entry to an axis.
- **Animate:** construct x and y components, then place a second arrow tip-to-tail to explain addition.
- **Interact:** drag the endpoint or edit two numeric inputs; update coordinates, components, and an optional vector sum.
- **Watch for:** do not suggest all feature vectors represent physical directions. Mixed units such as area and room count need explicit labels. Provide numeric controls as an alternative to dragging.

### Dot product

- **Illustrate:** pair two inputs with two weights, show each product, then their sum. Add a geometric projection as a later view.
- **Animate:** highlight multiply, multiply, add, keeping intermediate values visible.
- **Interact:** change inputs or weights and observe signed contributions and the total. An optional angle control explores the geometric interpretation.
- **Watch for:** negative contributions need signs, not just color. If adding a normalized-similarity view, handle zero-length vectors and clearly distinguish it from the raw dot product.

### Matrices

- **Illustrate:** show a 2×2 matrix, an input vector, and one output entry per row; pair this with a transformed coordinate grid.
- **Animate:** evaluate rows one at a time, then interpolate from the original grid to its transformed position.
- **Interact:** edit four matrix entries or select identity, scale, shear, and rotation presets. Keep a single test vector visible.
- **Watch for:** the interpolation is a visual transition, not repeated matrix application. Collapsed dimensions and reflections are valid outcomes. A general matrix editor would be significantly more work.

### Functions

- **Illustrate:** connect input → rule → output with a corresponding point on a graph of y = ax + b.
- **Animate:** sweep the input along the graph while displaying its output.
- **Interact:** separate controls for x, a, and b. Changing x moves along the line; changing a or b changes the line itself.
- **Watch for:** preserve this input/parameter distinction in labels. Start with a fixed family of functions rather than accepting arbitrary expressions.

### Derivatives

- **Illustrate:** draw a curve, two nearby points, a secant, and a tangent at the reference point.
- **Animate:** reduce the distance between the points to show the secant approaching the tangent.
- **Interact:** move the reference point and change the separation; compare the finite-difference slope with the analytic derivative for x².
- **Watch for:** avoid division by zero and cancellation at tiny separations. Label the finite difference as an approximation; a tangent is not an exact predictor over a large interval.

### Probability

- **Illustrate:** six equally sized outcome cells for a fair die, with even outcomes marked by both text and pattern.
- **Animate:** sample rolls and update outcome counts and the observed proportion of even rolls.
- **Interact:** select an event and run one roll or a batch; compare the observed frequency with the known probability.
- **Watch for:** random variation should remain visible. Convergence is not monotonic and finite samples need not match theory. Use seeded sampling for reproducible checks, and avoid a decorative 3D die.

### Distributions

- **Illustrate:** two Bernoulli bars labelled P(0) = 1 − p and P(1) = p, with the expected value shown separately.
- **Animate:** change p while the bars change together; optionally accumulate sampled outcomes.
- **Interact:** adjust p and sample a batch. Keep theoretical probabilities distinct from empirical frequencies.
- **Watch for:** expected value 0.7 is not an outcome of a Bernoulli trial. Cover p = 0 and p = 1. Continuous densities and several distribution families would raise the rating to Moderate.

### Loss

- **Illustrate:** place a target and prediction on a number line, with their residual and squared error alongside.
- **Animate:** move the prediction toward and past the target while tracing squared error on a second plot.
- **Interact:** edit prediction and target; optionally compare absolute and squared error using the same residual.
- **Watch for:** distinguish signed residual from nonnegative loss. Keep scales consistent so the visual comparison does not exaggerate one objective.

### Gradient descent

- **Illustrate:** refine the existing curve with explicit parameter and loss coordinates and a labelled update step.
- **Animate:** step through gradient evaluation and parameter updates; plot the actual loss history.
- **Interact:** adjust starting point and learning rate; support step, play/pause, and reset on L(x) = x².
- **Watch for:** stop or bound runaway values and report divergence rather than clipping it into apparent convergence. For this update, rates between 0 and 1 converge; rate 1 oscillates for a nonzero start, and larger positive rates diverge. This is specific to x², not a universal learning-rate rule.

### Linear regression

- **Illustrate:** show a small scatterplot, prediction line, and vertical residuals.
- **Animate:** transition between parameter choices while recalculating predictions and loss. A later training mode can show real optimization steps.
- **Interact:** move points, adjust slope/intercept, and offer a least-squares fit action; show mean squared error.
- **Watch for:** define a fallback when all input x values are identical. A decorative line transition must not be labelled gradient descent. Keep the dataset small and provide a point editor for keyboard users.

### Neurons

- **Illustrate:** two inputs flow through labelled weights into a sum, bias, and activation plot.
- **Animate:** reveal products, pre-activation value, then output in order.
- **Interact:** change two weights and a bias; switch between linear and ReLU activation and inspect the output.
- **Watch for:** moving dots are explanatory markers, not a biological claim. Keep numerical values available without animation. Live network training is outside this Easy version.

### Convolution

- **Illustrate:** highlight a window of a small input grid, its filter coefficients, the products, and one output cell.
- **Animate:** slide the filter one position at a time and fill in the output grid.
- **Interact:** choose a small filter preset, edit input cells, and step through positions. Add stride/padding controls only after the fixed case is clear.
- **Watch for:** specify the unflipped cross-correlation convention used by the lesson. Test boundary and shape calculations. Signed outputs require a labelled scale; start with a one-dimensional strip on small screens if three grids become cramped.

### Sequences

- **Illustrate:** compare an ascending series with its reversed order, using numbered positions.
- **Animate:** reveal observations in order or play a small time cursor through the sequence.
- **Interact:** swap adjacent entries with buttons, reverse, or shuffle; update the trend plot and position labels.
- **Watch for:** the lesson teaches order, not a trained sequence model. Avoid a sentence example that implies the site understands language. Dragging must be optional.

### Attention

- **Illustrate:** a tiny query, three keys, scores, normalized weights, and three values feeding a weighted sum.
- **Animate:** reveal query–key scores, normalize them, then show each contribution to the output.
- **Interact:** select a query or edit a few two-dimensional query/key values; recompute weights and the output. A small weight heatmap can show multiple queries later.
- **Watch for:** distinguish queries, keys, and values. Use a numerically stable softmax; state whether scores are scaled. Hand-built toy vectors are not learned language embeddings. Interpretation is the main challenge, not compute cost.

### Clustering

- **Illustrate:** a two-dimensional point cloud with cluster membership and centers marked by symbols as well as color.
- **Animate:** alternate assignment to the closest center and recomputation of means, explicitly naming each phase.
- **Interact:** choose k, move a few points or initial centers, then step or run k-means.
- **Watch for:** handle empty clusters, ties, duplicate points, and iteration limits deterministically. Different initial centers can lead to different results; avoid implying one clustering is uniquely correct.

### Graphs

- **Illustrate:** four labelled nodes with a small set of directed and undirected edges.
- **Animate:** trace a specified path or reveal reachable nodes one hop at a time.
- **Interact:** select a source node and toggle a few predefined edges or their direction; update neighbors and reachability.
- **Watch for:** use a fixed layout so nodes do not jump while the learner reasons. A free-form graph editor with automatic layout is a larger project. Labels and an adjacency list should provide a nonvisual equivalent.

### Reinforcement learning

- **Illustrate:** state → action → next state and reward, alongside a tiny gridworld.
- **Animate:** replay a trajectory with immediate and cumulative rewards displayed separately.
- **Interact — Moderate:** choose actions manually, or compare a few explicitly fixed policies while editing step/goal rewards. This teaches the decision setting and reward accounting.
- **Full learning — Hard:** add a small tabular learner, exploration controls, seeded episodes, and policy/value views. Clearly separate the learning phase from evaluation.
- **Watch for:** a manually controlled agent or scripted route is not learning. Define terminal rewards and step costs precisely, cap episode length, and introduce discounting explicitly if used.

### Evaluation

- **Illustrate:** separate training, validation, and test data, with arrows showing which decisions each set may influence.
- **Animate:** show a predetermined train → select using validation → final test sequence.
- **Interact:** use seeded synthetic data, choose model complexity using training/validation views, then reveal the held-out score. Starting a new exploration resets the experiment.
- **Watch for:** permanently displaying test error while users tune teaches leakage. Repeated reveal-and-retune behavior must be labelled as compromising the final test. Label synthetic examples as demonstrations, not evidence about a real model.

### Regularization

- **Illustrate:** compare weak and strong penalties on a small fitted model, with weights and data-fit error shown separately.
- **Animate:** sweep the penalty strength and update the fitted curve and coefficients.
- **Interact:** adjust a ridge penalty on fixed, standardized synthetic features; show training and validation errors without guaranteeing that validation error improves.
- **Watch for:** keep the intercept treatment explicit. Use a stable small solver or a disclosed precomputed parameter sweep; avoid naive matrix inversion near singular cases. Separate the penalized objective from raw prediction error.

### Deployment

- **Illustrate:** saved preprocessing → frozen model → prediction, showing the same feature order and scaling used in training.
- **Animate:** follow one record through each transformation, displaying intermediate values.
- **Interact — Easy:** toggle a deliberately incorrect feature order or omitted scaling and compare a toy model’s outputs with the correct pipeline.
- **Larger version:** real service latency, concurrent requests, and drift monitoring are a different scope; a local animation cannot substantiate operational performance claims.
- **Watch for:** label failures as simulations. Keep model parameters fixed during inference, and avoid suggesting that prediction changes mean the model is retraining.

### Autoencoders

- **Illustrate — Easy:** input → narrow representation → reconstruction, with corresponding input/output cells and reconstruction error.
- **Animate — Moderate:** reveal those stages using verified stored activations from a small model. This can explain a forward pass without live training.
- **Interact — Hard:** ship a small fixed pretrained decoder/encoder and let the learner change a bounded input or latent coordinate; recompute reconstructions in the browser. Model preparation, asset size, out-of-distribution behavior, and honest explanations drive the cost.
- **Simpler alternative — Moderate:** explore a disclosed finite set of precomputed reconstructions. Controls must stay within the stored cases. A linear projection can illustrate compression but must be labelled as a simplification, not presented as a trained nonlinear autoencoder.
- **Watch for:** do not invent plausible reconstructions or imply arbitrary latent changes are meaningful. Live training adds further work and is not needed for the first lesson.

### Feature effects

- **Illustrate:** hold room count constant and plot predicted output against area for the lesson’s toy linear model.
- **Animate:** sweep area while linking the current input, prediction, and point on the response curve.
- **Interact — Easy:** select a baseline and change one feature while all others stay fixed. Display the change in the model’s prediction.
- **Larger version:** dataset-averaged effects, correlated-feature constraints, and explanations of complex models require additional design and validation.
- **Watch for:** call the result a model response, not a real-world intervention. Flag unrealistic combinations in any expanded example; do not label this simple sweep as SHAP or a causal explanation.

## Suggested implementation order

This order balances teaching progression, component reuse, and delivery risk. It does not change the prerequisite graph.

1. **Functions, vectors, dot product, loss.** Establish a plot, labelled values, numeric controls, and a small set of visual conventions. These provide the simplest high-value interactions.
2. **Derivatives and gradient descent.** Use the same plot and controls to deliver the first complete animated learning sequence. Gradient descent remains the first flagship experiment in the roadmap.
3. **Neurons, matrices, linear regression.** Reuse weighted sums and plots; introduce coordinated views and simple fitting.
4. **Probability and distributions; then sequences and graphs.** Add seeded sampling, reordering, and discrete relationships.
5. **Convolution, clustering, attention.** Reuse a shared step player and small grids. Budget extra effort for intermediate-state explanations.
6. **Evaluation, regularization, feature effects, and deployment.** Build careful comparisons using common synthetic data and explicit assumptions.
7. **Agents & rewards, then autoencoders.** Start with the bounded reward exercise. Defer actual reinforcement learning and a model-backed autoencoder until the simpler lesson format works well.

## Shared implementation and review rules

- Use native SVG/HTML for these small diagrams and plain browser-side TypeScript for calculations. Add a library only for a demonstrated need; none of the first proposals requires a server or 3D.
- Build reusable plot axes, numeric/range controls, a value readout, and a step player. Keep mathematical state separate from animation timing.
- Render a meaningful initial illustration and text explanation without JavaScript. Enable controls only when ready; retain the static lesson if initialization fails.
- Give every animation step, pause, and reset controls. Avoid autoplay. Reduced-motion mode should show discrete state changes with the same information.
- On phones, stack coordinated views; favor one or two primary controls and put optional settings behind a disclosure. Never make hover or drag the only way to learn.
- Test numerical invariants and failure cases, not just screenshots: probability weights sum to one, matrix dimensions agree, updates match the equation, clustering terminates, and training never consumes held-out data.
- Make randomness reproducible for review. Distinguish computed, simulated, and precomputed results in lesson captions whenever that affects interpretation.
- Before building each experiment, write a question the learner should answer after using it. Remove controls or movement that do not help answer that question.

Reassess these ratings when the lesson scope changes. A new concept in `src/data/concepts.json` should receive a row and a bounded proposal here before visual implementation is prioritized.
