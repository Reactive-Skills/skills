const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const { execSync } = require('node:child_process');
const { test } = require('node:test');

const skillDir = path.resolve(__dirname, '..');
let runtimeEntry;
let runtimePromise;
function runtime() {
  if (!runtimePromise) {
    runtimeEntry = process.env.JSM_WORKFLOW_RUNTIME;
    if (runtimeEntry) runtimeEntry = path.resolve(runtimeEntry);
    else {
      try {
        runtimeEntry = require.resolve('@reactive-skills/runtime');
      } catch {
        // One command string through the shell finds npm.cmd on Windows without the argument
        // array that Node 24 deprecates alongside `shell` (DEP0190).
        const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
        const axiRequire = createRequire(path.join(globalRoot, '@reactive-skills/axi/package.json'));
        runtimeEntry = axiRequire.resolve('@reactive-skills/runtime');
      }
    }
    runtimePromise = import(pathToFileURL(runtimeEntry).href);
  }
  return runtimePromise;
}

// Answers every Jev predicate with `probability` by stubbing the TypeSafe SDK the runtime loads,
// so the runtime's own `min_probability` threshold decides the transition.
// Returns the states Jev was asked to judge, in call order.
async function stubJev(t, probability) {
  await runtime();
  const runtimeRequire = createRequire(runtimeEntry);
  const manifestPath = runtimeRequire.resolve('@typesafe-ai/sdk/package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const sdk = await import(pathToFileURL(path.join(path.dirname(manifestPath), manifest.exports['.'].import.default)).href);
  const original = sdk.TypeSafeClient.prototype.systemOne;
  const originalKey = process.env.TYPESAFE_API_KEY;
  process.env.TYPESAFE_API_KEY = originalKey || 'jsm-workflow-test-key';
  const states = [];
  sdk.TypeSafeClient.prototype.systemOne = async ({ state }) => (states.push(state), {
    model: 'jev-test',
    answers: { judgment: { type: 'noul', noul: probability } },
  });
  t.after(() => {
    sdk.TypeSafeClient.prototype.systemOne = original;
    if (originalKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = originalKey;
  });
  return states;
}

const workspaces = new WeakMap();
async function fixture(t) {
  const { FSMEngine } = await runtime();
  const workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsm-workflow-test-'));
  const engine = new FSMEngine({ skillDir, workspaceDir, jobId: 'acceptance', initialContext: {} });
  workspaces.set(engine, workspaceDir);
  t.after(() => {
    engine.getEventStore().close();
    const target = fs.realpathSync(workspaceDir);
    assert.equal(path.dirname(target), fs.realpathSync(os.tmpdir()));
    assert.match(path.basename(target), /^jsm-workflow-test-/);
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 3 });
  });
  return engine;
}

async function signal(engine, name, payload, state) {
  const result = await engine.handleSignal(name, payload);
  assert.equal(engine.getCurrentState(), state, name);
  return result;
}

const criteria = status => [
  { id: 'C1', question: 'Does the site build?', expected_result: 'Build exits 0', check_type: 'exact', evidence_method: 'pnpm build exit code', status, evidence: status === 'passed' ? 'pnpm build exited 0' : '' },
  { id: 'C2', question: 'Does the page match the design?', expected_result: 'Matches', check_type: 'semantic', evidence_method: 'Preview screenshots', status: 'passed', evidence: 'Preview screenshots' },
];
const dodRecord = (status, extra = {}) => ({ status: 'approved', outcome: 'Redesigned site on a verified preview', criteria: criteria(status), ...extra });
const brokenCriterion = patch => {
  const record = dodRecord('pending');
  Object.assign(record.criteria[0], patch);
  return record;
};
const malformedDods = [
  ['blank outcome', dodRecord('pending', { outcome: ' ' })],
  ['no criteria', dodRecord('pending', { criteria: [] })],
  ['blank expected result', brokenCriterion({ expected_result: '' })],
  ['missing evidence method', brokenCriterion({ evidence_method: undefined })],
  ['unknown check type', brokenCriterion({ check_type: 'vibes' })],
  ['duplicate id', brokenCriterion({ id: 'C2' })],
];
const debugRecord = (failure_id, attempt, extra = {}) => ({ failure_id, attempt, failure_evidence: 'pnpm build: error TS2304', ...extra });

