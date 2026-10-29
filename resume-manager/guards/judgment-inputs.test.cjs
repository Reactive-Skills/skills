const { test } = require('node:test');
const { assert, manifest, fixture, stubJev, capabilities, legacyRequest, candidateContext, measurement, sentinel } =
  require('../../scripts/judgment-test-support.cjs');

test('role-fit inputs require runtime selection capabilities', () => capabilities('resume-manager'));

test('both role-fit requests retain verified requirements and experience only', async t => {
  let probability = 0.8;
  const calls = await stubJev(t, ({ state }) => {
    const fit = state.context.candidate_experience_summary.includes('Built') ? 'strong_fit' : 'other';
    return { type: 'choice', choice: fit, confidence: 1, probabilities: { [fit]: fit === 'strong_fit' ? probability : 0.79 } };
  });
  const paths = ['target_title', 'jd_requirements', 'candidate_experience_summary'];
  for (const [signal, risk, target] of [['STANDARD_MATCH', false, 'GAP_ANALYSIS'], ['CALIBRATION_REQUIRED', true, 'CALIBRATE_FRAMING']]) {
    const transition = manifest('resume-manager').states.PROFILE_SELECTION.transitions[signal];
    const judgment = transition.judgment;
    assert.equal(judgment.min_probability, 0.8);
    assert.deepEqual(judgment.options, ['strong_fit', 'conditional_fit', 'weak_fit', 'other']);
    assert.equal(judgment.fallback_target, 'FIT_REVIEW');
    assert.equal(judgment.fallback_adapter, 'script');
    assert.deepEqual(judgment.context_paths, paths);
    assert.deepEqual(judgment.required_context_paths, ['jd_requirements', 'candidate_experience_summary']);
    assert.equal(judgment.include_payload, false);
    for (const valid of [true, false]) await t.test(`${signal} ${valid ? 'verified match' : 'unsupported fit'}`, async t => {
      probability = 0.8;
      const context = { target_title: 'Data engineer', jd_requirements: 'Build import services and validate source records',
        candidate_experience_summary: valid ? 'Built import services and validated source records' : 'No verified relevant experience',
        jd_text: sentinel, master_profile_path: sentinel, project_record: [sentinel], cover_letter_text: sentinel };
      const f = await fixture(t, 'resume-manager', 'PROFILE_SELECTION', context);
      const payload = { role_fit: 'strong_fit', overqualified_risk: risk, role_fit_reasons: [sentinel], contextUpdates: { private_notes: sentinel } };
      const baselineContext = candidateContext(f.engine, payload);
      const before = calls.length;
      await f.engine.handleSignal(signal, payload);
      assert.equal(calls.length, before + 1);
      const outgoing = calls.at(-1);
      assert.deepEqual(outgoing.state, { context: Object.fromEntries(paths.map(key => [key, context[key]])), currentState: 'PROFILE_SELECTION' });
      assert.equal(f.engine.getCurrentState(), valid ? target : 'FIT_REVIEW');
      assert.equal((await legacyRequest(judgment, baselineContext, { signal, ...payload }, 'PROFILE_SELECTION')).passed, valid);
      measurement(t, signal + (valid ? ':valid' : ':unsupported'), calls.at(-1).state, outgoing.state);
    });
    await t.test(`${signal} below-threshold match still requires human review`, async t => {
      probability = 0.79;
      const f = await fixture(t, 'resume-manager', 'PROFILE_SELECTION', { jd_requirements: 'Import services', candidate_experience_summary: 'Built import services' });
      await f.engine.handleSignal(signal, { role_fit: 'strong_fit', overqualified_risk: risk });
      assert.equal(f.engine.getCurrentState(), 'FIT_REVIEW');
    });
    for (const missing of ['jd_requirements', 'candidate_experience_summary']) {
      const context = { jd_requirements: 'Import services', candidate_experience_summary: 'Built import services' };
      delete context[missing];
      const f = await fixture(t, 'resume-manager', 'PROFILE_SELECTION', context);
      const before = calls.length;
      const result = await f.engine.handleSignal(signal, { role_fit: 'strong_fit', overqualified_risk: risk });
      assert.equal(result.transitioned, false);
      assert.equal(f.engine.getCurrentState(), 'PROFILE_SELECTION');
      assert.equal(calls.length, before);
    }
    await t.test(`${signal} current top-level evidence replaces stale evidence before judging`, async t => {
      probability = 0.8;
      const f = await fixture(t, 'resume-manager', 'PROFILE_SELECTION', {
        jd_requirements: 'Old role', candidate_experience_summary: 'No current evidence',
      });
      await f.engine.handleSignal(signal, { role_fit: 'strong_fit', overqualified_risk: risk,
        target_title: 'Data engineer', jd_requirements: 'Import services', candidate_experience_summary: 'Built import services' });
      assert.equal(f.engine.getCurrentState(), target);
      assert.deepEqual(calls.at(-1).state.context, { target_title: 'Data engineer', jd_requirements: 'Import services', candidate_experience_summary: 'Built import services' });
    });
    await t.test(`${signal} a passing judge cannot bypass factual fit and risk guards`, async t => {
      probability = 0.8;
      for (const payload of [
        { role_fit: 'weak_fit', overqualified_risk: risk },
        { role_fit: 'strong_fit', overqualified_risk: !risk },
      ]) {
        const f = await fixture(t, 'resume-manager', 'PROFILE_SELECTION', {
          jd_requirements: 'Import services', candidate_experience_summary: 'Built import services',
        });
        const result = await f.engine.handleSignal(signal, payload);
        assert.equal(result.transitioned, false);
        assert.equal(f.engine.getCurrentState(), 'PROFILE_SELECTION');
      }
    });
  }
});
