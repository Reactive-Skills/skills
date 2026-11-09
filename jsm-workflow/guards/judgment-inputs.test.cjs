const { test } = require('node:test');
const { assert, runtime, manifest, fixture, stubJev, capabilities, measurement, sentinel } =
  require('../../scripts/judgment-test-support.cjs');

test('single-check selection requires runtime selection capabilities', () => capabilities('jsm-workflow'));

test('JSM sends one check and retains the full record for local checks and replay', async t => {
  const calls = await stubJev(t, ({ state }) => ({ type: 'noul', noul:
    state.event.contextUpdates.dod_record.active_check.evidence === 'Preview matches approved design' ? 0.85 : 0.84 }));
  const api = await runtime;
  const judgment = manifest('jsm-workflow').states.ACTIVE.substates.DOD_AUDIT.transitions.DOD_CHECK_SUBMITTED.judgment;
  const prefix = 'contextUpdates.dod_record.active_check.';
  assert.equal(judgment.min_probability, 0.85);
  assert.equal(judgment.fallback_target, 'ACTIVE.DEVELOP');
  assert.deepEqual(judgment.context_paths, []);
  assert.deepEqual(judgment.payload_paths, ['id', 'question', 'expected_result', 'evidence'].map(key => prefix + key));
  for (const valid of [true, false]) await t.test(valid ? 'supported check' : 'contradicting evidence', async t => {
    const active_check = { id: 'C2', question: 'Does the page match the design?', expected_result: 'Matches approved design',
      evidence: valid ? 'Preview matches approved design' : 'Preview lacks required navigation', private_notes: sentinel };
    const record = { status: 'approved', version: 3, outcome: sentinel, criteria: [
      { id: 'C1', question: sentinel, status: 'passed', evidence: sentinel },
      { id: 'C2', question: active_check.question, status: 'pending', evidence: '' },
    ], active_check };
    const context = { dod_record: { ...record, active_check: { id: 'C1', question: sentinel, evidence: sentinel } }, work_request: sentinel };
    const payload = { contextUpdates: { dod_record: record, private_notes: sentinel }, private_notes: sentinel };
    const f = await fixture(t, 'jsm-workflow', 'ACTIVE.DOD_AUDIT', context);
    await f.engine.handleSignal('DOD_CHECK_SUBMITTED', payload);
    const outgoing = calls.at(-1);
    const selected = Object.fromEntries(['id', 'question', 'expected_result', 'evidence'].map(key => [key, active_check[key]]));
    assert.deepEqual(outgoing.state, { event: { contextUpdates: { dod_record: { active_check: selected } } }, context: {}, currentState: 'ACTIVE.DOD_AUDIT' });
    assert.equal(f.engine.getCurrentState(), valid ? 'ACTIVE.DOD_AUDIT' : 'ACTIVE.DEVELOP');
    if (valid) {
      assert.deepEqual(f.engine.getContext().dod_record, record);
      assert.deepEqual(f.reopen().getContext().dod_record, record);
      // Payload selection must not remove criteria needed by the existing completion guard.
      const result = await f.engine.handleSignal('DOD_AUDIT_PASSED', {});
      assert.equal(result.transitioned, false);
    }
    const legacy = { ...judgment };
    delete legacy.payload_paths;
    const old = await api.JudgmentEngine.evaluate(legacy, { context, event: { payload: { signal: 'DOD_CHECK_SUBMITTED', ...payload } }, currentState: 'ACTIVE.DOD_AUDIT' });
    assert.equal(old.passed, valid);
    measurement(t, 'DOD_CHECK_SUBMITTED' + (valid ? ':valid' : ':invalid'), calls.at(-1).state, outgoing.state);
  });
  for (const field of ['id', 'question', 'expected_result', 'evidence']) {
    const active_check = { id: 'C2', question: 'Check?', expected_result: 'Yes', evidence: 'Result' };
    delete active_check[field];
    const f = await fixture(t, 'jsm-workflow', 'ACTIVE.DOD_AUDIT');
    const before = calls.length;
    const result = await f.engine.handleSignal('DOD_CHECK_SUBMITTED', { contextUpdates: { dod_record: { active_check } } });
    assert.equal(result.transitioned, false);
    assert.equal(f.engine.getCurrentState(), 'ACTIVE.DOD_AUDIT');
    assert.equal(calls.length, before);
  }
});
