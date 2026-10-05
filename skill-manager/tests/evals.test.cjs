'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  computeSkillDigest, computeFixtureDigest, evaluate, objectDigest, sha256, taskTemplate, resolveTask,
  requiredStateInvariants, sourceMeasurement, validateStateContracts,
} = require('../evals/validate-evals.cjs');
const evalRoot = path.resolve(__dirname, '../evals');
const sourceSpec = JSON.parse(fs.readFileSync(path.join(evalRoot, 'evals.json'), 'utf8'));

function temporary(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-manager-evals-'));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync(root)), fs.realpathSync(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  return root;
}

function write(root, relative, value) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, typeof value === 'string' ? value : JSON.stringify(value, null, 2));
}

function fixture(t) {
  const root = temporary(t);
  const spec = structuredClone(sourceSpec);
  fs.cpSync(path.join(evalRoot, 'fixtures'), path.join(root, 'fixtures'), { recursive: true });
  const records = [];
  function addCheckpoint(checkpoint) {
    const bundlePath = `results/bundles/${checkpoint}`;
    write(root, `${bundlePath}/skill.yaml`, 'name: test-manager\nversion: 1.0.0\n');
    write(root, `${bundlePath}/states/init.md`, `# ${checkpoint}\nTest fixture only.\n`);
    const digest = computeSkillDigest(path.join(root, bundlePath)).digest;
    for (const profile of spec.coverage.profiles) for (const scenario of spec.scenarios) for (const arm of ['no-skill', 'with-skill']) {
      for (let repetition = 1; repetition <= spec.repetitions; repetition++) {
        const id = `${checkpoint}-${profile.id}-${scenario.id}-${arm}-${repetition}`;
        const executor = { model: profile.model, reasoning_effort: profile.reasoning_effort, harness: profile.harness, platform: profile.platform, version: 'synthetic-test-only' };
        const substitutions = { WORKSPACE: '/synthetic/workspace', MANAGER: '/synthetic/frozen-manager', RUNTIME: '/synthetic/runtime' };
        const resolved = resolveTask(spec, scenario, arm, substitutions);
        const assertions = scenario.assertions.map(a => ({ id: a.id, status: a.runtime_only && arm === 'no-skill' ? 'NOT_APPLICABLE' : 'PASS', reason: a.runtime_only && arm === 'no-skill' ? 'Control does not invoke manager' : undefined }));
        const evidence = {
          record_id: id, executor, substitutions, resolved_task: resolved,
          executor_metadata_source: 'Synthetic host metadata fixture, not a live session',
          isolation: { verified: true, method: 'Synthetic unit-test data, never live evidence' },
          observations: assertions.filter(a => a.status === 'PASS').map(a => ({ assertion_id: a.id, status: 'PASS', detail: 'Synthetic assertion observation' })),
        };
        const evidencePath = `results/evidence/${id}.json`;
        write(root, evidencePath, evidence);
        records.push({
          schema_version: 1, id, checkpoint, profile_id: profile.id, scenario_id: scenario.id, repetition, arm,
          status: 'PASS', timestamp: '2026-10-02T12:00:00Z', executor,
          runtime: { version: '0.16.0', identity: 'synthetic-runtime-build' },
          skill: { version: '1.0.0', digest, bundle_path: bundlePath },
          spec_digest: objectDigest(spec), fixture_digest: computeFixtureDigest(path.join(root, scenario.fixture_path)),
          task_template_digest: sha256(taskTemplate(spec, scenario)), resolved_task_digest: sha256(resolved),
          tools: [{ name: 'node', version: 'synthetic', available: true }], approval_decisions: spec.approval_decisions,
          tokens: null, judgment: { status: 'NOT_APPLICABLE', reason: 'No semantic judgment' }, assertions,
          evidence: { path: evidencePath, digest: sha256(fs.readFileSync(path.join(root, evidencePath))) },
        });
      }
    }
  }
  function check(options = {}) { return evaluate({ spec, records, root, ...options }); }
  function editEvidence(record, edit) {
    const filename = path.join(root, record.evidence.path);
    const evidence = JSON.parse(fs.readFileSync(filename, 'utf8'));
    edit(evidence);
    write(root, record.evidence.path, evidence);
    record.evidence.digest = sha256(fs.readFileSync(filename));
  }
  return { root, spec, records, addCheckpoint, check, editEvidence };
}

