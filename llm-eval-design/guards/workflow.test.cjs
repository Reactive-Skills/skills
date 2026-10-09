'use strict';
// Synthetic fixtures establish workflow behavior, not the quality of any real eval design.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const { test } = require('node:test');
const skillDir = path.resolve(__dirname, '..');
const coverage = new Map();
let runtimePromise;

// Global package roots are derived from the Node install and NODE_PATH, so no subprocess is needed.
function globalRoots() {
  const node = path.dirname(process.execPath);
  return [path.join(node, '..', 'lib', 'node_modules'), path.join(node, 'node_modules'),
    ...(process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean)];
}
function axiRequire() {
  const root = globalRoots().find(dir => fs.existsSync(path.join(dir, '@reactive-skills', 'axi', 'package.json')));
  assert.ok(root, 'Install @reactive-skills/axi globally or set LLM_EVAL_DESIGN_RUNTIME');
  return createRequire(path.join(root, '@reactive-skills', 'axi', 'package.json'));
}

function runtime() {
  if (!runtimePromise) {
    let entry = process.env.LLM_EVAL_DESIGN_RUNTIME;
    if (!entry) {
      try { entry = require.resolve('@reactive-skills/runtime'); }
      catch { entry = axiRequire().resolve('@reactive-skills/runtime'); }
    }
    runtimePromise = import(pathToFileURL(path.resolve(entry)).href);
  }
  return runtimePromise;
}

async function fixture(t) {
  const { FSMEngine } = await runtime();
  const workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-eval-design-test-'));
  const engines = [];
  const open = jobId => { const engine = new FSMEngine({ skillDir, workspaceDir, jobId, initialContext: {} }); engines.push(engine); return engine; };
  t.after(() => {
    for (const engine of engines) engine.getEventStore().close();
    const target = fs.realpathSync(workspaceDir);
    assert.equal(path.dirname(target), fs.realpathSync(os.tmpdir()));
    assert.match(path.basename(target), /^llm-eval-design-test-/);
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 3 });
  });
  return { engine: open('synthetic-acceptance'), open, workspaceDir };
}

const clone = value => structuredClone(value);
const payload = (updates, extra = {}) => ({ ...extra, contextUpdates: updates });

async function signal(engine, name, updates, state, extra = {}) {
  const from = engine.getCurrentState();
  assert.equal((await engine.handleSignal(name, {})).transitioned, false, name + ' rejects incomplete inputs');
  const result = await engine.handleSignal(name, payload(updates, extra));
  assert.equal(result.transitioned, true, name + ': ' + JSON.stringify(result));
  assert.equal(engine.getCurrentState(), state, name);
  coverage.set(from + ':' + name, name);
  return result;
}

async function reject(engine, name, updates, extra = {}) {
  const state = engine.getCurrentState(), before = clone(engine.getContext());
  assert.equal((await engine.handleSignal(name, payload(updates, extra))).transitioned, false, name);
  assert.equal(engine.getCurrentState(), state);
  assert.deepEqual(engine.getContext(), before, 'rejection preserves live context');
}

