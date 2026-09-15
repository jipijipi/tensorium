export const sentences = ['the cat is sleeping', 'the car is moving', 'the can is empty'];
export function nextCounts(prompt: string, width: number) {
  if (!Number.isInteger(width) || width < 1) throw new Error('Positive integer context width required.');
  const context = prompt.slice(-width);
  const counts: Record<string, number> = {};
  for (const sentence of sentences) {
    for (let i = 1; i <= sentence.length; i++) {
      if (sentence.slice(Math.max(0, i - width), i) === context) {
        const next = sentence[i] ?? 'END';
        counts[next] = (counts[next] ?? 0) + 1;
      }
    }
  }
  return { context, counts };
}
