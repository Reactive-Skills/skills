'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const manifest = read('skill.yaml');

function stateBlock(name) {
  const match = manifest.match(new RegExp(`^  ${name}:\\n([\\s\\S]*?)(?=^  [A-Z_]+:|^[a-z_]+:|(?![\\s\\S]))`, 'm'));
  assert.ok(match, `missing state ${name}`);
  return match[1];
}

function transitions(name) {
  const out = {};
  for (const m of stateBlock(name).matchAll(/^      ([A-Z_]+):\n        target: ([A-Z_]+)/gm)) out[m[1]] = m[2];
  return out;
}

test('approval gate offers approve, revise, and cancel', () => {
  assert.deepEqual(transitions('APPROVING'), {
    USER_APPROVED: 'EXECUTING',
    USER_REVISE: 'REVISING',
    USER_REJECTED: 'CANCELLED',
  });
});

test('revising returns to the approval gate for another round', () => {
  assert.deepEqual(transitions('REVISING'), { PLAN_READY: 'APPROVING' });
});

test('cancelled is terminal and rejection no longer reaches ERROR', () => {
  assert.deepEqual(transitions('CANCELLED'), {});
  assert.match(stateBlock('CANCELLED'), /prompt_template: states\/cancelled\.md/);
  assert.notEqual(transitions('APPROVING').USER_REJECTED, 'ERROR');
});

test('migration approval keeps restoring from backup on rejection', () => {
  assert.deepEqual(transitions('APPROVING_MIGRATE'), {
    USER_APPROVED: 'EXECUTING_MIGRATE',
    USER_REJECTED: 'RESTORING_MIGRATE',
  });
});

test('revision feedback is a declared context key', () => {
  assert.match(manifest, /^  - revision_feedback\s*$/m);
});

test('every prompt template resolves to a file', () => {
  const templates = [...manifest.matchAll(/prompt_template: (\S+)/g)].map(m => m[1]);
  assert.ok(templates.includes('states/revising.md') && templates.includes('states/cancelled.md'));
  for (const file of templates) assert.ok(fs.existsSync(path.join(root, file)), file);
});

test('approving prompt names all three outcomes and forbids rejecting for revisions', () => {
  const prompt = read('states/approving.md');
  for (const signal of ['USER_APPROVED', 'USER_REVISE', 'USER_REJECTED']) assert.ok(prompt.includes(signal), signal);
  assert.match(prompt, /Never emit `USER_REJECTED` for a revision request/);
});

test('release metadata matches the manifest version', () => {
  const version = manifest.match(/^version: (\S+)\s*$/m)[1];
  assert.equal(JSON.parse(read('skill-release.json')).version, version);
});

test('documented state count matches the prompts on disk', () => {
  const count = fs.readdirSync(path.join(root, 'states')).filter(f => f.endsWith('.md')).length;
  for (const file of ['SKILL.md', 'README.md']) assert.ok(read(file).includes(`${count} isolated state prompts`), file);
});