const intakeRecord = () => ({
  app_task: 'Classify support tickets and draft replies', users: 'Support agents', model_under_test: 'model-under-test-fixture',
  baseline_prompt_ref: null, labeled_data: { available: true, count: 50 },
  constraints: { latency_ms: 2000, budget_usd: 20 }, risk_areas: ['customer private data']
});
const item = (id, dimension, extra = {}) => ({
  id, dimension, metric: id + ' metric', threshold: 0.9, comparator: '>=', population: 'held-out fixture cases',
  target_source: 'baseline', source_ref: 'fixture:' + id, fuzzy_terms: [], definitions: [], ...extra
});
const criteriaRecord = (revision = 1, llm = true) => ({
  revision,
  items: [
    item('accuracy', 'task_fidelity'),
    ...(llm ? [item('tone', 'tone_style', { threshold: 4, target_source: 'expert', fuzzy_terms: ['empathetic'],
      definitions: [{ term: 'empathetic', meaning: 'acknowledges the stated problem before offering a fix' }] })] : []),
    item('latency', 'latency', { threshold: 2000, comparator: '<=' })
  ]
});
const edges = () => [
  { class: 'missing_or_irrelevant_input', applicable: true, example_count: 2 },
  { class: 'overlong_input', applicable: true, example_count: 2 },
  { class: 'poor_or_harmful_user_input', applicable: true, example_count: 2 },
  { class: 'ambiguous_cases', applicable: true, example_count: 2 }
];
const designRecord = (revision = 1, criteriaRevision = 1, llm = true) => ({
  revision, criteria_revision: criteriaRevision,
  methods: [
    { criterion_id: 'accuracy', method: 'exact_match', grading: 'code', rationale: 'Categorical labels' },
    ...(llm ? [{ criterion_id: 'tone', method: 'llm_likert', grading: 'llm', rationale: 'Subjective tone' }] : []),
    { criterion_id: 'latency', method: 'operational', grading: 'code', rationale: 'Measured time' }
  ],
  cases: { total_target: 100, seed_count: 20, held_out_fraction: 0.2, expansion_plan: 'Model expansion from seeds with review of a sample', distribution_basis: 'Sampled from last quarter tickets' },
  edge_cases: edges()
});
const llmGrader = (extra = {}) => ({ rubric: 'Score 5 only when the reply names the problem first', rubric_is_golden_answer: false,
  output_format: 'integer 1 to 5 inside result tags', reasoning_enabled: true, grader_model: 'grader-model-fixture',
  malformed_output_policy: 'count_as_grader_error', ...extra });
const gradingRecord = (revision = 1, criteriaRevision = 1, designRevision = 1, llm = true) => ({
  revision, criteria_revision: criteriaRevision, eval_design_revision: designRevision,
  graders: [
    { criterion_id: 'accuracy', kind: 'code' },
    ...(llm ? [{ criterion_id: 'tone', kind: 'llm', llm: llmGrader() }] : []),
    { criterion_id: 'latency', kind: 'code' }
  ],
  validation: llm ? { labeled_set_size: 20, min_agreement: 0.85, method: 'Compare grader scores with human ratings', rationale: 'Twenty examples spread across the scale' } : null
});
const revisions = (c = 1, e = 1, g = 1) => ({ criteria: c, eval_design: e, grading: g });
const approval = (exit, rev = revisions()) => ({ approved: true, exit, revisions: rev, owner: 'Fixture user', source: 'fixture:explicit-approval' });
const modelIds = llm => ({ under_test: 'model-under-test-fixture', graders: llm ? ['grader-model-fixture'] : [], verified_on: '2026-01-01', verification_source: 'fixture:model-list' });
const harnessRecord = (llm = true, rev = revisions()) => ({
  language: 'python', output_dir: '/tmp/evals/harness', files: ['run.py'], revisions: rev,
  deterministic_tests: { command: 'pytest -q', exit_code: 0, passed: 3, failed: 0, evidence_refs: ['fixture:tests'] },
  ...(llm ? { model_ids: modelIds(true) } : {})
});
const runApprovalRecord = (llm = true, rev = revisions()) => ({
  approved: true, estimate: { cases: 100, grader_calls_per_case: llm ? 1 : 0, repeats: 1, total_calls: llm ? 200 : 100, cost_usd: 1.5 },
  max_cost_usd: 3, api_key_env: 'FIXTURE_API_KEY', model_ids: modelIds(llm), revisions: rev, owner: 'Fixture user', source: 'fixture:explicit-approval'
});
const calibrationRecord = (extra = {}) => ({ kind: 'observed', grading_revision: 1, labeled_set_size: 20, agreement_count: 18, agreement: 0.9,
  min_agreement: 0.85, grader_error_count: 0, passed: true, evidence_refs: ['fixture:calibration'], ...extra });
