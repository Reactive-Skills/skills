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
// so the runtime's own probability-to-confidence mapping decides the transition.
async function stubJev(t, probability) {
  await runtime();
  const runtimeRequire = createRequire(runtimeEntry);
  const manifestPath = runtimeRequire.resolve('@typesafe-ai/sdk/package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const sdk = await import(pathToFileURL(path.join(path.dirname(manifestPath), manifest.exports['.'].import.default)).href);
  const original = sdk.TypeSafeClient.prototype.systemOne;
  const originalKey = process.env.TYPESAFE_API_KEY;
  process.env.TYPESAFE_API_KEY = originalKey || 'jsm-workflow-test-key';
  sdk.TypeSafeClient.prototype.systemOne = async () => ({
    model: 'jev-test',
    answers: { judgment: { type: 'noul', noul: probability } },
  });
  t.after(() => {
    sdk.TypeSafeClient.prototype.systemOne = original;
    if (originalKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = originalKey;
  });
}

async function fixture(t) {
  const { FSMEngine } = await runtime();
  const workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsm-workflow-test-'));
  const engine = new FSMEngine({ skillDir, workspaceDir, jobId: 'acceptance', initialContext: {} });
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
  { id: 'C1', question: 'Does the site build?', check_type: 'exact', status, evidence: status === 'passed' ? 'pnpm build exited 0' : '' },
  { id: 'C2', question: 'Does the page match the design?', check_type: 'semantic', status: 'passed', evidence: 'Preview screenshots' },
];
const dodRecord = (status, extra = {}) => ({ status: 'approved', outcome: 'Redesigned site on a verified preview', criteria: criteria(status), ...extra });

async function toPhase(engine, phase) {
  const steps = [
    ['RUNTIME_READY', { compatible: true }, 'ACTIVE.INTAKE'],
    ['WORK_REQUEST_READY', {}, 'ACTIVE.SCOPE'],
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
