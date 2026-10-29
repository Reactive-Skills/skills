const { test } = require('node:test');
const { assert, manifest, fixture, stubJev, capabilities, legacyRequest, candidateContext, measurement, sentinel } =
  require('../../scripts/judgment-test-support.cjs');

// Each pair differs in criterion-relevant evidence, while unrelated records stay identical.
const cases = [
  ['ROUTE_TASK', 'route_task', ['requested_task', 'study_topic', 'research_problem', 'research_purpose', 'output_scope', 'review_mode', 'missing_information'],
    ['requested_task'], 'requested_task', 'Plan a survey', 'Unclear request', 'plan_quantitative_methods',
    ['explore_or_clarify_goal', 'choose_research_approach', 'work_on_proposal_section', 'plan_quantitative_methods', 'plan_qualitative_methods', 'plan_mixed_methods', 'review_existing_plan', 'other']],
  ['CHOOSE_APPROACH', 'research_approach', ['research_problem', 'research_purpose', 'research_questions', 'hypotheses', 'intended_audience', 'worldview', 'design_notes', 'missing_information'],
    ['research_problem', 'research_purpose'], 'research_purpose', 'Measure associations between attendance and scores', 'Purpose undecided', 'quantitative',
    ['quantitative', 'qualitative', 'mixed_methods', 'other']],
  ['CHOOSE_QUANTITATIVE_DESIGN', 'quantitative_design', ['research_purpose', 'research_questions', 'hypotheses', 'design_notes', 'missing_information'],
    ['research_questions'], 'design_notes', 'Random assignment and an intervention comparison are feasible', 'Access and assignment are unknown', 'experiment',
    ['survey', 'experiment', 'other']],
  ['CHOOSE_QUALITATIVE_STRATEGY', 'qualitative_strategy', ['research_problem', 'research_purpose', 'research_questions', 'design_notes', 'missing_information'],
    ['research_purpose'], 'design_notes', 'Study the meaning of a shared lived experience', 'Phenomenon and unit of analysis undecided', 'phenomenology',
    ['narrative', 'phenomenology', 'ethnography', 'case_study', 'grounded_theory', 'other']],
  ['CHOOSE_MIXED_METHODS_DESIGN', 'mixed_methods_design', ['research_purpose', 'research_questions', 'design_notes', 'missing_information'],
    ['research_purpose'], 'design_notes', 'Use quantitative findings to shape later interviews and integrate explanations', 'Sequence and integration are undecided', 'explanatory_sequential',
    ['convergent', 'explanatory_sequential', 'exploratory_sequential', 'complex', 'other']],
];

test('recommendation inputs require runtime selection capabilities', () => capabilities('research-design-planner'));