const resultRow = (id, value, threshold, comparator, passed) => ({ criterion_id: id, value, threshold, comparator, passed, n: 100, grader_error_count: 0, evidence_refs: ['fixture:' + id] });
const resultsRecord = (llm = true, total = llm ? 200 : 100) => ({ kind: 'observed', total_calls_made: total, cost_usd: 1.2, criteria: [
  resultRow('accuracy', 0.92, 0.9, '>=', true), ...(llm ? [resultRow('tone', 3.5, 4, '>=', false)] : []), resultRow('latency', 1800, 2000, '<=', true)] });
const reportRecord = (outcome, claims = false, evidence = []) => ({ outcome, summary: 'Synthetic workflow acceptance only', claims_measured: claims,
  evidence_refs: evidence, limitations: ['Synthetic fixtures, no claim about a real application'] });

async function boot(engine) {
  await signal(engine, 'RUNTIME_READY', { selected_runtime: { compatible: true, runtime_version: '0.16.0', parent_dispatch_verified: true,
    capabilities: ['runtime.bootloader', 'runtime.transport_handshake', 'runtime.accepted_update_replay'] } }, 'ACTIVE.INTAKE', { compatible: true });
}
async function design(engine, llm = true, rev = { c: 1, e: 1, g: 1 }) {
  await signal(engine, 'CRITERIA_READY', { criteria: criteriaRecord(rev.c, llm) }, 'ACTIVE.EVAL_DESIGN');
  await signal(engine, 'EVAL_DESIGN_READY', { eval_design: designRecord(rev.e, rev.c, llm) }, 'ACTIVE.GRADING');
  await signal(engine, 'GRADING_READY', { grading: gradingRecord(rev.g, rev.c, rev.e, llm) }, 'ACTIVE.APPROVE_PLAN');
}
async function toPlan(engine, llm = true) {
  await boot(engine);
  await signal(engine, 'INTAKE_READY', { intake: intakeRecord() }, 'ACTIVE.CRITERIA');
  await design(engine, llm);
}
async function toRunApproval(engine, llm = true) {
  await toPlan(engine, llm);
  await signal(engine, 'PLAN_APPROVED_BUILD', { plan_approval: approval('build_harness') }, 'ACTIVE.HARNESS', { approved: true });
  await signal(engine, 'HARNESS_READY', { harness: harnessRecord(llm) }, 'ACTIVE.APPROVE_RUN');
}
async function toCalibrate(engine, llm = true) {
  await toRunApproval(engine, llm);
  await signal(engine, 'RUN_APPROVED', { run_approval: runApprovalRecord(llm) }, 'ACTIVE.RUN.CALIBRATE', { approved: true });
}

test('plan only path completes with no measured claims', async t => {
  const { engine, workspaceDir } = await fixture(t);
  await reject(engine, 'INTAKE_READY', { intake: intakeRecord() });
  await toPlan(engine);
  // Skipping ahead from the plan gate is refused: no approval, harness, or run exists yet.
  await reject(engine, 'HARNESS_READY', { harness: harnessRecord() });
  await reject(engine, 'RUN_APPROVED', { run_approval: runApprovalRecord() }, { approved: true });
  await reject(engine, 'CALIBRATION_PASSED', { calibration: calibrationRecord() });
  await reject(engine, 'REPORT_READY', { report: reportRecord('plan_only') });
  await reject(engine, 'PLAN_APPROVED_FINAL', { plan_approval: approval('build_harness') }, { approved: true });
  await reject(engine, 'PLAN_APPROVED_FINAL', { plan_approval: approval('plan_only') });
  await signal(engine, 'PLAN_APPROVED_FINAL', { plan_approval: approval('plan_only') }, 'ACTIVE.FINALIZE', { approved: true });
  await reject(engine, 'REPORT_READY', { report: reportRecord('plan_only', true, ['fixture:x']) });
  await signal(engine, 'REPORT_READY', { report: reportRecord('plan_only') }, 'COMPLETE');
  assert.equal(engine.getContext().harness, null);
  const dir = path.join(workspaceDir, '.docs', 'llm-eval-design', 'jobs', 'synthetic-acceptance');
  const inventory = JSON.parse(fs.readFileSync(path.join(dir, 'inventory.json'), 'utf8'));
  assert.equal(inventory.state, 'COMPLETE'); assert.equal(inventory.plan_exit, 'plan_only'); assert.equal(inventory.criteria_revision, 1);
  const plan = JSON.parse(fs.readFileSync(path.join(dir, 'plan.json'), 'utf8'));
  assert.equal(plan.approval.exit, 'plan_only'); assert.equal(plan.criteria.items.length, 3);
  const report = fs.readFileSync(path.join(dir, 'report.md'), 'utf8');
  assert.match(report, /Outcome: plan_only/); assert.match(report, /Measured claims: false/);
});

