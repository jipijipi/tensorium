import assert from 'node:assert/strict';
import * as tf from '@tensorflow/tfjs';
import { BrowserModel, prepare, encode, countDistribution, sample, SAMPLE_TEXT } from '../src/lib/browser-model.ts';
await tf.setBackend('cpu');
const baseline = tf.memory().numTensors;
assert.throws(() => prepare('too short'));
assert.throws(() => prepare('a'.repeat(200)));
assert.throws(() => prepare('ab'.repeat(26000)));
assert.throws(() => prepare(Array.from({ length: 160 }, (_, i) => String.fromCodePoint(1000 + i)).join('')));
const unicode = prepare('a🙂 '.repeat(60));
assert.equal(unicode.length, 180);
assert.equal(unicode.vocab.length, 3);
assert.throws(() => encode('z', unicode.vocab));
assert.throws(() => encode('', unicode.vocab));
assert.equal(encode('a'.repeat(30), unicode.vocab).length, 16);
assert.deepEqual(countDistribution([0, 1, 0, 2, 0, 1], 0, 3).counts, [0, 2, 1]);
assert.equal(countDistribution([0, 0, 1], 1, 2).fallback, true);
assert.equal(sample([.25, .75], 1, .249).id, 0);
assert.equal(sample([.25, .75], 1, .25).id, 1);
assert(sample([.25, .75], .5).chances[1] > .75);
assert(sample([.25, .75], 2).chances[1] < .75);

const data = prepare(SAMPLE_TEXT), model = new BrowserModel(data.vocab.length);
assert.equal(data.train.length + data.validation.length, data.length);
const ids = encode('the ca', data.vocab), inspection = model.inspect(ids);
assert(Math.abs(inspection.probabilities.reduce((a, b) => a + b, 0) - 1) < 1e-6);
inspection.attention.forEach((row, i) => {
  assert(Math.abs(row.reduce((a, b) => a + b, 0) - 1) < 1e-6);
  assert(row.slice(i + 1).every(x => x === 0));
});
// Future input cannot affect an earlier prediction, even before training.
tf.tidy(() => {
  const original = model.forward(tf.tensor2d([[0, 1, 2, 3]], [1, 4], 'int32')).logits.arraySync()[0];
  const changed = model.forward(tf.tensor2d([[0, 1, 4, 5]], [1, 4], 'int32')).logits.arraySync()[0];
  assert.deepEqual(original.slice(0, 2), changed.slice(0, 2));
});
// Check automatic differentiation against a numerical derivative through attention.
tf.tidy(() => {
  const { inputs, targets } = model.batch(data.train, true);
  const weight = model.weights[2];
  const values = Array.from(weight.dataSync());
  const grads = tf.variableGrads(() => model.loss(inputs, targets), model.weights);
  const analytic = grads.grads[weight.name].dataSync()[0], epsilon = .001;
  const lossAt = offset => { const next = [...values]; next[0] += offset; weight.assign(tf.tensor(next, weight.shape)); return model.loss(inputs, targets).dataSync()[0]; };
  const numerical = (lossAt(epsilon) - lossAt(-epsilon)) / (2 * epsilon);
  weight.assign(tf.tensor(values, weight.shape));
  assert(Math.abs(analytic - numerical) < .002, `Gradient mismatch: ${analytic} vs ${numerical}`);
});
const before = model.evaluate(data.train), initialEmbedding = [...inspection.embeddings[0]];
const random = Math.random;
let seed = 17;
Math.random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
try { for (let i = 0; i < 80; i++) assert(Number.isFinite(model.train(data.train))); }
finally { Math.random = random; }
const after = model.evaluate(data.train);
assert(after < before * .7, `Training must improve the simple corpus: ${before} → ${after}`);
assert.notDeepEqual(model.inspect(ids).embeddings[0], initialEmbedding);
assert(Number.isFinite(model.evaluate(data.validation)));
model.train(data.train, true);
assert.equal(model.lastUpdate.inputs.length, 16);
assert.deepEqual(model.lastUpdate.inputs.slice(1), model.lastUpdate.targets.slice(0, -1));
assert([model.lastUpdate.before, model.lastUpdate.after].every(n => n >= 0 && n <= 1));
assert(Number.isFinite(model.lastUpdate.gradient));
assert.notEqual(model.lastUpdate.weightBefore, model.lastUpdate.weightAfter);
const tensors = tf.memory().numTensors;
for (let i = 0; i < 10; i++) { model.train(data.train); model.inspect(ids); model.evaluate(data.validation); }
assert.equal(tf.memory().numTensors, tensors, 'Repeated training/inference must not leak tensors');
model.dispose();
assert.equal(tf.memory().numTensors, baseline, 'Reset must release model and optimizer');
console.log(`Browser model: validation, Unicode, counts, sampling, causal masking, gradients, learned embeddings, loss (${before.toFixed(3)} → ${after.toFixed(3)}), and tensor cleanup verified.`);