async function toPhase(engine, phase) {
  const steps = [
    ['RUNTIME_READY', { compatible: true }, 'ACTIVE.INTAKE'],
    ['WORK_REQUEST_READY', { contextUpdates: { run_id: 'run-1' } }, 'ACTIVE.SCOPE'],
    ['SCOPE_READY', {}, 'ACTIVE.ARCHITECT'],
    ['SPEC_READY', {}, 'ACTIVE.AUDIT'],
    ['CONTEXT_READY', {}, 'ACTIVE.DOD_APPROVAL'],
    ['USER_APPROVED', { contextUpdates: { dod_record: dodRecord('pending') } }, 'ACTIVE.DEVELOP'],
    ['BUILD_READY', {}, 'ACTIVE.VERIFY'],
    ['VERIFY_PASSED', {}, 'ACTIVE.TEST'],
    ['TEST_PASSED', {}, 'ACTIVE.REVIEW'],
  ];
  for (const [name, payload, state] of steps) {
    if (engine.getCurrentState() === phase) return;
    await signal(engine, name, payload, state);
  }
  assert.equal(engine.getCurrentState(), phase);
}

async function toDodAudit(engine) {
  await toPhase(engine, 'ACTIVE.DEVELOP');
  await signal(engine, 'BUILD_SKIPPED', {}, 'ACTIVE.DOD_AUDIT');
}

async function toDebug(engine) {
  await toPhase(engine, 'ACTIVE.VERIFY');
  await signal(engine, 'VERIFY_FAILED', {}, 'ACTIVE.DEBUG');
}

const fix = (engine, record, state) => signal(engine, 'BUG_FIXED', { contextUpdates: { debug_record: record } }, state);

for (const phase of ['ACTIVE.DEVELOP', 'ACTIVE.REVIEW']) {
  test(`DOD_CHANGE_REQUESTED bubbles from ${phase} to the DoD amendment gate`, async t => {
    const engine = await fixture(t);
    await toPhase(engine, phase);
    const amended = dodRecord('pending', {
      pending_diff: [{ id: 'C3', before: 'absent', after: 'Cover image generator exists' }],
      revision_reason: 'User requested a cover image generator',
      downstream_work_to_rerun: ['DEVELOP', 'VERIFY'],
    });

    const result = await signal(engine, 'DOD_CHANGE_REQUESTED', { contextUpdates: { dod_record: amended } }, 'ACTIVE.DOD_AMENDMENT');
    assert.equal(result.handledAtDepth, 1);
    assert.deepEqual(engine.getContext().dod_record.pending_diff, amended.pending_diff);
    assert.equal(engine.getEventStore().query({ type: 'EVENT_BUBBLED' }).at(-1).payload.handledAt, 'ACTIVE');
  });
}

test('DECISION_REOPENED bubbles from review to the architect phase', async t => {
  const engine = await fixture(t);
  await toPhase(engine, 'ACTIVE.REVIEW');
  const result = await signal(engine, 'DECISION_REOPENED', {
    contextUpdates: { decision_record: { reopened_from: 'REVIEW', reason: 'New scope', downstream_work_to_rerun: ['DEVELOP'] } },
  }, 'ACTIVE.ARCHITECT');
  assert.equal(result.handledAtDepth, 1);
});

for (const [probability, state] of [[0.85, 'ACTIVE.DOD_AUDIT'], [0.86, 'ACTIVE.DOD_AUDIT'], [0.84, 'ACTIVE.DEVELOP']]) {
  test(`DOD_CHECK_SUBMITTED at Jev probability ${probability} routes to ${state}`, async t => {
    await stubJev(t, probability);
    const engine = await fixture(t);
    await toDodAudit(engine);
    const activeCheck = { id: 'C2', question: 'Does the page match the design?', expected_result: 'Matches', evidence: 'Preview screenshots' };

    const result = await signal(engine, 'DOD_CHECK_SUBMITTED', {
      contextUpdates: { dod_record: dodRecord('pending', { active_check: activeCheck }) },
    }, state);
    assert.equal(result.transitioned, true);
    const judgment = engine.getEventStore().query({ type: 'GUARD_EVALUATED' }).at(-1).payload.judgment;
    assert.equal(judgment.adapterName, 'jev');
    assert.equal(judgment.raw.answers.judgment.noul, probability);
  });
}

test('the DoD check criterion points Jev at the check this signal submits, not the stored one', async t => {
  const states = await stubJev(t, 0.9);
  const engine = await fixture(t);
  await toDodAudit(engine);
  const criterion = engine.manifest.states.ACTIVE.substates.DOD_AUDIT.transitions.DOD_CHECK_SUBMITTED.judgment.criterion;
  const paths = [...criterion.matchAll(/`([a-z_.]+)`/gi)].map(match => match[1]).filter(ref => /^(event|context)\./.test(ref));
  assert.deepEqual(paths, ['event.contextUpdates.dod_record.active_check.question']);
  const resolve = (state, ref) => ref.split('.').reduce((value, key) => value?.[key], state);

  for (const id of ['C1', 'C2']) {
    const activeCheck = { id, question: `Does ${id} hold?`, expected_result: 'Yes', evidence: `${id} evidence` };
    await signal(engine, 'DOD_CHECK_SUBMITTED', {
      contextUpdates: { dod_record: dodRecord('pending', { active_check: activeCheck }) },
    }, 'ACTIVE.DOD_AUDIT');
    assert.equal(resolve(states.at(-1), paths[0]), activeCheck.question, id);
  }
  // The stored record still holds C1 while C2 is judged, so a context fallback would judge a stale check.
  assert.equal(states.at(-1).context.dod_record.active_check.id, 'C1');
});

