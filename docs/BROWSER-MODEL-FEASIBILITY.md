# A local language-model lab

Feasibility assessment, 2026-09-16. The initial Lab is now implemented; the proposal below records the original design options. See README for the shipped architecture (width 16, one head, context 16, CPU worker, 400-update cap), rather than the larger candidate discussed here. Desktop browser training and generation have been verified; representative physical-phone performance remains unmeasured.

## Recommendation

Build a small character-level language model that trains from random initialization on pasted text, entirely in the browser. The educational endpoint should be a tiny decoder-only transformer. Call it a “tiny language model”: it demonstrates LLM mechanisms without implying large scale or general competence.

Keep the count model beside it as a baseline on the same text. The experience should make the difference between counting transitions and learning parameters visible, without promising the neural model will outperform counts on small data.

## Evidence and practical limits

TensorFlow.js supports browser training, including custom training loops ([training guide](https://www.tensorflow.org/js/guide/train_models)). Its official [character-level text generation example](https://github.com/tensorflow/tfjs-examples/blob/master/lstm-text-generation/README.md) trains and generates in the browser; that example is an LSTM, not a transformer.

Karpathy’s [microgpt](https://karpathy.github.io/2026/02/12/microgpt/) is a compact reference for a complete tiny GPT training pipeline. It establishes that the algorithm can be small; its pure-Python implementation is not evidence of browser speed.

The current site is already static Astro with client-side count-model calculations. A local lab fits this architecture: no inference API, account, backend, or external training service is necessary. Runtime assets still need to load; offline availability would require explicit asset caching.

## User experience

1. **Paste text.** Also offer a short bundled corpus with repeated patterns and a longer sample for more interesting results. Show character count, vocabulary, and the limits of a very small dataset.
2. **See how examples are made.** Display an input window and its targets shifted by one character. Keep training and held-out windows separate.
3. **Try counting first.** Produce a quick baseline and expose its next-character probabilities.
4. **Train a tiny neural model.** Start with random weights; offer one update, run, pause, reset, and an explicit training budget. Show measured loss and samples at checkpoints.
5. **Generate.** Enter a prompt, inspect the next-character distribution, choose one sampling step or a bounded continuation, and see the context window move.
6. **Compare.** Use the same prompt and fixed generation settings before/after training. Show training and held-out loss separately. Do not present improved training loss as proof of generalization.

Keep this on one lab page. Progressive inspection should open beside the relevant operation rather than redirecting users through prerequisite pages. Default controls: text, train/pause, prompt, generate. Architecture and optimizer settings can remain fixed initially.

## What to show

| Operation | View | What the learner should notice |
|---|---|---|
| Tokenization | Characters aligned with IDs | IDs identify pieces; they are not meaning scores |
| Training example | Input above next-character targets | The text itself provides the answers |
| Embedding lookup | Selected token’s vector, with a few numerical entries | A lookup finds adjustable values |
| Context | Highlight the retained character window | The model cannot use text outside the window |
| Attention | One head’s small heatmap with a blocked future triangle | Positions mix information without seeing future answers |
| Prediction | Scores and top next-character probabilities | A prediction is a distribution |
| Loss | Observed next character and its assigned probability | Low probability for the observed outcome means larger loss |
| Update | Selected parameter before, gradient, and after | Training changes numbers; generation does not |
| Generation | Context, draw, selected character, updated text | Repeated prediction produces a continuation |

Every displayed value should come from an actual captured model step. Use the same parameter snapshot for all views of that step. Attention weights show mixing, not a reliable causal account of “why the model thought something.” Do not assign human meanings to embedding dimensions.

Have two execution modes: **Inspect one step**, which captures selected intermediate values, and **Run training**, which emits sparse summaries. Continuously transferring every tensor to the UI would slow training and overwhelm the page.

## Initial model proposal

These are prototype settings to benchmark, not demonstrated device limits:

- Character tokens, built from pasted text; handle Unicode code points consistently.
- Context window of 32 characters.
- One causal transformer block, embedding width 32, two attention heads.
- Feedforward width 128, residual connections, and normalization.
- Cross-entropy objective and Adam optimizer.
- Small batches, beginning with 4–8 sequences.
- Around 22,000 parameters for a vocabulary near 128 tokens, depending on bias and normalization choices and whether input/output embeddings are shared.

At 32-bit precision, 22,000 parameters alone are about 88 KB. This is not total memory: gradients, optimizer state, activations, intermediate tensors, and the runtime also consume memory. Performance is a larger uncertainty than raw weight storage.

Begin with an input cap around 50,000 characters and 128 distinct tokens, subject to benchmarking. Validate before training; do not silently delete unsupported characters. A short paragraph may teach spelling fragments or simply be memorized. Several thousand characters of repetitive, consistent text make a better learning demonstration, but do not guarantee coherent output.

Treat the pasted text as one document by default, preserving spaces and newlines. Use explicit boundaries for separate examples; do not insert END at every training window. Generation stops at a genuine learned END or a user-visible token limit. Reject unknown prompt characters with an explanation rather than silently changing the prompt.

On changing training text, rebuild vocabulary and reset weights by default; continuing with a different token-to-ID mapping would be incorrect.

## Runtime approach

Run training in a dedicated worker. Batch work in short chunks so pause/cancel messages can be handled. Transfer only small progress reports and requested inspection snapshots to the main page. Pause when the lab is hidden or the page backgrounds; provide a hard reset that terminates and recreates the worker.

Preferred first investigation: TensorFlow.js Core API for tensor operations and gradients, with our own small model and training loop. Load the runtime only when the neural lab is opened. Test the exact operator, gradient, and worker support of each backend before selecting it.

TensorFlow.js documents CPU, WebGL, and WASM backends, and recommends WebGL for browser training ([platform guide](https://www.tensorflow.org/js/guide/platform_environment)). Do not assume a WASM or WebGPU backend supports every training operation simply because inference works. A CPU implementation is useful for reference tests; acceleration choice should follow measurements on target browsers.

A custom TypeScript tensor/autograd engine offers more control, but makes numerical correctness and maintenance our responsibility. Scalar operation objects are useful for a tiny explanatory calculation, not the preferred fast path for training a transformer.

WebGPU is worth considering later, but MDN still marks it as limited availability and requires a secure context ([WebGPU documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)). Do not make it a prerequisite for the introductory lessons. [WebLLM](https://webllm.mlc.ai/docs/) focuses on pretrained-model inference; loading a ready-made model does not fulfill this lab’s learn-from-random-initialization goal.

## Locality and reliability

Keep text and weights in memory by default. Do not send them to APIs, analytics, error-reporting payloads, or logs. Serve runtime assets ourselves if claiming the lab operates without third-party requests. Add explicit local export/import later; no automatic persistence of pasted text is needed.

Training must release temporary tensors, handle nonfinite losses, stop at its budget, and recover from worker or graphics-backend failures. Slow devices can use smaller settings or the count-model baseline, with the active mode made clear.

## First implementation milestones

1. Generalize the current count-model engine to pasted text, including whitespace, boundaries, context inspection, and unknown-input handling.
2. Build a worker-based one-block transformer prototype with fixed settings and no polished visual UI. Compare forward values and gradients against a trusted reference and finite-difference checks.
3. Prove it can overfit a deliberately tiny repeated corpus. This checks learning mechanics; it is not a generalization result.
4. Benchmark at least a desktop browser and a representative phone: initialization, training steps/second, generation latency, memory behavior, UI responsiveness, and pause response. Select input/step limits from those results.
5. Add inspection views driven by real snapshots and compare the learned model with the count baseline on the same text.

Acceptance targets to investigate: pause responds within roughly 250 ms, the UI stays usable during training, loss measurably improves on a simple seeded corpus, and reset returns memory to a stable range across repeated runs. These are targets, not current measurements. Do not promise training times or output quality before these tests.

The first visible win is not fluent prose. It is a learner seeing a real model move from nearly random characters toward patterns in their own text—and being able to trace the calculations that changed.