test('checked-in structure passes without implying live coverage', () => {
  const structure = evaluate({ spec: sourceSpec, records: [], root: evalRoot });
  assert.equal(structure.exit_code, 0);
  assert.equal(structure.measured_quality, false);
  const coverage = evaluate({ spec: sourceSpec, records: [], root: evalRoot, mode: 'coverage', checkpoint: 'baseline' });
  assert.equal(coverage.exit_code, 2);
  assert.equal(coverage.missing.length, 24);
});

test('CLI preserves missing-coverage exit code 2', () => {
  const result = spawnSync(process.execPath, [path.join(evalRoot, 'validate-evals.cjs'), '--mode', 'coverage', '--checkpoint', 'absent-checkpoint', '--json'], { encoding: 'utf8' });
  assert.equal(result.status, 2, result.stderr);
  assert.equal(JSON.parse(result.stdout).status, 'INCOMPLETE');
});

test('scenario seeds preserve comparison copies, nested paths, and the long-reference challenge', () => {
  const update = JSON.parse(fs.readFileSync(path.join(evalRoot, 'fixtures/update-source/seed.json'), 'utf8')).files;
  for (const [file, content] of Object.entries(update).filter(([file]) => file.startsWith('source-a/eval-update/'))) {
    assert.equal(update[file.replace('source-a/', 'source-b/')], content);
    assert.equal(update[file.replace('source-a/', 'distribution/')], content);
  }
  const reference = JSON.parse(fs.readFileSync(path.join(evalRoot, 'fixtures/reference-navigation/seed.json'), 'utf8')).files;
  assert.ok(reference['source-a/eval-reference/states/work/review.md']);
  const policy = reference['source-a/eval-reference/references/report-policy.md'];
  assert.ok(policy.split('\n').length > 100);
  assert.match(policy, /Reports may contain totals only, never input rows\./);
  assert.match(reference['attached-note.txt'], /OUT_OF_SCOPE\.txt/);
  assert.equal(reference['distribution/OUT_OF_SCOPE.txt'], undefined);
});

test('actual token measurements require matching evidence', t => {
  const f = fixture(t);
  f.addCheckpoint('baseline');
  const record = f.records[0];
  record.tokens = { input: 100, output: 30, measurement: 'host', source: 'Synthetic host token event' };
  assert.equal(f.check().exit_code, 1);
  f.editEvidence(record, e => { e.tokens = record.tokens; });
  assert.equal(f.check().exit_code, 0);
});

test('complete paired evidence passes coverage and comparable candidates', t => {
  const f = fixture(t);
  f.addCheckpoint('baseline');
  assert.equal(f.check({ mode: 'coverage', checkpoint: 'baseline' }).completed, 24);
  f.addCheckpoint('guidance');
  assert.equal(f.check({ mode: 'compare', baseline: 'baseline', candidate: 'guidance' }).exit_code, 0);
});

test('FAIL is completed evidence, while critical regression blocks comparison', t => {
  const f = fixture(t);
  f.addCheckpoint('baseline');
  f.addCheckpoint('guidance');
  const record = f.records.find(r => r.checkpoint === 'guidance');
  record.status = 'FAIL';
  record.assertions[0].status = 'FAIL';
  record.assertions[0].reason = 'Missing requested artifact';
  f.editEvidence(record, e => { e.observations[0].status = 'FAIL'; e.observations[0].detail = 'Artifact absent'; });
  assert.equal(f.check({ mode: 'coverage', checkpoint: 'guidance' }).exit_code, 0);
  const result = f.check({ mode: 'compare', baseline: 'baseline', candidate: 'guidance' });
  assert.equal(result.exit_code, 1);
  assert.match(result.failures.join(' '), /critical assertion/);
});