test('harness and scored run path with LLM grader reports per criterion', async t => {
  const { engine } = await fixture(t);
  await toCalibrate(engine);
  await reject(engine, 'SCORING_COMPLETE', { results: resultsRecord() });
  await signal(engine, 'CALIBRATION_PASSED', { calibration: calibrationRecord() }, 'ACTIVE.RUN.SCORE');
  await signal(engine, 'SCORING_COMPLETE', { results: resultsRecord() }, 'ACTIVE.FINALIZE');
  await reject(engine, 'REPORT_READY', { report: reportRecord('run_scored', false, ['fixture:r']) });
  await signal(engine, 'REPORT_READY', { report: reportRecord('run_scored', true, ['fixture:r']) }, 'COMPLETE');
  assert.equal(engine.getContext().results.criteria.length, 3);
});

test('code-only grading needs no LLM validation and calibrates as not required', async t => {
  const { engine } = await fixture(t);
  await toCalibrate(engine, false);
  await reject(engine, 'CALIBRATION_PASSED', { calibration: calibrationRecord() });
  await signal(engine, 'CALIBRATION_PASSED', { calibration: { kind: 'not_required', grading_revision: 1, passed: true, reason: 'No LLM graders in plan', evidence_refs: ['fixture:plan'] } }, 'ACTIVE.RUN.SCORE');
  await signal(engine, 'SCORING_COMPLETE', { results: resultsRecord(false) }, 'ACTIVE.FINALIZE');
});

test('failed calibration returns to grading and forces a new approval and harness', async t => {
  const { engine } = await fixture(t);
  await toCalibrate(engine);
  const failed = calibrationRecord({ agreement_count: 10, agreement: 0.5, passed: false });
  await reject(engine, 'CALIBRATION_FAILED', { calibration: failed }, { reason: 'x' });
  await signal(engine, 'CALIBRATION_FAILED', { calibration: failed, plan_approval: null, harness: null, run_approval: null }, 'ACTIVE.GRADING', { reason: 'Agreement below target' });
  await reject(engine, 'GRADING_READY', { grading: gradingRecord(1) });
  await signal(engine, 'GRADING_READY', { grading: gradingRecord(2) }, 'ACTIVE.APPROVE_PLAN');
  await reject(engine, 'PLAN_APPROVED_BUILD', { plan_approval: approval('build_harness', revisions(1, 1, 1)) }, { approved: true });
  await signal(engine, 'PLAN_APPROVED_BUILD', { plan_approval: approval('build_harness', revisions(1, 1, 2)) }, 'ACTIVE.HARNESS', { approved: true });
});

