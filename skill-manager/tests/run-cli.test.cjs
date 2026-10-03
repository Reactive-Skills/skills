'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const { inside, changes, measuredTokens, approveManifest, buildArgs } = require('../evals/run-cli.cjs');
const workspace = path.join(os.tmpdir(), 'fixture-workspace');

test('seed file resolution rejects traversal and absolute paths', () => {
  assert.throws(() => inside(workspace, '../outside.txt'), /escapes/);
  assert.throws(() => inside(workspace, 'C:/outside.txt'), /relative/);
  assert.throws(() => inside(workspace, workspace), /relative/);
  assert.equal(inside(workspace, 'source-a/review.md'), path.join(workspace, 'source-a/review.md'));
});

test('approval permits only the requested update in the selected source', () => {
  assert.equal(approveManifest('update-source', ['source-a/eval-update/states/review.md'], workspace).approved, true);
  for (const file of ['source-b/eval-update/states/review.md', 'distribution/eval-update/states/review.md', 'source-a/eval-update/skill.yaml']) {
    assert.equal(approveManifest('update-source', [file], workspace).approved, false);
  }
  assert.equal(approveManifest('update-source', [], workspace).approved, false);
});

test('approval rejects unrelated creation, flattened prompts, and writes for a missing prerequisite', () => {
  assert.equal(approveManifest('create-hsm', ['source-a/eval-report/states/work/collect.md'], workspace).approved, true);
  assert.equal(approveManifest('create-hsm', ['source-a/eval-report/states/collect.md'], workspace).approved, false);
  assert.equal(approveManifest('reference-navigation', ['distribution/OUT_OF_SCOPE.txt'], workspace).approved, false);
  assert.equal(approveManifest('prerequisite-failure', ['source-a/anything'], workspace).approved, false);
});

test('creation permits a parent prompt without flattening required child prompts', () => {
  assert.equal(approveManifest('create-hsm', [
    'source-a/eval-report/states/work.md',
    'source-a/eval-report/states/work/collect.md',
    'source-a/eval-report/states/work/review.md',
  ], workspace).approved, true);
});

test('file comparison catches additions, deletions, and changed content', () => {
  assert.deepEqual(changes({ a: '1', b: '2', d: '4' }, { a: '1', b: '3', c: '5' }), ['b', 'c', 'd']);
});

test('resumed cumulative token totals do not count earlier turns twice', () => {
  const phases = [
    { session: 'same', usage: [{ input_tokens: 100, output_tokens: 10 }] },
    { session: 'same', usage: [{ input_tokens: 150, output_tokens: 14 }] },
  ];
  assert.equal(measuredTokens(phases).input, 150);
  assert.equal(measuredTokens(phases).output, 14);
  assert.equal(measuredTokens([{ session: 'same', usage: [] }]), null);
  assert.throws(() => measuredTokens([...phases, { session: 'other', usage: [] }]), /one verified session/);
});

test('new and resumed CLI sessions retain model, isolation, and explicit home overrides', () => {
  const trial = { base: workspace, workspace, fixtureHome: path.join(workspace, 'home') };
  for (const resume of [undefined, 'synthetic-session-id']) {
    const args = buildArgs(trial, path.join(workspace, 'reply.json'), resume);
    assert.ok(args.includes('gpt-6.1-sol'));
    assert.ok(args.includes('model_reasoning_effort="xhigh"'));
    assert.ok(args.includes('sandbox_mode="workspace-write"'));
    assert.ok(args.includes('approval_policy="never"'));
    assert.ok(args.some(arg => arg.startsWith('shell_environment_policy.set.USERPROFILE=')));
    assert.ok(args.every(arg => !arg.includes('danger-full-access') && !arg.includes('bypass')));
    assert.equal(args.includes('resume'), Boolean(resume));
  }
});
