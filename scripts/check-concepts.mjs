import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const concepts = JSON.parse(readFileSync(new URL('../src/data/concepts.json', import.meta.url)));
const ids = new Set(concepts.map(c => c.id));
assert.equal(ids.size, concepts.length, 'Concept IDs must be unique');
const complete = new Set();
function visit(id, path = new Set()) {
  assert(!path.has(id), `Prerequisite cycle at ${id}`);
  if (complete.has(id)) return;
  const concept = concepts.find(c => c.id === id);
  assert(concept, `Unknown prerequisite ${id}`);
  for (const field of ['title', 'category', 'description', 'intuition', 'example', 'takeaway', 'question', 'answer']) assert(concept[field]?.trim(), `${id}: missing ${field}`);
  assert.equal(new Set(concept.prerequisites).size, concept.prerequisites.length);
  for (const parent of concept.prerequisites) visit(parent, new Set([...path, id]));
  complete.add(id);
}
concepts.forEach(c => visit(c.id));
console.log(`Validated ${concepts.length} concepts: complete content, valid references, no cycles.`);
const journey = JSON.parse(readFileSync(new URL('../src/data/journey.json', import.meta.url)));
assert.equal(new Set(journey.map(s => s.id)).size, journey.length, 'Journey stage IDs must be unique');
for (const stage of journey) {
  for (const field of ['id', 'title', 'tone', 'question', 'explanation', 'caption', 'next']) assert(stage[field]?.trim(), `${stage.id}: missing ${field}`);
  assert(['predict', 'represent', 'learn', 'context', 'generate'].includes(stage.tone), `${stage.id}: unknown color role`);
  assert(stage.example.length > 0 && stage.example.every(row => row.label?.trim() && row.value?.trim()), `${stage.id}: missing example`);
}
console.log(`Validated ${journey.length} journey steps and their examples.`);