test('revise plan restarts at criteria and every artifact advances its revision', async t => {
  const { engine } = await fixture(t);
  await toPlan(engine);
  await reject(engine, 'REVISE_PLAN', { plan_approval: null });
  await signal(engine, 'REVISE_PLAN', { plan_approval: null }, 'ACTIVE.CRITERIA', { reason: 'Tone threshold too strict' });
  await reject(engine, 'CRITERIA_READY', { criteria: criteriaRecord(1) });
  await design(engine, true, { c: 2, e: 2, g: 2 });
  await signal(engine, 'PLAN_APPROVED_FINAL', { plan_approval: approval('plan_only', revisions(2, 2, 2)) }, 'ACTIVE.FINALIZE', { approved: true });
});

test('declined run reaches a report without measured claims', async t => {
  const { engine } = await fixture(t);
  await toRunApproval(engine);
  await reject(engine, 'RUN_DECLINED', { run_approval: { approved: true, owner: 'Fixture user', source: 'fixture:explicit-approval' } });
  await signal(engine, 'RUN_DECLINED', { run_approval: { approved: false, owner: 'Fixture user', source: 'fixture:explicit-decline' } }, 'ACTIVE.FINALIZE');
  await signal(engine, 'REPORT_READY', { report: reportRecord('run_declined') }, 'COMPLETE');
});

test('cancellation and dependency failure reach finalize from any child', async t => {
  for (const blocked of [false, true]) {
    const { engine } = await fixture(t);
    await toCalibrate(engine);
    await reject(engine, blocked ? 'DEPENDENCY_FAILED' : 'CANCEL', { stop: { kind: blocked ? 'cancelled' : 'blocked', reason: 'wrong kind' } });
    await signal(engine, blocked ? 'DEPENDENCY_FAILED' : 'CANCEL', { stop: { kind: blocked ? 'blocked' : 'cancelled', reason: 'fixture' } }, 'ACTIVE.FINALIZE');
    await reject(engine, 'CANCEL', { stop: { kind: 'cancelled', reason: 'again' } });
    await reject(engine, blocked ? 'REPORT_READY' : 'REPORT_BLOCKED', { report: reportRecord(blocked ? 'blocked' : 'cancelled') });
    await signal(engine, blocked ? 'REPORT_BLOCKED' : 'REPORT_READY', { report: reportRecord(blocked ? 'blocked' : 'cancelled') }, blocked ? 'BLOCKED' : 'COMPLETE');
  }
});

test('unsupported runtime stops at setup', async t => {
  const { engine, workspaceDir } = await fixture(t);
  await reject(engine, 'RUNTIME_READY', { selected_runtime: { compatible: true, runtime_version: '0.15.0', parent_dispatch_verified: true, capabilities: [] } }, { compatible: true });
  await reject(engine, 'SETUP_REQUIRED', {}, { compatible: true, reason: 'Compatible runtime needs no setup' });
  await signal(engine, 'SETUP_REQUIRED', {}, 'BYPASS_DETECTED', { compatible: false, reason: 'Fixture unsupported runtime' });
  const early = JSON.parse(fs.readFileSync(path.join(workspaceDir, '.docs', 'llm-eval-design', 'jobs', 'synthetic-acceptance', 'inventory.json'), 'utf8'));
  assert.equal(early.state, 'BYPASS_DETECTED'); assert.equal(early.plan_exit, null);
});

