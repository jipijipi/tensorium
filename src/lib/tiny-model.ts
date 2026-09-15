export const START = 'START';
export const END = 'END';
export const WORDS = ['cat', 'car', 'can'] as const;
export type Counts = Record<string, Record<string, number>>;
export function train(frequencies: number[]): Counts {
  if (frequencies.length !== WORDS.length || frequencies.some(n => !Number.isInteger(n) || n < 0 || n > 100)) throw new Error('Use whole-number counts from 0 to 100.');
  const counts: Counts = {};
  WORDS.forEach((word, i) => {
    if (!frequencies[i]) return;
    const tokens = [START, ...word, END];
    for (let j = 0; j < tokens.length - 1; j++) {
      const row = counts[tokens[j]] ??= {};
      row[tokens[j + 1]] = (row[tokens[j + 1]] ?? 0) + frequencies[i];
    }
  });
  return counts;
}
export function distribution(counts: Counts, token: string) {
  const entries = Object.entries(counts[token] ?? {});
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  return entries.map(([next, count]) => ({ next, count, probability: count / total }));
}
export function sample(counts: Counts, token: string, draw: number) {
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new Error('Draw must be in [0, 1).');
  const row = distribution(counts, token);
  if (!row.length) throw new Error('No observed next token.');
  let cumulative = 0;
  for (const entry of row) {
    cumulative += entry.probability;
    if (draw < cumulative) return entry.next;
  }
  return row[row.length - 1].next;
}