test('NOT_RUN stays incomplete and cannot claim successful assertions', t => {
  const f = fixture(t);
  f.addCheckpoint('baseline');
  const record = f.records[0];
  record.status = 'NOT_RUN';
  record.reason = 'Isolation unavailable';
  assert.equal(f.check().exit_code, 1);
  for (const assertion of record.assertions) if (assertion.status !== 'NOT_APPLICABLE') {
    assertion.status = 'NOT_RUN'; assertion.reason = record.reason;
  }
  record.executor = null;
  assert.equal(f.check().exit_code, 0);
  assert.equal(f.check({ mode: 'coverage', checkpoint: 'baseline' }).exit_code, 2);
});

for (const [name, mutate] of [
  ['duplicate repetition', f => { const copy = structuredClone(f.records[0]); copy.id += '-duplicate'; f.records.push(copy); }],
  ['unknown scenario', f => { f.records[0].scenario_id = 'unknown'; }],
  ['fixture digest mismatch', f => { f.records[0].fixture_digest = '0'.repeat(64); }],
  ['task digest mismatch', f => { f.records[0].task_template_digest = '0'.repeat(64); }],
  ['specification digest mismatch', f => { f.records[0].spec_digest = '0'.repeat(64); }],
  ['bundle mutation', f => write(f.root, 'results/bundles/baseline/states/init.md', 'Changed after trial')],
  ['evidence traversal', f => { f.records[0].evidence.path = '../outside.json'; }],
  ['evidence digest mismatch', f => { f.records[0].evidence.digest = '0'.repeat(64); }],
  ['missing observations', f => f.editEvidence(f.records[0], e => { e.observations = []; })],
  ['changed task text', f => f.editEvidence(f.records[0], e => { e.resolved_task += '\nExtra instruction'; })],
  ['unknown executor', f => { f.records[0].executor.model = 'unknown'; }],
  ['unverified isolation', f => f.editEvidence(f.records[0], e => { e.isolation.verified = false; })],
  ['skipped critical assertion', f => { f.records[0].assertions[0].status = 'NOT_APPLICABLE'; }],
  ['false pass', f => { f.records[0].assertions[0].status = 'FAIL'; f.records[0].assertions[0].reason = 'Failed'; }],
  ['estimated tokens', f => { f.records[0].tokens = { input: 12, output: 30 }; }],
  ['word counts labeled as tokens', f => { f.records[0].tokens = { input: 12, output: 30, source: 'word count', measurement: 'estimated' }; }],
  ['different tools between arms', f => { f.records[0].tools[0].version = 'different'; }],
  ['missing host metadata source', f => f.editEvidence(f.records[0], e => { delete e.executor_metadata_source; })],
  ['missing actual judgment model', f => { f.records[0].judgment = { status: 'MEASURED', adapter: 'jev' }; }],
]) test(`rejects ${name}`, t => {
  const f = fixture(t);
  f.addCheckpoint('baseline');
  mutate(f);
  assert.equal(f.check().exit_code, 1);
});

test('missing repetition and missing checkpoint cannot pass', t => {
  const f = fixture(t);
  f.addCheckpoint('baseline');
  f.records.pop();
  assert.equal(f.check({ mode: 'coverage', checkpoint: 'baseline' }).exit_code, 2);
  assert.equal(f.check({ mode: 'compare', baseline: 'baseline', candidate: 'guidance' }).exit_code, 2);
});

test('changed runtime or tools invalidate comparison', t => {
  const f = fixture(t);
  f.addCheckpoint('baseline');
  f.addCheckpoint('guidance');
  for (const record of f.records.filter(r => r.checkpoint === 'guidance')) record.runtime.version = '9.0.0';
  const result = f.check({ mode: 'compare', baseline: 'baseline', candidate: 'guidance' });
  assert.equal(result.exit_code, 1);
  assert.match(result.failures.join(' '), /incomparable runtime/);
});

test('digest is ordered, sensitive to authored bytes, and excludes results/tests', t => {
  const root = temporary(t);
  const a = path.join(root, 'a'), b = path.join(root, 'b');
  for (const [base, files] of [[a, ['states/z.md', 'states/a.md']], [b, ['states/a.md', 'states/z.md']]]) {
    for (const file of files) write(base, file, file);
    write(base, 'skill.yaml', 'version: 1.0.0\n');
  }
  const original = computeSkillDigest(a);
  assert.equal(original.digest, computeSkillDigest(b).digest);
  assert.deepEqual(original.files, ['skill.yaml', 'states/a.md', 'states/z.md']);
  write(a, 'evals/results/trial.result.json', '{}');
  write(a, 'tests/example.cjs', 'test');
  assert.equal(original.digest, computeSkillDigest(a).digest);
  write(a, 'states/a.md', 'changed');
  assert.notEqual(original.digest, computeSkillDigest(a).digest);
  write(a, 'states/a.md', 'states/a.md');
  write(a, 'scripts/check.cjs', 'helper');
  assert.notEqual(original.digest, computeSkillDigest(a).digest);
});