test('design records that break an invariant are refused', async t => {
  const { engine } = await fixture(t);
  await boot(engine);
  const emptyLabels = intakeRecord(); emptyLabels.labeled_data = { available: true, count: 0 };
  await reject(engine, 'INTAKE_READY', { intake: emptyLabels });
  await signal(engine, 'INTAKE_READY', { intake: intakeRecord() }, 'ACTIVE.CRITERIA');
  const privacyNoNegatives = criteriaRecord(1); privacyNoNegatives.items.push(item('privacy', 'privacy'));
  await reject(engine, 'CRITERIA_READY', { criteria: privacyNoNegatives });
  const undefinedTerm = criteriaRecord(1); undefinedTerm.items[0].fuzzy_terms = ['egregious'];
  await reject(engine, 'CRITERIA_READY', { criteria: undefinedTerm });
  const noThreshold = criteriaRecord(1); noThreshold.items[0].threshold = 'high';
  await reject(engine, 'CRITERIA_READY', { criteria: noThreshold });
  await signal(engine, 'CRITERIA_READY', { criteria: criteriaRecord(1) }, 'ACTIVE.EVAL_DESIGN');
  const missingEdge = designRecord(); missingEdge.edge_cases.pop();
  await reject(engine, 'EVAL_DESIGN_READY', { eval_design: missingEdge });
  const heldOutAll = designRecord(); heldOutAll.cases.held_out_fraction = 0.9;
  await reject(engine, 'EVAL_DESIGN_READY', { eval_design: heldOutAll });
  const wrongKind = designRecord(); wrongKind.methods[0].grading = 'llm';
  await reject(engine, 'EVAL_DESIGN_READY', { eval_design: wrongKind });
  const optional = designRecord(); optional.edge_cases[3] = { class: 'ambiguous_cases', applicable: false, not_applicable_reason: 'skip' };
  await reject(engine, 'EVAL_DESIGN_READY', { eval_design: optional });
  await signal(engine, 'EVAL_DESIGN_READY', { eval_design: designRecord() }, 'ACTIVE.GRADING');
  for (const mutate of [
    g => { g.graders[1].llm.grader_model = 'model-under-test-fixture'; },
    g => { g.graders[1].llm.rubric_is_golden_answer = true; },
    g => { g.graders[1].llm.reasoning_enabled = false; },
    g => { g.graders[1].llm.malformed_output_policy = 'crash'; },
    g => { g.validation = null; },
    g => { g.validation.min_agreement = 0; }
  ]) { const g = gradingRecord(); mutate(g); await reject(engine, 'GRADING_READY', { grading: g }); }
});

test('credential-like values and unsafe paths are refused', async t => {
  const { engine } = await fixture(t);
  await toPlan(engine);
  await signal(engine, 'PLAN_APPROVED_BUILD', { plan_approval: approval('build_harness') }, 'ACTIVE.HARNESS', { approved: true });
  const leaked = harnessRecord(); leaked.note = 'api_key: sk-ant-abcdefghijklmnopqrstuvwxyz0123';
  await reject(engine, 'HARNESS_READY', { harness: leaked });
  for (const dir of ['relative/dir', '/tmp/../etc', '/work/skills/llm-eval-design/out']) {
    const h = harnessRecord(); h.output_dir = dir; await reject(engine, 'HARNESS_READY', { harness: h });
  }
  const failing = harnessRecord(); failing.deterministic_tests.failed = 1;
  await reject(engine, 'HARNESS_READY', { harness: failing });
  const sameModel = harnessRecord(); sameModel.model_ids.graders = ['model-under-test-fixture'];
  await reject(engine, 'HARNESS_READY', { harness: sameModel });
  const sharedModel = harnessRecord(); sharedModel.model_ids.graders = ['grader-model-fixture', 'model-under-test-fixture'];
  await reject(engine, 'HARNESS_READY', { harness: sharedModel });
  await signal(engine, 'HARNESS_READY', { harness: harnessRecord() }, 'ACTIVE.APPROVE_RUN');
  for (const mutate of [
    r => { r.api_key_env = 'sk-ant-abcdefghijklmnopqrstuvwxyz0123'; },
    r => { r.api_key_env = 'lower_case'; },
    r => { r.estimate.total_calls = 150; },
    r => { r.estimate.grader_calls_per_case = 0; r.estimate.total_calls = 100; },
    r => { r.max_cost_usd = 1; },
    r => { r.revisions = revisions(1, 1, 9); }
  ]) { const r = runApprovalRecord(); mutate(r); await reject(engine, 'RUN_APPROVED', { run_approval: r }, { approved: true }); }
});

