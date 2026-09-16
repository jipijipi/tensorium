import * as tf from '@tensorflow/tfjs';

export const CONTEXT = 16;
export const WIDTH = 16;
export const MAX_STEPS = 400;
export const SAMPLE_TEXT = `the cat is soft. the cat can nap. the cat can run.
the car is fast. the car can turn. the car can stop.
the can is small. the can can roll. the can is full.
the cat sat in the car. the can sat in the car.
the cat saw the can. the car went past the cat.
`.repeat(12);

export function prepare(text: string) {
  const chars = Array.from(text);
  if (chars.length < 160 || chars.length > 50000) throw new Error('Use between 160 and 50,000 characters.');
  const vocab = [...new Set(chars)].sort();
  if (vocab.length < 2 || vocab.length > 128) throw new Error('Use between 2 and 128 different characters.');
  const ids = chars.map(c => vocab.indexOf(c));
  const cut = Math.floor(ids.length * .9);
  return { vocab, train: ids.slice(0, cut), validation: ids.slice(cut), length: ids.length };
}
export type Corpus = ReturnType<typeof prepare>;
export function encode(prompt: string, vocab: string[]) {
  const chars = Array.from(prompt);
  if (!chars.length) throw new Error('Enter at least one character to start.');
  const ids = chars.map(c => vocab.indexOf(c));
  if (ids.some(id => id < 0)) throw new Error('Your starting text contains a character absent from the training text.');
  return ids.slice(-CONTEXT);
}
export function countDistribution(train: number[], last: number, size: number) {
  const counts = Array(size).fill(0) as number[];
  for (let i = 0; i < train.length - 1; i++) if (train[i] === last) counts[train[i + 1]]++;
  const total = counts.reduce((a, b) => a + b, 0);
  // If the character has no observed successor, use training character frequencies.
  if (!total) for (const id of train) counts[id]++;
  const denominator = counts.reduce((a, b) => a + b, 0);
  return { counts, probabilities: counts.map(n => n / denominator), fallback: !total };
}
export function sample(probabilities: number[], temperature = 1, draw = Math.random()) {
  if (temperature < .2 || temperature > 2 || draw < 0 || draw >= 1) throw new Error('Invalid sampling settings.');
  const adjusted = probabilities.map(p => p ** (1 / temperature));
  const total = adjusted.reduce((a, b) => a + b, 0);
  const chances = adjusted.map(p => p / total);
  let cumulative = 0;
  const index = chances.findIndex(p => (cumulative += p) > draw);
  return { id: index < 0 ? chances.length - 1 : index, chances };
}

/** One decoder block: learned character/position embeddings, causal attention,
 * residuals, layer normalization, and a two-layer feed-forward network. */
export class BrowserModel {
  weights: tf.Variable[] = [];
  optimizer = tf.train.adam(.005);
  step = 0;
  size: number;
  constructor(size: number) {
    this.size = size;
    const shapes = [[size, WIDTH], [CONTEXT, WIDTH], [WIDTH, WIDTH], [WIDTH, WIDTH],
      [WIDTH, WIDTH], [WIDTH, WIDTH], [WIDTH, WIDTH * 2], [WIDTH * 2],
      [WIDTH * 2, WIDTH], [WIDTH], [WIDTH, size], [size]];
    shapes.forEach((shape, i) => {
      const initial = shape.length === 1 ? tf.zeros(shape) : tf.randomNormal(shape, 0, .15, 'float32', 42 + i);
      this.weights.push(tf.variable(initial)); initial.dispose();
    });
  }
  get parameters() { return this.weights.reduce((n, w) => n + w.size, 0); }
  forward(ids: tf.Tensor2D) {
    const [batch, length] = ids.shape;
    const w = this.weights;
    const linear = (x: tf.Tensor, weight: tf.Tensor, bias?: tf.Tensor) => {
      const y = x.reshape([-1, x.shape[x.rank - 1]!]).matMul(weight as tf.Tensor2D);
      return (bias ? y.add(bias) : y).reshape([batch, length, weight.shape[1]!]);
    };
    const norm = (x: tf.Tensor) => {
      const { mean, variance } = tf.moments(x, -1, true);
      return x.sub(mean).div(variance.add(1e-5).sqrt());
    };
    const embedding = tf.gather(w[0], ids);
    let x = embedding.add(w[1].slice([0, 0], [length, WIDTH]));
    const normalized = norm(x);
    const q = linear(normalized, w[2]), k = linear(normalized, w[3]), v = linear(normalized, w[4]);
    const mask = tf.tensor2d(Array.from({ length }, (_, row) => Array.from({ length }, (_, col) => col > row ? -1e9 : 0)));
    const attention = tf.softmax(tf.matMul(q, k, false, true).div(Math.sqrt(WIDTH)).add(mask), -1);
    x = x.add(linear(tf.matMul(attention, v), w[5]));
    x = x.add(linear(tf.relu(linear(norm(x), w[6], w[7])), w[8], w[9]));
    return { logits: linear(norm(x), w[10], w[11]), attention, embedding };
  }
  loss(inputs: tf.Tensor2D, targets: tf.Tensor2D) {
    const logits = this.forward(inputs).logits;
    return tf.neg(tf.oneHot(targets, this.size).mul(tf.logSoftmax(logits, -1)).sum(-1).mean()) as tf.Scalar;
  }
  batch(data: number[], fixed = false) {
    const length = Math.min(CONTEXT, data.length - 1), batch = 8;
    const starts = Array.from({ length: batch }, (_, i) => fixed ? Math.floor(i * (data.length - length - 1) / (batch - 1)) : Math.floor(Math.random() * (data.length - length)));
    return { inputs: tf.tensor2d(starts.map(s => data.slice(s, s + length)), [batch, length], 'int32'),
      targets: tf.tensor2d(starts.map(s => data.slice(s + 1, s + length + 1)), [batch, length], 'int32') };
  }
  train(data: number[]) {
    return tf.tidy(() => {
      const { inputs, targets } = this.batch(data);
      const { value, grads } = tf.variableGrads(() => this.loss(inputs, targets), this.weights);
      const clipped: tf.NamedTensorMap = {};
      for (const [name, grad] of Object.entries(grads)) clipped[name] = grad.clipByValue(-1, 1);
      this.optimizer.applyGradients(Object.entries(clipped).map(([name, tensor]) => ({ name, tensor })));
      this.step++;
      return value.dataSync()[0];
    });
  }
  evaluate(data: number[]) {
    return tf.tidy(() => { const { inputs, targets } = this.batch(data, true); return this.loss(inputs, targets).dataSync()[0]; });
  }
  inspect(ids: number[]) {
    return tf.tidy(() => {
      const { logits, attention, embedding } = this.forward(tf.tensor2d([ids], [1, ids.length], 'int32'));
      return { probabilities: Array.from(tf.softmax(logits.slice([0, ids.length - 1, 0], [1, 1, this.size]).reshape([this.size])).dataSync()),
        attention: (attention.arraySync() as number[][][])[0],
        embeddings: (embedding.arraySync() as number[][][])[0] };
    });
  }
  dispose() { this.weights.forEach(w => w.dispose()); this.optimizer.dispose(); }
}