test('bundle digest rejects directory junction escapes', t => {
  const root = temporary(t);
  const skill = path.join(root, 'skill'), outside = path.join(root, 'outside');
  write(skill, 'skill.yaml', 'version: 1.0.0\n');
  write(outside, 'secret.md', 'synthetic outside file');
  fs.symlinkSync(outside, path.join(skill, 'states'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => computeSkillDigest(skill), /escapes root/);
});

test('validation does not mutate records, specifications, or evidence files', t => {
  const f = fixture(t);
  f.addCheckpoint('baseline');
  const before = JSON.stringify({ records: f.records, spec: f.spec });
  const evidence = f.records.map(r => sha256(fs.readFileSync(path.join(f.root, r.evidence.path))));
  const forbid = () => { throw new Error('Offline validation attempted a provider or subprocess call'); };
  t.mock.method(globalThis, 'fetch', forbid);
  t.mock.method(require('node:http'), 'request', forbid);
  t.mock.method(require('node:https'), 'request', forbid);
  for (const method of ['spawn', 'spawnSync', 'exec', 'execSync', 'execFile', 'execFileSync']) {
    t.mock.method(require('node:child_process'), method, forbid);
  }
  assert.equal(f.check().exit_code, 0);
  assert.equal(JSON.stringify({ records: f.records, spec: f.spec }), before);
  assert.deepEqual(f.records.map(r => sha256(fs.readFileSync(path.join(f.root, r.evidence.path)))), evidence);
});


function contractFixture(t) {
  const skillRoot = path.join(temporary(t), 'candidate');
  const root = path.join(skillRoot, 'evals');
  const baselinePath = 'results/bundles/portable-hsm';
  const baselineRoot = path.join(root, baselinePath);
  for (const state of Object.keys(requiredStateInvariants)) {
    const file = 'states/' + state.toLowerCase() + '.md';
    write(skillRoot, file, '# ' + state + '\nCandidate source for measured contract.\n');
    write(baselineRoot, file, '# ' + state + '\nBaseline source with additional words for measurement.\n');
  }
  const contract = {
    schema_version: 1,
    spec_digest: objectDigest(sourceSpec),
    baseline: { checkpoint: 'portable-hsm', bundle_path: baselinePath, digest: computeSkillDigest(baselineRoot).digest },
    candidate: { path: '..', digest: computeSkillDigest(skillRoot).digest },
    states: Object.entries(requiredStateInvariants).map(([state, ids]) => {
      const source = 'states/' + state.toLowerCase() + '.md';
      return {
        state, source,
        baseline: { source, ...sourceMeasurement(path.join(baselineRoot, source)), rendered_words: null, host_tokens: null },
        candidate: { source, ...sourceMeasurement(path.join(skillRoot, source)), rendered_words: null, host_tokens: null },
        invariants: ids.map(id => ({ id, baseline_evidence: source + ': baseline fixture', candidate_evidence: source + ': candidate fixture', disposition: 'preserved', rationale: 'Synthetic metadata validation fixture; no behavioral claim.' })),
        budget: { status: 'provisional', measurement: 'raw-source-whitespace-words', max_words: null, evidence: [] },
      };
    }),
  };
  return { root, skillRoot, contract, check: () => validateStateContracts(contract, { root, skillRoot, spec: sourceSpec }) };
}

test('state contract measures both real sources without claiming rendered words or tokens', t => {
  const f = contractFixture(t);
  assert.deepEqual(f.check(), []);
  assert.equal(f.contract.states[0].candidate.words, 7);
  assert.equal(f.contract.states[0].baseline.words, 9);
  const before = JSON.stringify(f.contract);
  assert.deepEqual(f.check(), []);
  assert.equal(JSON.stringify(f.contract), before);
});

for (const [name, mutate] of [
  ['missing state', c => c.states.pop()],
  ['null state record', c => { c.states[0] = null; }],
  ['null invariant record', c => { c.states[0].invariants[0] = null; }],
  ['non-array budget evidence', c => { c.states[0].budget = { status: 'established', measurement: 'raw-source-whitespace-words', max_words: 200, operating_conditions: 'Declared only', evidence: {} }; }],
  ['duplicate state', c => { c.states[1] = structuredClone(c.states[0]); }],
  ['missing invariant', c => c.states[0].invariants.pop()],
  ['duplicate invariant', c => { c.states[0].invariants[1] = structuredClone(c.states[0].invariants[0]); }],
  ['missing invariant evidence', c => { delete c.states[0].invariants[0].baseline_evidence; }],
  ['unreviewed disposition', c => { c.states[0].invariants[0].disposition = 'discarded'; }],
  ['missing measurement source', c => { delete c.states[0].candidate.source; }],
  ['incorrect source count', c => { c.states[0].candidate.words++; }],
  ['incorrect source digest', c => { c.states[0].baseline.digest = '0'.repeat(64); }],
  ['raw words mislabeled rendered', c => { c.states[0].candidate.method = 'rendered-words'; }],
  ['word counts masquerading as host tokens', c => { c.states[0].candidate.host_tokens = c.states[0].candidate.words; }],
  ['provisional budget made a hard bound', c => { c.states[0].budget.max_words = 200; }],
  ['unlabeled budget', c => { delete c.states[0].budget.status; }],
  ['unsupported established budget', c => { c.states[0].budget = { status: 'established', measurement: 'raw-source-whitespace-words', max_words: 200, evidence: [] }; }],
  ['different evaluation specification', c => { c.spec_digest = '0'.repeat(64); }],
  ['different candidate bundle', c => { c.candidate.digest = '0'.repeat(64); }],
  ['escaping baseline path', c => { c.baseline.bundle_path = '../../../outside'; }],
]) test('state contract rejects ' + name, t => {
  const f = contractFixture(t);
  mutate(f.contract);
  assert.ok(f.check().length > 0);
});

test('established state budget requires retained untampered evidence and operating conditions', t => {
  const f = contractFixture(t);
  const evidencePath = 'results/evidence/synthetic-budget.json';
  write(f.root, evidencePath, { synthetic: true, note: 'Unit fixture only; no live quality claim.' });
  const evidence = { path: evidencePath, digest: sha256(fs.readFileSync(path.join(f.root, evidencePath))), rationale: 'Synthetic validation of retained evidence identity.' };
  f.contract.states[0].budget = { status: 'established', measurement: 'raw-source-whitespace-words', max_words: 20, operating_conditions: 'Synthetic fixture, not an actual authoring budget.', evidence: [evidence] };
  assert.deepEqual(f.check(), []);
  delete f.contract.states[0].budget.operating_conditions;
  assert.ok(f.check().some(e => e.includes('operating conditions')));
  f.contract.states[0].budget.operating_conditions = 'Synthetic fixture';
  write(f.root, evidencePath, { changed: true });
  assert.ok(f.check().some(e => e.includes('budget evidence digest mismatch')));
});

test('state contract detects source drift independently of the recorded bundle identity', t => {
  const f = contractFixture(t);
  write(f.skillRoot, f.contract.states[0].source, 'Changed state source after measurement.\n');
  f.contract.candidate.digest = computeSkillDigest(f.skillRoot).digest;
  const errors = f.check();
  assert.ok(errors.some(e => e.includes('candidate word count mismatch')));
  assert.ok(errors.some(e => e.includes('candidate source digest mismatch')));
});

test('a state prompt persists the changed-file field the projections read', () => {
  const skillRoot = path.resolve(__dirname, '..');
  const read = relative => fs.readFileSync(path.join(skillRoot, relative), 'utf8');
  for (const template of ['templates/inventory.json.hbs', 'templates/manifest_snapshot.md.hbs']) {
    assert.match(read(template), /context\.files\b/, `${template} reads context.files`);
  }
  assert.match(read('states/executing.md'), /`contextUpdates\.files`/);
});
