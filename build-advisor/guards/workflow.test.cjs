const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const { test } = require('node:test');

const skillDir = path.resolve(__dirname, '..');
const guardCoverage = new Map();
let runtimePromise;
function runtime() {
  if (!runtimePromise) {
    let entry = process.env.BUILD_ADVISOR_RUNTIME;
    if (entry) entry = path.resolve(entry);
    else {
      try {
        entry = require.resolve('@reactive-skills/runtime');
      } catch {
        const globalRoot = execFileSync('rtk', ['npm', 'root', '-g'], { encoding: 'utf8' }).trim();
        const axiRequire = createRequire(path.join(globalRoot, '@reactive-skills/axi/package.json'));
        entry = axiRequire.resolve('@reactive-skills/runtime');
      }
    }
    runtimePromise = import(pathToFileURL(entry).href);
  }
  return runtimePromise;
}

async function fixture(t) {
  const { FSMEngine } = await runtime();
  const workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'build-advisor-test-'));
  const engine = new FSMEngine({ skillDir, workspaceDir, jobId: 'acceptance', initialContext: {} });
  t.after(() => {
    engine.getEventStore().close();
    const target = fs.realpathSync(workspaceDir);
    assert.equal(path.dirname(target), fs.realpathSync(os.tmpdir()));
    assert.match(path.basename(target), /^build-advisor-test-/);
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 3 });
  });
  return { engine, workspaceDir, FSMEngine };
}

const evidence = [
  { id: 'e1', claim: 'New clients struggle to complete setup.', kind: 'observed', source: 'User-supplied support report' },
];
const situation = {
  question: 'Should we redesign the client setup experience?',
  domain: 'product',
  stage: 'iteration',
  decision_owner: 'Product owner',
  constraints: ['Use the existing team'],
};
const recommendation = route => ({
  basis_version: 1, route, direction: 'investigate',
  rationale: 'Observe the setup journey before committing to a redesign.',
  limitations: ['Only one source is currently available.'],
});
const update = (key, value, extra = {}) => ({ ...extra, contextUpdates: { [key]: value } });

