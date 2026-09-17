type Prediction = { probabilities: number[]; attention: number[][]; embeddings: number[][]; ids: number[];
  count: { counts: number[]; probabilities: number[]; fallback: boolean }; choice: { id: number; chances: number[] };
  model: string; append: boolean; step: number };
const get = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(`lab-${id}`) as T;
const corpus = get<HTMLTextAreaElement>('corpus'), prompt = get<HTMLInputElement>('prompt');
const status = get('status');
let worker: Worker | undefined, ready = false, training = false, busy = false, remaining = 0, steps = 0;
let vocab: string[] = [], generated = '', metrics: { step: number; train: number; validation: number }[] = [];
let cancelled = false;
let generationTimer: ReturnType<typeof setTimeout>;
const example = `the cat is soft. the cat can nap. the cat can run.
the car is fast. the car can turn. the car can stop.
the can is small. the can can roll. the can is full.
the cat sat in the car. the can sat in the car.
the cat saw the can. the car went past the cat.
`.repeat(12);
corpus.value = example;
const label = (char: string) => char === ' ' ? '␣' : char === '\n' ? '↵' : char === '\t' ? '⇥' : char;
function size() { get('text-size').textContent = `${Array.from(corpus.value).length.toLocaleString()} characters`; }
function controls() {
  const generating = remaining > 0;
  for (const id of ['inspect', 'next', 'generate', 'clear']) get<HTMLButtonElement>(id).disabled = !ready || training || busy || generating;
  get<HTMLButtonElement>('train').disabled = !ready || training || busy || generating || steps >= 400;
  get<HTMLButtonElement>('single').disabled = get<HTMLButtonElement>('train').disabled;
  get<HTMLButtonElement>('pause').disabled = !training;
  get<HTMLButtonElement>('stop').disabled = !generating;
  get<HTMLButtonElement>('reset').disabled = !ready;
  get<HTMLButtonElement>('prepare').disabled = !!worker;
  for (const id of ['prompt', 'model', 'temperature']) (get(id) as HTMLInputElement).disabled = training || busy || generating;
  get('step').textContent = `${steps} / 400 updates`;
  get('train').textContent = steps ? 'Continue training' : 'Train the transformer';
}
function output() { get('seed').textContent = prompt.value; get('generated').textContent = generated; }
function stop() { cancelled = true; remaining = 0; clearTimeout(generationTimer); controls(); }
function clearSnapshot() {
  get('prediction').hidden = true; get('internals').hidden = true; get('inside-empty').hidden = false;
}
function reset() {
  worker?.terminate(); worker = undefined; ready = training = busy = false; stop(); steps = 0; metrics = [];
  get('tokens').replaceChildren(); get('data-summary').textContent = ''; get('model-summary').textContent = 'One attention head · one transformer block · 16 numbers per character';
  document.querySelector<HTMLElement>('.lab-loss')!.hidden = true;
  get('update').hidden = true;
  generated = ''; output(); clearSnapshot(); controls();
  get('generation-feedback').textContent = '';
}
function build() {
  reset();
  const characters = Array.from(corpus.value), distinct = new Set(characters).size;
  if (characters.length < 160 || characters.length > 50000 || distinct < 2 || distinct > 128) {
    status.textContent = 'Use 160–50,000 characters, with 2–128 distinct characters.'; return;
  }
  status.textContent = 'Preparing the local models…';
  worker = new Worker(new URL('../workers/lab.worker.ts', import.meta.url), { type: 'module' });
  worker.onerror = event => { reset(); status.textContent = `The local worker could not start: ${event.message || 'please reload and try again.'}`; };
  worker.onmessage = ({ data }) => {
    if (data.type === 'ready') {
      ready = true; vocab = data.vocab;
      if (!Array.from(prompt.value).length || Array.from(prompt.value).some(c => !vocab.includes(c))) prompt.value = characters.slice(0, 6).join('');
      output();
      get('data-summary').textContent = `${data.trainCharacters.toLocaleString()} characters for learning · ${data.validationCharacters.toLocaleString()} held out · ${vocab.length} distinct tokens. IDs are labels, not quantities.`;
      get('model-summary').textContent = `${data.parameters.toLocaleString()} adjustable numbers · 16-character context · one attention head · one block`;
      get('tokens').replaceChildren(...characters.slice(0, 24).map(c => {
        const item = document.createElement('span'), token = document.createElement('b'), id = document.createElement('small');
        token.textContent = label(c); id.textContent = `ID ${vocab.indexOf(c)}`; item.append(token, id); return item;
      }));
      status.textContent = 'Both models are ready. The transformer is still random. Try a guess now, or train it.';
      controls(); predict(false);
    } else if (data.type === 'metrics') {
      steps = data.step; metrics.push(data); chart(); controls();
      if (training) status.textContent = `Learning from short passages… ${steps} weight updates completed.`;
    } else if (data.type === 'update') {
      busy = false; steps = data.step; controls(); get('update').hidden = false;
      const table = document.createElement('table'); table.className = 'lab-pairs-table';
      for (const [name, ids] of [['Input', data.inputs], ['Answer', data.targets]] as [string, number[]][]) {
        const row = table.insertRow(), th = document.createElement('th'); th.scope = 'row'; th.textContent = name; row.append(th);
        ids.forEach(id => { row.insertCell().textContent = label(vocab[id]); });
      }
      get('training-pairs').replaceChildren(table);
      get('update-chance').textContent = `For the final position, the correct next character was ${JSON.stringify(vocab[data.targets.at(-1)])}. Its chance changed from ${(data.before * 100).toFixed(2)}% → ${(data.after * 100).toFixed(2)}% in this update.`;
      get('update-weight').textContent = `Before: ${data.weightBefore.toFixed(5)} → batch gradient: ${data.gradient.toFixed(5)} → after: ${data.weightAfter.toFixed(5)}.`;
      status.textContent = `Update ${steps} complete. See the real example and changes below.`;
    } else if (data.type === 'paused') {
      training = false; steps = data.step; controls();
      status.textContent = steps >= 400 ? 'Training limit reached. Try generating, or reset to start again.' : 'Training paused. Try the model, or continue learning.';
    } else if (data.type === 'prediction') {
      busy = false;
      if (data.append && cancelled) { controls(); return; }
      render(data);
      if (data.append) {
        generated += vocab[data.choice.id]; output();
        if (remaining > 0) remaining--;
        if (remaining > 0) generationTimer = setTimeout(() => predict(true), 70);
      }
      controls();
    } else if (data.type === 'error') {
      if (!ready) reset();
      training = busy = false; stop(); controls(); status.textContent = data.message;
      get('generation-feedback').textContent = data.message;
    }
  };
  worker.postMessage({ type: 'init', text: corpus.value }); controls();
}
function predict(append: boolean) {
  if (!ready || training || busy) return;
  get('generation-feedback').textContent = '';
  cancelled = false; busy = true; controls();
  worker!.postMessage({ type: 'predict', prompt: prompt.value + generated, model: get<HTMLSelectElement>('model').value,
    temperature: Number(get<HTMLInputElement>('temperature').value), append });
}
function bars(target: HTMLElement, probabilities: number[]) {
  target.replaceChildren(...probabilities.map((p, id) => ({ p, id })).sort((a, b) => b.p - a.p).slice(0, 6).map(({ p, id }) => {
    const row = document.createElement('div'); row.className = 'lab-bar';
    const token = document.createElement('code'), track = document.createElement('span'), fill = document.createElement('i'), value = document.createElement('span');
    token.textContent = label(vocab[id]); token.title = JSON.stringify(vocab[id]);
    fill.style.width = `${p * 100}%`; track.append(fill); value.textContent = `${(p * 100).toFixed(1)}%`; row.append(token, track, value); return row;
  }));
}
function render(data: Prediction) {
  get('prediction').hidden = false; get('internals').hidden = false; get('inside-empty').hidden = true;
  get('context').textContent = data.ids.map(id => label(vocab[id])).join('');
  get('choice').textContent = data.append ? `Picked ${JSON.stringify(vocab[data.choice.id])} from the ${data.model === 'count' ? 'counting model' : 'transformer'} (${(data.choice.chances[data.choice.id] * 100).toFixed(1)}% chance after randomness adjustment).` : 'The two models are predicting the same next character. Space = ␣; line break = ↵.';
  get('prediction-step').textContent = `after ${data.step} updates`;
  bars(get('count-bars'), data.count.probabilities); bars(get('neural-bars'), data.probabilities);
  get('count-note').textContent = data.count.fallback ? 'No observed successor: falling back to overall character frequencies.' : `Raw chances from ${data.count.counts.reduce((a, b) => a + b, 0)} observed pairs after ${JSON.stringify(vocab[data.ids.at(-1)!])}.`;
  const embedding = document.createElement('table'); embedding.className = 'lab-embedding-table';
  const caption = embedding.createCaption(); caption.textContent = 'Character / ID → its 16 learned numbers';
  const max = Math.max(.001, ...data.embeddings.flat().map(Math.abs));
  data.embeddings.forEach((numbers, row) => {
    const tr = embedding.insertRow(), th = document.createElement('th'); th.scope = 'row'; th.textContent = `${label(vocab[data.ids[row]])} / ${data.ids[row]}`; tr.append(th);
    numbers.forEach((n, i) => { const td = tr.insertCell(); td.textContent = n.toFixed(2); td.title = `Dimension ${i + 1}: ${n.toFixed(5)}`; td.style.background = `rgba(${n >= 0 ? '112,67,160' : '154,75,25'},${.04 + Math.abs(n) / max * .22})`; });
  });
  get('embedding').replaceChildren(embedding);
  const attention = document.createElement('table'); attention.className = 'lab-attention-table';
  attention.createCaption().textContent = 'Rows receive information from columns · brighter teal = larger share';
  const header = attention.createTHead().insertRow(); const corner = document.createElement('th'); corner.textContent = '↓ from →'; header.append(corner);
  data.ids.forEach((id, i) => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = `${i + 1} ${label(vocab[id])}`; header.append(th); });
  const body = attention.createTBody();
  data.attention.forEach((values, row) => {
    const tr = body.insertRow(), th = document.createElement('th'); th.scope = 'row'; th.textContent = `${row + 1} ${label(vocab[data.ids[row]])}`; tr.append(th);
    values.forEach((p, col) => {
      const td = tr.insertCell();
      if (col > row) { td.textContent = '·'; td.setAttribute('aria-label', 'Future position blocked'); return; }
      const button = document.createElement('button'); button.type = 'button'; button.textContent = `${Math.round(p * 100)}`;
      const description = `Position ${row + 1} (${label(vocab[data.ids[row]])}) receives ${(p * 100).toFixed(2)}% of its attention mixture from position ${col + 1} (${label(vocab[data.ids[col]])}).`;
      button.setAttribute('aria-label', description); button.title = description; button.style.background = `rgba(23,105,107,${.05 + p * .65})`;
      button.onclick = () => { get('attention-detail').textContent = description; }; td.append(button);
    });
  });
  get('attention').replaceChildren(attention);
}
function chart() {
  document.querySelector<HTMLElement>('.lab-loss')!.hidden = false;
  const last = metrics.at(-1)!;
  get('train-loss').textContent = last.train.toFixed(3); get('val-loss').textContent = last.validation.toFixed(3);
  const max = Math.max(1, ...metrics.flatMap(m => [m.train, m.validation])) * 1.08;
  const x = (step: number) => 40 + step / 400 * 650, y = (n: number) => 108 - n / max * 96;
  const paths = (key: 'train' | 'validation', color: string) => `<polyline points="${metrics.map(m => `${x(m.step)},${y(m[key])}`).join(' ')}" fill="none" stroke="${color}" stroke-width="2"/><circle cx="${x(last.step)}" cy="${y(last[key])}" r="3" fill="${color}"/>`;
  document.getElementById('lab-loss-chart')!.innerHTML = `<path d="M40 8 V108 H690" fill="none" stroke="#dedfd9"/><g fill="#686e69" font-size="10"><text x="5" y="16">${max.toFixed(1)}</text><text x="20" y="110">0</text><text x="40" y="127">0 updates</text><text x="660" y="127">400</text></g>${paths('train', '#9a4b19')}${paths('validation', '#17696b')}`;
}
get('prepare').onclick = build;
get('reset').onclick = build;
get('example').onclick = () => { reset(); corpus.value = example; prompt.value = 'the ca'; size(); output(); status.textContent = 'Example loaded. Build the models to start.'; };
corpus.oninput = () => { reset(); size(); status.textContent = 'Text changed. Build the models again to use it.'; };
prompt.oninput = () => { generated = ''; output(); clearSnapshot(); };
get('single').onclick = () => { busy = true; clearSnapshot(); worker?.postMessage({ type: 'step' }); controls(); };
get('train').onclick = () => { training = true; get('update').hidden = true; clearSnapshot(); worker?.postMessage({ type: 'train' }); status.textContent = 'Training locally…'; controls(); };
function pause() { if (training) worker?.postMessage({ type: 'pause' }); }
get('pause').onclick = pause;
get('inspect').onclick = () => predict(false);
get('next').onclick = () => predict(true);
get('generate').onclick = () => { remaining = 80; predict(true); };
get('stop').onclick = stop;
get('clear').onclick = () => { generated = ''; output(); predict(false); };
get<HTMLInputElement>('temperature').oninput = () => { get('temperature-value').textContent = Number(get<HTMLInputElement>('temperature').value).toFixed(1); };
new MutationObserver(() => { if (get('view').hidden) { stop(); pause(); } }).observe(get('view'), { attributes: true, attributeFilter: ['hidden'] });
document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); pause(); } });
window.addEventListener('pagehide', reset);
window.addEventListener('pageshow', event => { if (event.persisted) status.textContent = 'Build the models again to start a fresh session.'; });
size(); controls();