test('a run renders its DoD and handoff artifacts under artifact_base/run_id', async t => {
  const engine = await fixture(t);
  const workspace = workspaces.get(engine);
  // A named job that is not the active one gets only its per-job copy under the run directory.
  const runDir = path.join(workspace, '.docs', 'jsm-workflow', 'run-1', 'jobs', 'acceptance');
  await signal(engine, 'RUNTIME_READY', { compatible: true }, 'ACTIVE.INTAKE');
  assert.equal(fs.existsSync(path.join(workspace, '.docs')), false, 'nothing renders before INTAKE sets run_id');

  await toDodAudit(engine);
  const passed = dodRecord('passed');
  await signal(engine, 'DOD_AUDIT_PASSED', {
    contextUpdates: {
      dod_record: passed,
      sync_record: { outcome: 'Site redesigned', next_action: 'Merge the preview' },
    },
  }, 'COMPLETE');

  assert.deepEqual(engine.getEventStore().query({ type: 'PROJECTION_FAILED' }), []);
  const files = ['intake.md', 'dod.md', 'lifecycle.md', 'verification.md', 'handoff.md'];
  for (const file of files) assert.ok(fs.existsSync(path.join(runDir, file)), file);
  const dod = fs.readFileSync(path.join(runDir, 'dod.md'), 'utf8');
  assert.match(dod, /\*\*Run:\*\* run-1/);
  assert.match(dod, new RegExp(passed.outcome));
  assert.match(dod, /pnpm build exited 0/);
  const handoff = fs.readFileSync(path.join(runDir, 'handoff.md'), 'utf8');
  assert.match(handoff, /\*\*Outcome:\*\* Site redesigned/);
  assert.match(handoff, /\*\*DoD status:\*\* approved/);
  assert.equal(fs.existsSync(path.join(workspace, '.docs', 'jsm-workflow', 'intake.md')), false);
});

test('DOD_AUDIT_PASSED completes on the first emit that carries a fully passed dod_record', async t => {
  const engine = await fixture(t);
  await toDodAudit(engine);
  assert.equal(engine.getContext().dod_record.criteria[0].status, 'pending');

  const incomplete = dodRecord('passed');
  incomplete.criteria[1].evidence = ' ';
  const refused = await signal(engine, 'DOD_AUDIT_PASSED', { contextUpdates: { dod_record: incomplete } }, 'ACTIVE.DOD_AUDIT');
  assert.equal(refused.transitioned, false);

  const result = await signal(engine, 'DOD_AUDIT_PASSED', { contextUpdates: { dod_record: dodRecord('passed') } }, 'COMPLETE');
  assert.equal(result.transitioned, true);
  assert.equal(engine.getContext().dod_record.criteria[0].status, 'passed');
});

test('DOD_AUDIT_PASSED without a dod_record still checks the stored record', async t => {
  const engine = await fixture(t);
  await toDodAudit(engine);
  const result = await signal(engine, 'DOD_AUDIT_PASSED', {}, 'ACTIVE.DOD_AUDIT');
  assert.equal(result.transitioned, false);
});

test('BUG_FIXED allows three repair attempts per failure, then refuses the fourth', async t => {
  const engine = await fixture(t);
  await toDebug(engine);
  for (const attempt of [1, 2, 3]) {
    await fix(engine, debugRecord('F1', attempt), 'ACTIVE.VERIFY');
    await signal(engine, 'VERIFY_FAILED', {}, 'ACTIVE.DEBUG');
  }

  const refused = await fix(engine, debugRecord('F1', 4), 'ACTIVE.DEBUG');
  assert.equal(refused.transitioned, false);
  await signal(engine, 'DEBUG_BLOCKED', {}, 'BLOCKED');
});

test('BUG_FIXED refuses a missing record, skipped attempts, and blank failure evidence', async t => {
  const engine = await fixture(t);
  await toDebug(engine);
  const refusals = [
    ['no record', {}],
    ['skipped attempt', { contextUpdates: { debug_record: debugRecord('F1', 2) } }],
    ['blank evidence', { contextUpdates: { debug_record: debugRecord('F1', 1, { failure_evidence: ' ' }) } }],
    ['blank failure id', { contextUpdates: { debug_record: debugRecord('', 1) } }],
  ];
  for (const [label, payload] of refusals) {
    assert.equal((await signal(engine, 'BUG_FIXED', payload, 'ACTIVE.DEBUG')).transitioned, false, label);
  }
});