async function signal(engine, name, payload, state, transitioned = true) {
  const previousState = engine.getCurrentState();
  const segments = previousState.split('.');
  let handledAt;
  for (let depth = segments.length; depth > 0; depth--) {
    if (engine.getStateDefinition(segments.slice(0, depth))?.transitions?.[name]) {
      handledAt = segments.slice(0, depth).join('.');
      break;
    }
  }
  assert.ok(handledAt, name + ' must have a declared handler');
  const key = handledAt + ':' + name;
  const coverage = guardCoverage.get(key) || { accepted: false, rejected: false };
  if (transitioned) {
    const incomplete = await engine.handleSignal(name, {});
    assert.equal(incomplete.transitioned, false, key + ' must reject missing inputs');
    assert.equal(engine.getCurrentState(), previousState, key + ' must retain its state on rejection');
    coverage.rejected = true;
  }
  const result = await engine.handleSignal(name, payload);
  assert.equal(result.transitioned, transitioned, name);
  assert.equal(engine.getCurrentState(), state, name);
  coverage[transitioned ? 'accepted' : 'rejected'] = true;
  guardCoverage.set(key, coverage);
  return result;
}
async function boot(engine) {
  await signal(engine, 'RUNTIME_READY', {
    compatible: true,
    contextUpdates: { selected_runtime: {
      compatible: true, transport: 'axi', launcher: 'direct', runtime_version: '0.16.0',
      axi_version: '0.16.0', capabilities: ['runtime.bootloader', 'runtime.transport_handshake'],
      parent_dispatch_verified: true,
    } },
  }, 'ACTIVE.FRAME');
}
async function select(engine, route) {
  await signal(engine, route.toUpperCase() + '_SELECTED',
    { contextUpdates: { route, situation, evidence } },
    { develop: 'ACTIVE.DEVELOP.PROBLEM', challenge: 'ACTIVE.CHALLENGE.INSPECT', advise: 'ACTIVE.ADVISE.DIAGNOSE' }[route]);
}
async function develop(engine) {
  await signal(engine, 'PROBLEM_FRAMED', update('problem', {
    basis_version: 1, customer: 'New clients', pain: 'Setup is confusing', why_now: 'Support reports recurring issues',
    alternatives: ['Improve instructions', 'Keep the current process'],
  }), 'ACTIVE.DEVELOP.STORY');
  await signal(engine, 'STORY_READY', update('story', {
    basis_version: 1, narrative: 'Understand setup before rebuilding it.', promise: 'A clearer first-use experience',
    claims: [{ claim: 'Setup becomes easier', kind: 'assumption' }],
  }), 'ACTIVE.DEVELOP.EXPERIENCE');
  await signal(engine, 'EXPERIENCE_READY', update('experience', {
    basis_version: 1,
    touchpoints: ['discovery', 'evaluation', 'acquisition', 'onboarding', 'use', 'support', 'retention', 'exit']
      .map(stage => ({ stage, status: 'needs_test', detail: 'Inspect the existing ' + stage + ' experience.' })),
  }), 'ACTIVE.DEVELOP.LEARNING');
  await signal(engine, 'DEVELOPMENT_READY', { contextUpdates: {
    learning_plan: { basis_version: 1, experiments: [], milestones: ['Observe five setups'],
      launch_criteria: 'Confirm the revised instructions solve the observed confusion',
      next_generation: 'Use observed support outcomes to guide later improvements' },
    recommendation: recommendation('develop'),
  } }, 'ACTIVE.DECISION');
}
async function inspect(engine) {
  await signal(engine, 'REVIEW_SCOPED', update('assessment', {
    basis_version: 1, artifact: 'User-supplied setup proposal', summary: 'The proposed fix is untested',
    findings: [{ consequence: 'We may redesign the wrong touchpoint', evidence_refs: ['e1'] }],
  }), 'ACTIVE.CHALLENGE.STRESS_TEST');
}
const plannedTest = {
  question: 'Where do clients get stuck?', method: 'Observe setup', measure: 'Completion and confusion',
  deadline: 'Before deciding on redesign', status: 'planned', evidence_refs: [],
};
async function challenge(engine) {
  await inspect(engine);
  await signal(engine, 'TESTS_DEFINED', update('uncertainty_plan', {
    basis_version: 1, tests: [plannedTest], no_test_reason: '',
  }), 'ACTIVE.CHALLENGE.VERDICT');
  await signal(engine, 'VERDICT_READY', update('recommendation', recommendation('challenge')), 'ACTIVE.DECISION');
}
async function advise(engine) {
  await signal(engine, 'DIAGNOSIS_READY', update('diagnosis', {
    basis_version: 1, issue: 'Team is choosing a redesign without observing the whole journey',
    decision_type: 'evidence-informed judgment', principles: ['2.2', '3.1'],
  }), 'ACTIVE.ADVISE.OPTIONS');
  await signal(engine, 'OPTIONS_READY', update('options', {
    basis_version: 1, choices: [
      { choice: 'Redesign now', consequences: 'May solve the wrong problem' },
      { choice: 'Observe setup first', consequences: 'Delays redesign but provides customer insight' },
    ],
  }), 'ACTIVE.ADVISE.RECOMMEND');
  await signal(engine, 'ADVICE_READY', update('recommendation', recommendation('advise')), 'ACTIVE.DECISION');
}
async function approve(engine) {
  return signal(engine, 'DECISION_ACCEPTED', update('decision', {
    basis_version: 1, direction: 'investigate', rationale: 'Observe first', owner: 'Product owner',
  }, { approved: true, approval_source: 'Explicit user approval in acceptance fixture' }), 'ACTIVE.NEXT_ACTION');
}
const action = type => ({
  basis_version: 1, type, owner: 'Product owner', next_step: 'Observe five real setups',
  review_trigger: 'After five observed setups',
});

test('bootstrap and framing reject missing compatibility and required situation details', async t => {
  const { engine } = await fixture(t);
  await signal(engine, 'RUNTIME_READY', { compatible: true }, 'INIT', false);
  await signal(engine, 'RUNTIME_READY', { compatible: true, contextUpdates: {
    selected_runtime: { compatible: true, parent_dispatch_verified: false },
  } }, 'INIT', false);
  await boot(engine);
  await signal(engine, 'DEVELOP_SELECTED', { contextUpdates: { route: 'develop' } }, 'ACTIVE.FRAME', false);
  await select(engine, 'develop');
});