test('calibration and results must be computed, not asserted', async t => {
  const { engine } = await fixture(t);
  await toCalibrate(engine);
  await reject(engine, 'CALIBRATION_PASSED', { calibration: calibrationRecord({ agreement: 0.99 }) });
  await reject(engine, 'CALIBRATION_PASSED', { calibration: calibrationRecord({ agreement_count: 10, agreement: 0.5, passed: true }) });
  await reject(engine, 'CALIBRATION_PASSED', { calibration: calibrationRecord({ labeled_set_size: 10, agreement_count: 9, agreement: 0.9 }) });
  await signal(engine, 'CALIBRATION_PASSED', { calibration: calibrationRecord() }, 'ACTIVE.RUN.SCORE');
  const flipped = resultsRecord(); flipped.criteria[1].passed = true;
  await reject(engine, 'SCORING_COMPLETE', { results: flipped });
  const missing = resultsRecord(); missing.criteria.pop();
  await reject(engine, 'SCORING_COMPLETE', { results: missing });
  await reject(engine, 'SCORING_COMPLETE', { results: resultsRecord(true, 201) });
  const overCost = resultsRecord(); overCost.cost_usd = 9;
  await reject(engine, 'SCORING_COMPLETE', { results: overCost });
  await signal(engine, 'SCORING_COMPLETE', { results: resultsRecord() }, 'ACTIVE.FINALIZE');
});

test('manifest, state prompts, wrappers, and Mermaid topology match', async () => {
  const { FSMEngine } = await runtime(); assert.ok(FSMEngine);
  const yaml = axiRequire()('js-yaml');
  const m = yaml.load(fs.readFileSync(path.join(skillDir, 'skill.yaml'), 'utf8'));
  const release = JSON.parse(fs.readFileSync(path.join(skillDir, 'skill-release.json'), 'utf8'));
  assert.equal(release.version, m.version); assert.equal(release.reactiveSchemaVersion, m.schema_version);
  const diagram = fs.readFileSync(path.join(skillDir, 'STATECHART.md'), 'utf8');
  const declared = new Set(), arrows = [];
  function inspect(states, prefix = '') {
    for (const [name, s] of Object.entries(states)) {
      const full = prefix + name;
      declared.add(s.prompt_template);
      assert.ok(fs.existsSync(path.join(skillDir, s.prompt_template)), s.prompt_template);
      if (!s.substates) assert.ok(diagram.includes('state "' + full + '" as ' + full.replaceAll('.', '_')), full);
      for (const [sig, tr] of Object.entries(s.transitions || {})) {
        assert.ok(fs.existsSync(path.join(skillDir, tr.guardFunction)), tr.guardFunction);
        assert.ok(fs.readFileSync(path.join(skillDir, tr.guardFunction), 'utf8').includes("'" + sig + "'"), tr.guardFunction + ' wraps ' + sig);
        arrows.push(full.replaceAll('.', '_') + ' --> ' + tr.target.replaceAll('.', '_') + ' : ' + sig);
        assert.ok([...coverage.values()].includes(sig), sig + ' has a passing and a rejecting scenario');
      }
      if (s.substates) { assert.ok(diagram.includes('state ' + full.replaceAll('.', '_') + ' {')); inspect(s.substates, full + '.'); }
    }
  }
  inspect(m.states);
  const actual = diagram.split('\n').filter(line => line.includes(' --> ') && !line.includes('[*]')).map(line => line.trim());
  assert.deepEqual(actual.sort(), arrows.sort());
  const files = [];
  (function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else files.push(path.relative(skillDir, p).replaceAll('\\', '/')); } })(path.join(skillDir, 'states'));
  assert.deepEqual(files.sort(), [...declared].sort());
  assert.deepEqual(m.context_keys, []);
  for (const file of ['guards/policy.cjs', ...files]) {
    const body = fs.readFileSync(path.join(skillDir, file), 'utf8');
    assert.ok(!body.includes(String.fromCharCode(0x2014)), file + ' has no em dash');
  }
});