test('all five research requests retain decision evidence and exclude unrelated study records', async t => {
  let answer;
  const calls = await stubJev(t, request => answer(request));
  for (const [state, kind, paths, required, evidenceKey, validText, invalidText, choice, options] of cases) {
    const transition = manifest('research-design-planner').states.DECISIONS.substates[state].transitions.RECOMMENDATION_SUBMITTED;
    const judgment = transition.judgment;
    assert.equal(judgment.min_confidence, 0.7);
    assert.deepEqual(judgment.options, options);
    assert.equal(judgment.fallback_target, 'CLARIFY');
    assert.equal(judgment.adapter_hint, 'jev');
    assert.equal(judgment.fallback_adapter, 'jev');
    assert.deepEqual(judgment.context_paths, paths);
    assert.deepEqual(judgment.required_context_paths, required);
    assert.equal(judgment.include_payload, false);
    for (const valid of [true, false]) await t.test(`${kind} ${valid ? 'supported' : 'unresolved'}`, async t => {
      const context = { requested_task: 'Choose a design', study_topic: 'Attendance', research_problem: 'Unknown association',
        research_purpose: 'Understand attendance', research_questions: ['How does attendance relate to scores?'],
        hypotheses: [], intended_audience: 'Educators', worldview: null, design_notes: [], missing_information: [],
        output_scope: 'Methods plan', review_mode: false, ethics_notes: sentinel, unrelated_record: sentinel,
        [evidenceKey]: valid ? validText : invalidText };
      const payload = { decision_kind: kind, choice, contextUpdates: { decision_kind: kind, selected_choice: choice, private_notes: sentinel } };
      answer = ({ state }) => ({ type: 'choice', choice: state.context[evidenceKey] === validText ? choice : 'other',
        confidence: state.context[evidenceKey] === validText ? 0.7 : 0.69 });
      const f = await fixture(t, 'research-design-planner', `DECISIONS.${state}`, context);
      const baselineContext = candidateContext(f.engine, payload);
      const before = calls.length;
      await f.engine.handleSignal('RECOMMENDATION_SUBMITTED', payload);
      assert.equal(calls.length, before + 1);
      const outgoing = calls.at(-1);
      assert.deepEqual(outgoing.state, { context: Object.fromEntries(paths.map(key => [key, context[key]])), currentState: `DECISIONS.${state}` });
      assert.equal(f.engine.getCurrentState(), valid ? 'DECISIONS.DISPATCH' : 'CLARIFY');
      const old = await legacyRequest(judgment, baselineContext, { signal: 'RECOMMENDATION_SUBMITTED', ...payload }, `DECISIONS.${state}`);
      assert.equal(old.passed, valid);
      measurement(t, kind + (valid ? ':valid' : ':unresolved'), calls.at(-1).state, outgoing.state);
    });
    // Runtime 0.20.0 only checks path presence: manifest defaults and other present empty values still reach the SDK.
    const recorded = { requested_task: 'Choose a design', research_problem: 'Problem', research_purpose: 'Purpose', research_questions: ['Question'] };
    const defaults = manifest('research-design-planner').default_context;
    for (const key of required) {
      for (const [label, value] of [['manifest default', defaults[key]], ['empty string', ''], ['empty array', []]]) {
        await t.test(`${kind} ${key} as ${label} still reaches the SDK`, async t => {
          answer = () => ({ type: 'choice', choice, confidence: 0.7 });
          const context = { ...recorded };
          if (label === 'manifest default') delete context[key];
          else context[key] = value;
          const f = await fixture(t, 'research-design-planner', `DECISIONS.${state}`, context);
          const before = calls.length;
          await f.engine.handleSignal('RECOMMENDATION_SUBMITTED', { decision_kind: kind, choice });
          assert.equal(calls.length, before + 1);
          assert.deepEqual(calls.at(-1).state.context[key], value);
        });
      }
      await t.test(`${kind} genuinely absent ${key} never reaches the SDK`, async t => {
        const f = await fixture(t, 'research-design-planner', `DECISIONS.${state}`, { ...recorded, [key]: undefined });
        const before = calls.length;
        const result = await f.engine.handleSignal('RECOMMENDATION_SUBMITTED', { decision_kind: kind, choice });
        assert.equal(result.transitioned, false);
        assert.equal(f.engine.getCurrentState(), `DECISIONS.${state}`);
        assert.equal(calls.length, before);
      });
    }
    await t.test(`${kind} explicit choice remains deterministic`, async t => {
      const f = await fixture(t, 'research-design-planner', `DECISIONS.${state}`);
      const before = calls.length;
      await f.engine.handleSignal('USER_CHOICE_SUBMITTED', { decision_kind: kind, choice });
      assert.equal(f.engine.getCurrentState(), 'DECISIONS.DISPATCH');
      assert.equal(calls.length, before);
    });
    await t.test(`${kind} a passing judge cannot bypass the decision-kind guard`, async t => {
      answer = () => ({ type: 'choice', choice, confidence: 0.7 });
      const f = await fixture(t, 'research-design-planner', `DECISIONS.${state}`, {
        requested_task: 'Choose a design', research_problem: 'Problem', research_purpose: 'Purpose', research_questions: ['Question'],
      });
      const result = await f.engine.handleSignal('RECOMMENDATION_SUBMITTED', { decision_kind: 'invalid', choice });
      assert.equal(result.transitioned, false);
      assert.equal(f.engine.getCurrentState(), `DECISIONS.${state}`);
    });
  }
});

test('the six deterministic script judgments remain local', () => {
  const local = [];
  const visit = states => {
    for (const state of Object.values(states)) {
      for (const transition of Object.values(state.transitions || {})) {
        if (transition.judgment) local.push(transition.judgment.adapter_hint);
      }
      visit(state.substates || {});
    }
  };
  for (const skill of ['docs-architect', 'product-manager', 'pr-triage']) visit(manifest(skill).states);
  assert.deepEqual(local, Array(6).fill('script'));
});