for (const route of ['develop', 'challenge', 'advise']) {
  test(route + ' reaches a human decision and produces a truthful handoff', async t => {
    const { engine } = await fixture(t);
    await boot(engine);
    await select(engine, route);
    await { develop, challenge, advise }[route](engine);
    await signal(engine, 'DECISION_ACCEPTED', update('decision', {
      basis_version: 1, direction: 'investigate', rationale: 'Observe first', owner: 'Product owner',
    }, { approved: false, approval_source: 'No user approval' }), 'ACTIVE.DECISION', false);
    await approve(engine);
    const result = await signal(engine, 'HANDOFF_READY', update('action', action('handoff'),
      { handoff_delivered: true }), 'COMPLETED');
    const memoPath = result.deliverablesWritten.find(file => path.basename(file) === 'decision.md');
    assert.ok(memoPath, 'Runtime must generate the memo');
    const memo = fs.readFileSync(memoPath, 'utf8');
    assert.match(memo, /Product owner/);
    assert.match(memo, /Planned work below has not been completed/);
    assert.match(memo, /basis_version/);
    const snapshotPath = result.deliverablesWritten.find(file => path.basename(file) === 'snapshot.json');
    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    assert.equal(snapshot.context.route, route);
    assert.equal(snapshot.state, 'COMPLETED');
    assert.equal(engine.getContext().evidence[0].kind, 'observed');
  });
}

test('challenge cannot report an observed test without actual observed evidence', async t => {
  const { engine } = await fixture(t);
  await boot(engine);
  await select(engine, 'challenge');
  await inspect(engine);
  await signal(engine, 'TESTS_DEFINED', update('uncertainty_plan', {
    basis_version: 1, tests: [{ ...plannedTest, status: 'observed' }], no_test_reason: '',
  }), 'ACTIVE.CHALLENGE.STRESS_TEST', false);
  await signal(engine, 'TESTS_DEFINED', update('uncertainty_plan', {
    basis_version: 1, tests: [{ ...plannedTest, status: 'observed', evidence_refs: ['missing'] }],
  }), 'ACTIVE.CHALLENGE.STRESS_TEST', false);
  await signal(engine, 'TESTS_DEFINED', update('uncertainty_plan', {
    basis_version: 1, tests: [{ ...plannedTest, status: 'observed', evidence_refs: ['e1'] }],
  }), 'ACTIVE.CHALLENGE.VERDICT');
});

test('a scoped challenge can reasonably require no further test', async t => {
  const { engine } = await fixture(t);
  await boot(engine);
  await select(engine, 'challenge');
  await inspect(engine);
  await signal(engine, 'TESTS_DEFINED', update('uncertainty_plan', {
    basis_version: 1, tests: [], no_test_reason: 'Only a wording discrepancy was in scope.',
  }), 'ACTIVE.CHALLENGE.VERDICT');
});

test('a shared route change works from a leaf and retains the evidence history', async t => {
  const { engine } = await fixture(t);
  await boot(engine);
  await select(engine, 'develop');
  await signal(engine, 'ROUTE_CHANGED', { reason: 'User requests critique first',
    contextUpdates: { route: 'challenge' } }, 'ACTIVE.FRAME');
  assert.deepEqual(engine.getContext().evidence, evidence);
  assert.equal(engine.getContext().basis_version, 1);
  assert.equal(engine.getContext().recommendation, null);
  await select(engine, 'challenge');
});

test('changed circumstances invalidate stale derived records', async t => {
  const { engine } = await fixture(t);
  await boot(engine);
  await select(engine, 'develop');
  await signal(engine, 'SITUATION_CHANGED', {
    reason: 'Customer segment changed', contextUpdates: { basis_version: 2 },
  }, 'ACTIVE.FRAME');
  await select(engine, 'develop');
  await signal(engine, 'PROBLEM_FRAMED', update('problem', {
    basis_version: 1, customer: 'Old customer', pain: 'Old pain', why_now: 'Old timing', alternatives: ['Wait'],
  }), 'ACTIVE.DEVELOP.PROBLEM', false);
  await signal(engine, 'PROBLEM_FRAMED', update('problem', {
    basis_version: 2, customer: 'New customer', pain: 'Known pain', why_now: 'Current timing', alternatives: ['Wait'],
  }), 'ACTIVE.DEVELOP.STORY');
});