test('BUG_FIXED starts a new failure at attempt 1', async t => {
  const engine = await fixture(t);
  await toDebug(engine);
  await fix(engine, debugRecord('F1', 1), 'ACTIVE.VERIFY');
  await signal(engine, 'VERIFY_FAILED', {}, 'ACTIVE.DEBUG');

  assert.equal((await fix(engine, debugRecord('F2', 2), 'ACTIVE.DEBUG')).transitioned, false);
  await fix(engine, debugRecord('F2', 1), 'ACTIVE.VERIFY');
});

test('DoD approval refuses a structurally incomplete DoD', async t => {
  const engine = await fixture(t);
  await toPhase(engine, 'ACTIVE.DOD_APPROVAL');
  assert.equal((await signal(engine, 'USER_APPROVED', {}, 'ACTIVE.DOD_APPROVAL')).transitioned, false, 'no record');
  for (const [label, record] of malformedDods) {
    const refused = await signal(engine, 'USER_APPROVED', { contextUpdates: { dod_record: record } }, 'ACTIVE.DOD_APPROVAL');
    assert.equal(refused.transitioned, false, label);
  }

  await signal(engine, 'USER_APPROVED', { contextUpdates: { dod_record: dodRecord('pending') } }, 'ACTIVE.DEVELOP');
});

test('DoD amendment refuses a structurally incomplete DoD and accepts a valid stored record', async t => {
  const engine = await fixture(t);
  await toPhase(engine, 'ACTIVE.DEVELOP');
  await signal(engine, 'DOD_CHANGE_REQUESTED', {
    contextUpdates: { dod_record: dodRecord('pending', { revision_reason: 'Scope grew' }) },
  }, 'ACTIVE.DOD_AMENDMENT');
  for (const [label, record] of malformedDods) {
    const refused = await signal(engine, 'USER_APPROVED', { contextUpdates: { dod_record: record } }, 'ACTIVE.DOD_AMENDMENT');
    assert.equal(refused.transitioned, false, label);
  }

  await signal(engine, 'USER_APPROVED', {}, 'ACTIVE.AUDIT');
});

test('REVIEW_PASSED requires the signal to record a fresh-context reviewer', async t => {
  const engine = await fixture(t);
  await toPhase(engine, 'ACTIVE.REVIEW');
  const review = reviewer => ({ contextUpdates: { review_record: { result: 'passed', findings: [], reviewer } } });
  const refusals = [
    ['no reviewer', review(undefined)],
    ['shared context', review({ isolation: 'same_context', agent: 'builder' })],
    ['unnamed agent', review({ isolation: 'fresh_context', agent: ' ' })],
    ['missing agent', review({ isolation: 'fresh_context' })],
  ];
  for (const [label, payload] of refusals) {
    assert.equal((await signal(engine, 'REVIEW_PASSED', payload, 'ACTIVE.REVIEW')).transitioned, false, label);
  }

  await signal(engine, 'REVIEW_PASSED', review({ isolation: 'fresh_context', agent: 'code-reviewer subagent' }), 'ACTIVE.DOCUMENT');
});

test('DoD amendment refuses a malformed stored record until the signal carries a valid one', async t => {
  const engine = await fixture(t);
  await toPhase(engine, 'ACTIVE.DEVELOP');
  await signal(engine, 'DOD_CHANGE_REQUESTED', {
    contextUpdates: { dod_record: brokenCriterion({ expected_result: '' }) },
  }, 'ACTIVE.DOD_AMENDMENT');

  assert.equal((await signal(engine, 'USER_APPROVED', {}, 'ACTIVE.DOD_AMENDMENT')).transitioned, false);
  await signal(engine, 'USER_APPROVED', { contextUpdates: { dod_record: dodRecord('pending') } }, 'ACTIVE.AUDIT');
});

test('REVIEW_PASSED ignores a reviewer stored by an earlier review pass', async t => {
  const engine = await fixture(t);
  await toPhase(engine, 'ACTIVE.REVIEW');
  const reviewer = { isolation: 'fresh_context', agent: 'code-reviewer subagent' };
  await signal(engine, 'REVIEW_FINDINGS', { contextUpdates: { review_record: { result: 'findings', reviewer } } }, 'ACTIVE.DEVELOP');
  for (const [name, state] of [['BUILD_READY', 'ACTIVE.VERIFY'], ['VERIFY_PASSED', 'ACTIVE.TEST'], ['TEST_PASSED', 'ACTIVE.REVIEW']]) {
    await signal(engine, name, {}, state);
  }

  assert.equal((await signal(engine, 'REVIEW_PASSED', {}, 'ACTIVE.REVIEW')).transitioned, false);
});
