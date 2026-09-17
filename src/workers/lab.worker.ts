import * as tf from '@tensorflow/tfjs';
import { BrowserModel, prepare, encode, countDistribution, sample, MAX_STEPS } from '../lib/browser-model';
import type { Corpus } from '../lib/browser-model';

let model: BrowserModel | undefined;
let corpus: Corpus;
let running = false;
let timer: ReturnType<typeof setTimeout>;
const emit = (type: string, data: object = {}) => self.postMessage({ type, ...data });
function metrics() {
  emit('metrics', { step: model!.step, train: model!.evaluate(corpus.train), validation: model!.evaluate(corpus.validation) });
}
function tick() {
  if (!running || !model) return;
  try {
    const loss = model.train(corpus.train);
    if (!Number.isFinite(loss)) throw new Error('Training became unstable. Reset the model and try again.');
    if (model.step % 10 === 0) metrics();
    if (model.step >= MAX_STEPS) { running = false; emit('paused', { step: model.step }); return; }
    timer = setTimeout(tick, 0);
  } catch (error) { running = false; emit('error', { message: (error as Error).message }); }
}
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      await tf.setBackend('cpu'); await tf.ready();
      corpus = prepare(data.text);
      model = new BrowserModel(corpus.vocab.length);
      emit('ready', { vocab: corpus.vocab, characters: corpus.length, trainCharacters: corpus.train.length,
        validationCharacters: corpus.validation.length, parameters: model.parameters });
      metrics();
    } else if (model && data.type === 'train' && !running && model.step < MAX_STEPS) {
      running = true; tick();
    } else if (model && data.type === 'step' && !running && model.step < MAX_STEPS) {
      model.train(corpus.train, true); metrics();
      emit('update', { ...model.lastUpdate, step: model.step });
    } else if (data.type === 'pause') {
      running = false; clearTimeout(timer); emit('paused', { step: model?.step ?? 0 });
    } else if (model && data.type === 'predict') {
      const ids = encode(data.prompt, corpus.vocab);
      const neural = model.inspect(ids);
      const count = countDistribution(corpus.train, ids[ids.length - 1], corpus.vocab.length);
      const prediction = data.model === 'count' ? count.probabilities : neural.probabilities;
      const choice = sample(prediction, data.temperature);
      emit('prediction', { ...neural, count, ids, choice, model: data.model, append: data.append, step: model.step });
    }
  } catch (error) { emit('error', { message: (error as Error).message }); }
};