test('new evidence requires actual new observations and reopens the decision', async t => {
  const { engine } = await fixture(t);
  await boot(engine);
  await select(engine, 'challenge');
  await challenge(engine);
  await approve(engine);
  await signal(engine, 'ACTION_PLANNED', update('action', action('experiment')), 'ACTIVE.AWAIT_EVIDENCE');
  await signal(engine, 'RESULTS_RECEIVED', { result_refs: ['e1'],
    contextUpdates: { basis_version: 2, evidence } }, 'ACTIVE.AWAIT_EVIDENCE', false);
  const observation = { id: 'e2', claim: 'Four clients paused at the same instruction.',
    kind: 'observed', source: 'Five completed setup observations' };
  await signal(engine, 'RESULTS_RECEIVED', { result_refs: ['e2'],
    contextUpdates: { basis_version: 2, evidence: [...evidence, observation] } }, 'ACTIVE.FRAME');
  assert.equal(engine.getContext().decision, null);
  assert.equal(engine.getContext().action, null);
  assert.equal(engine.getContext().basis_version, 2);
});

test('waiting state and shared records survive actual ledger rehydration', async t => {
  const { engine, workspaceDir, FSMEngine } = await fixture(t);
  await boot(engine);
  await select(engine, 'advise');
  await advise(engine);
  await approve(engine);
  await signal(engine, 'ACTION_PLANNED', update('action', action('review')), 'ACTIVE.AWAIT_EVIDENCE');
  const resumed = new FSMEngine({
    skillDir, workspaceDir, eventStore: engine.getEventStore(),
    jobId: engine.getEventStore().getEventContext().run_id,
  });
  assert.equal(resumed.getCurrentState(), 'ACTIVE.AWAIT_EVIDENCE');
  assert.deepEqual(resumed.getContext().action, action('review'));
  assert.deepEqual(resumed.getContext().evidence, evidence);
});

test('one parent cancellation handler serves every active leaf and requires a reason', async t => {
  const { engine } = await fixture(t);
  await boot(engine);
  await select(engine, 'advise');
  await signal(engine, 'CANCEL', {}, 'ACTIVE.ADVISE.DIAGNOSE', false);
  await signal(engine, 'CANCEL', { reason: 'User cancelled this task' }, 'CANCELLED');
  const bubbled = engine.getEventStore().query({ type: 'EVENT_BUBBLED' });
  assert.equal(bubbled.at(-1).payload.handledAt, 'ACTIVE');
});

const firstSteps = {
  develop: { signal: 'PROBLEM_FRAMED', key: 'problem', state: 'ACTIVE.DEVELOP.STORY', record: {
    basis_version: 1, customer: 'New clients', pain: 'Setup is confusing', why_now: 'Recurring support requests',
    alternatives: ['Improve instructions', 'Keep the current process'],
  } },
  challenge: { signal: 'REVIEW_SCOPED', key: 'assessment', state: 'ACTIVE.CHALLENGE.STRESS_TEST', record: {
    basis_version: 1, artifact: 'Setup proposal', summary: 'Proposed fix is untested',
    findings: [{ consequence: 'May solve the wrong problem', evidence_refs: ['e1'] }],
  } },
  advise: { signal: 'DIAGNOSIS_READY', key: 'diagnosis', state: 'ACTIVE.ADVISE.OPTIONS', record: {
    basis_version: 1, issue: 'Redesign precedes observation', decision_type: 'evidence-informed judgment',
    principles: ['2.2', '3.1'],
  } },
};

for (const [route, revision, initial] of [
  ['develop', 'REVISE_PROBLEM', 'ACTIVE.DEVELOP.PROBLEM'],
  ['challenge', 'REVISE_REVIEW', 'ACTIVE.CHALLENGE.INSPECT'],
  ['advise', 'REVISE_DIAGNOSIS', 'ACTIVE.ADVISE.DIAGNOSE'],
]) {
  test(route + ' revisions are handled once at the route parent', async t => {
    const { engine } = await fixture(t);
    await boot(engine);
    await select(engine, route);
    const step = firstSteps[route];
    await signal(engine, step.signal, update(step.key, step.record), step.state);
    await signal(engine, revision, { reason: 'User supplied a revised premise' }, initial);
    const bubbled = engine.getEventStore().query({ type: 'EVENT_BUBBLED' });
    assert.equal(bubbled.at(-1).payload.handledAt, 'ACTIVE.' + route.toUpperCase());
  });
}

test('experience review can return to a product story without bypassing its guard', async t => {
  const { engine } = await fixture(t);
  await boot(engine);
  await select(engine, 'develop');
  const step = firstSteps.develop;
  await signal(engine, step.signal, update(step.key, step.record), step.state);
  await signal(engine, 'STORY_READY', update('story', {
    basis_version: 1, narrative: 'Make setup clearer', promise: 'Fewer confusing steps',
    claims: [{ claim: 'Setup is easier', kind: 'assumption' }],
  }), 'ACTIVE.DEVELOP.EXPERIENCE');
  await signal(engine, 'REVISE_STORY', { reason: 'Experience review found an unsupported promise' },
    'ACTIVE.DEVELOP.STORY');
});

test('human feedback returns a recommendation to framing', async t => {
  const { engine } = await fixture(t);
  await boot(engine);
  await select(engine, 'advise');
  await advise(engine);
  await signal(engine, 'DECISION_REVISED', { feedback: 'Reconsider the available team capacity' }, 'ACTIVE.FRAME');
  assert.equal(engine.getContext().recommendation, null);
});

test('an incompatible runtime follows the recovery route', async t => {
  const { engine } = await fixture(t);
  await signal(engine, 'SETUP_REQUIRED', { compatible: false }, 'BYPASS_DETECTED');
});

test('state prompts, signals, context keys, and diagram match the manifest', async () => {
  const { SkillManifestSchema, createReactiveBootloaderReference } = await runtime();
  const globalRoot = execFileSync('rtk', ['npm', 'root', '-g'], { encoding: 'utf8' }).trim();
  const yaml = createRequire(path.join(globalRoot, '@reactive-skills/axi/package.json'))('js-yaml');
  const manifest = yaml.load(fs.readFileSync(path.join(skillDir, 'skill.yaml'), 'utf8'));
  SkillManifestSchema.parse(manifest);
  const diagram = fs.readFileSync(path.join(skillDir, 'STATECHART.md'), 'utf8');
  const referenced = new Set();
  const signals = [];
  const cancellationStates = [];
  const guardedTransitions = [];
  function walk(states, prefix = '') {
    for (const [name, state] of Object.entries(states)) {
      const full = prefix ? prefix + '.' + name : name;
      const promptPath = path.join(skillDir, state.prompt_template);
      referenced.add(path.resolve(promptPath));
      const prompt = fs.readFileSync(promptPath, 'utf8');
      assert.ok(prompt.trim().split(/\s+/).length < 200, full + ' exceeds the word budget');
      assert.match(prompt, /Atomic checklist/, full + ' needs an atomic checklist');
      for (const [signalName, transition] of Object.entries(state.transitions || {})) {
        guardedTransitions.push(full + ':' + signalName);
        if (signalName === 'CANCEL') cancellationStates.push(full);
        assert.ok(prompt.includes('Emit:') && prompt.includes(signalName), full + ' omits ' + signalName);
        new Function('event', 'payload', 'context', 'return (' + transition.guard + ');');
        const edge = full.replaceAll('.', '__') + ' --> ' + transition.target.replaceAll('.', '__') + ' : ' + signalName;
        assert.ok(diagram.includes(edge), 'Diagram omits ' + edge);
        assert.ok(diagram.includes(transition.guard.replaceAll('|', '&#124;')), 'Diagram omits guard for ' + signalName);
        signals.push(edge);
      }
      if (state.substates) {
        assert.ok(diagram.includes('state "' + name + '" as ' + full.replaceAll('.', '__') + ' {'));
        walk(state.substates, full);
      }
    }
  }
  walk(manifest.states);
  assert.deepEqual(cancellationStates, ['ACTIVE']);
  for (const key of guardedTransitions) {
    assert.deepEqual(guardCoverage.get(key), { accepted: true, rejected: true },
      key + ' requires both passing and violating actual-runtime inputs');
  }
  function diskPrompts(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
      const child = path.join(dir, entry.name);
      return entry.isDirectory() ? diskPrompts(child) : entry.name.endsWith('.md') ? [path.resolve(child)] : [];
    });
  }
  assert.deepEqual(new Set(diskPrompts(path.join(skillDir, 'states'))), referenced);
  const drawnSignals = diagram.split('\n').filter(line => / --> .* : /.test(line)).map(line => line.trim());
  assert.deepEqual(new Set(drawnSignals), new Set(signals));
  const markdown = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
  assert.ok(markdown.includes(createReactiveBootloaderReference('build-advisor').trim()));
  const release = JSON.parse(fs.readFileSync(path.join(skillDir, 'skill-release.json'), 'utf8'));
  assert.equal(release.version, manifest.version);
  assert.equal(release.reactiveSchemaVersion, manifest.schema_version);
});
