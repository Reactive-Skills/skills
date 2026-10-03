#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const canonical = value => Array.isArray(value) ? value.map(canonical)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const objectDigest = value => sha256(JSON.stringify(canonical(value)));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const arms = ['no-skill', 'with-skill'];
const statuses = ['PASS', 'FAIL', 'NOT_RUN', 'NOT_APPLICABLE'];

function contained(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function resolveInside(root, relative) {
  if (!nonempty(relative) || path.isAbsolute(relative) || /^[A-Za-z]:/.test(relative) || relative.includes('\\')) {
    throw new Error(`Invalid relative path: ${relative}`);
  }
  const canonicalRoot = fs.realpathSync(root);
  const target = path.resolve(canonicalRoot, relative);
  if (!contained(canonicalRoot, target) || !contained(canonicalRoot, fs.realpathSync(target))) {
    throw new Error(`Path escapes root: ${relative}`);
  }
  return target;
}

function collectFiles(root, starts) {
  const canonicalRoot = fs.realpathSync(root);
  const files = [];
  function walk(relative, ancestors = new Set()) {
    const absolute = resolveInside(canonicalRoot, relative);
    const real = fs.realpathSync(absolute);
    const stat = fs.statSync(absolute);
    if (stat.isDirectory()) {
      if (ancestors.has(real)) throw new Error(`Directory link cycle: ${relative}`);
      const next = new Set([...ancestors, real]);
      for (const name of fs.readdirSync(absolute).sort()) {
        if (!['node_modules', '.git', '.reactive', '.docs'].includes(name)) walk(`${relative}/${name}`, next);
      }
    } else if (stat.isFile()) files.push(relative);
    else throw new Error(`Unsupported file type: ${relative}`);
  }
  for (const relative of starts) if (fs.existsSync(path.join(canonicalRoot, relative))) walk(relative);
  return files.sort();
}

function digestFiles(root, files) {
  const hash = crypto.createHash('sha256');
  for (const relative of files) hash.update(relative).update('\0').update(fs.readFileSync(resolveInside(root, relative))).update('\0');
  return { schema_version: 1, algorithm: 'SHA-256', digest: hash.digest('hex'), file_count: files.length, files };
}

function computeSkillDigest(skillRoot) {
  return digestFiles(skillRoot, collectFiles(skillRoot, [
    'skill.yaml', 'skill.yml', 'SKILL.md', 'README.md', 'CONTEXT.md', 'STATECHART.md',
    'states', 'guards', 'templates', 'scripts', 'references', 'assets',
  ]));
}

function computeFixtureDigest(fixtureRoot) {
  return digestFiles(fixtureRoot, collectFiles(fixtureRoot, fs.readdirSync(fixtureRoot))).digest;
}

function taskTemplate(spec, scenario) {
  return `${spec.shared_instructions}\n\n${scenario.input}\n\nApproval decisions:\n${spec.approval_script}\n\n${scenario.approval_boundary}`;
}

function resolveTask(spec, scenario, arm, substitutions) {
  let text = `${taskTemplate(spec, scenario)}\n\n${spec.arm_instructions[arm]}\n\n${scenario.action}`;
  for (const key of ['WORKSPACE', 'MANAGER', 'RUNTIME']) {
    const replacement = substitutions?.[key];
    if (!nonempty(replacement) || /[\r\n]/.test(replacement)) throw new Error(`Missing or invalid substitution: ${key}`);
    text = text.split(`{{${key}}}`).join(replacement);
  }
  return text;
}

function validateSpec(spec, root) {
  const errors = [];
  const check = (test, message) => { if (!test) errors.push(message); };
  check(spec.schema_version === 1, 'Unsupported specification version');
  check(Number.isInteger(spec.repetitions) && spec.repetitions >= 3, 'At least three repetitions required');
  check(spec.coverage?.status === 'SELECTED', 'Coverage selection required');
  check(Array.isArray(spec.coverage?.profiles) && spec.coverage.profiles.length > 0, 'At least one selected profile required');
  const profiles = new Set();
  for (const profile of spec.coverage?.profiles || []) {
    check(nonempty(profile.id) && !profiles.has(profile.id), 'Duplicate or missing profile ID');
    profiles.add(profile.id);
    for (const field of ['model', 'reasoning_effort', 'harness', 'platform']) check(nonempty(profile[field]), `Profile ${field} required`);
  }
  for (const field of ['shared_instructions', 'approval_script']) check(nonempty(spec[field]), `${field} required`);
  check(Array.isArray(spec.approval_decisions) && spec.approval_decisions.length > 0 && spec.approval_decisions.every(nonempty), 'Fixed approval decisions required');
  for (const arm of arms) check(nonempty(spec.arm_instructions?.[arm]), `Instructions for ${arm} required`);
  check(Array.isArray(spec.scenarios) && spec.scenarios.length >= 4, 'Four scenarios required');
  const scenarios = new Set();
  for (const scenario of spec.scenarios || []) {
    check(nonempty(scenario.id) && !scenarios.has(scenario.id), 'Duplicate or missing scenario ID');
    scenarios.add(scenario.id);
    for (const field of ['input', 'action', 'approval_boundary', 'fixture_path']) check(nonempty(scenario[field]), `${scenario.id}: ${field} required`);
    try { computeFixtureDigest(resolveInside(root, scenario.fixture_path)); } catch (error) { errors.push(`${scenario.id}: ${error.message}`); }
    const ids = new Set();
    check(Array.isArray(scenario.assertions) && scenario.assertions.some(a => a.critical && !a.runtime_only), `${scenario.id}: critical shared assertions required`);
    for (const assertion of scenario.assertions || []) {
      check(nonempty(assertion.id) && !ids.has(assertion.id), `${scenario.id}: duplicate or missing assertion ID`);
      ids.add(assertion.id);
      check(typeof assertion.critical === 'boolean' && typeof assertion.runtime_only === 'boolean' && nonempty(assertion.check), `${scenario.id}: invalid assertion contract`);
    }
  }
  return errors;
}

function validateRecords(spec, records, root) {
  const errors = [];
  const keys = new Set();
  const ids = new Set();
  const bundleCache = new Map();
  const checkpointBundles = new Map();
  const checkpointEnvironments = new Map();
  for (const record of records) {
    const label = record.id || '<unnamed>';
    const check = (test, message) => { if (!test) errors.push(`${label}: ${message}`); };
    const profile = spec.coverage.profiles.find(p => p.id === record.profile_id);
    const scenario = spec.scenarios.find(s => s.id === record.scenario_id);
    check(record.schema_version === 1, 'Unsupported result version');
    check(nonempty(record.id) && !ids.has(record.id), 'Duplicate or missing record ID');
    ids.add(record.id);
    check(nonempty(record.checkpoint), 'Checkpoint required');
    check(Boolean(profile), 'Unknown profile');
    check(Boolean(scenario), 'Unknown scenario');
    check(arms.includes(record.arm), 'Unknown arm');
    check(Number.isInteger(record.repetition) && record.repetition >= 1 && record.repetition <= spec.repetitions, 'Invalid repetition');
    const key = [record.checkpoint, record.profile_id, record.scenario_id, record.arm, record.repetition].join('/');
    check(!keys.has(key), `Duplicate trial ${key}`);
    keys.add(key);
    check(['PASS', 'FAIL', 'NOT_RUN'].includes(record.status), 'Invalid trial status');
    check(nonempty(record.timestamp) && Number.isFinite(Date.parse(record.timestamp)), 'Timestamp required');
    check(record.spec_digest === objectDigest(spec), 'Specification digest mismatch');
    if (!profile || !scenario || !arms.includes(record.arm)) continue;
    check(record.task_template_digest === sha256(taskTemplate(spec, scenario)), 'Task template digest mismatch');
    try {
      check(record.fixture_digest === computeFixtureDigest(resolveInside(root, scenario.fixture_path)), 'Fixture digest mismatch');
    } catch (error) { errors.push(`${label}: ${error.message}`); }
    check(Array.isArray(record.assertions), 'Assertion outcomes required');
    const assertions = record.assertions || [];
    check(assertions.length === scenario.assertions.length && new Set(assertions.map(a => a.id)).size === assertions.length, 'Missing or duplicate assertion outcomes');
    for (const expected of scenario.assertions) {
      const actual = assertions.find(a => a.id === expected.id);
      check(Boolean(actual) && statuses.includes(actual.status), `Invalid outcome for ${expected.id}`);
      if (!actual) continue;
      if (expected.runtime_only && record.arm === 'no-skill') {
        check(actual.status === 'NOT_APPLICABLE' && nonempty(actual.reason), `${expected.id}: control runtime assertion must be NOT_APPLICABLE`);
      } else {
        check(actual.status !== 'NOT_APPLICABLE', `${expected.id}: shared/with-skill assertion cannot be skipped`);
        check(record.status === 'NOT_RUN' ? actual.status === 'NOT_RUN' : ['PASS', 'FAIL'].includes(actual.status), `${expected.id}: incomplete trial cannot count as completed`);
      }
      if (actual.status !== 'PASS') check(nonempty(actual.reason), `${expected.id}: reason required`);
    }
    check(assertions.every(a => scenario.assertions.some(e => e.id === a.id)), 'Unknown assertion');
    if (record.status === 'NOT_RUN') {
      check(nonempty(record.reason), 'NOT_RUN reason required');
      check(record.tokens === null, 'Unrun trial cannot claim token usage');
      continue;
    }
    check(record.status === (assertions.some(a => a.status === 'FAIL') ? 'FAIL' : 'PASS'), 'Trial status disagrees with assertions');
    for (const field of ['model', 'reasoning_effort', 'harness', 'platform']) check(record.executor?.[field] === profile[field], `Executor ${field} differs from selected profile`);
    check(nonempty(record.executor?.version), 'Actual harness version required');
    check(nonempty(record.runtime?.version) && nonempty(record.runtime?.identity), 'Runtime version and build identity required');
    check(nonempty(record.skill?.version) && validHash(record.skill?.digest), 'Skill release and bundle digest required');
    check(validHash(record.resolved_task_digest), 'Resolved task digest required');
    check(record.tokens === null || (record.tokens && record.tokens.measurement === 'host' && Number.isInteger(record.tokens.input) && record.tokens.input >= 0 && Number.isInteger(record.tokens.output) && record.tokens.output >= 0 && nonempty(record.tokens.source)), 'Token counts require actual host measurement and source');
    check(record.judgment?.status === 'NOT_APPLICABLE' ? nonempty(record.judgment.reason)
      : record.judgment?.status === 'MEASURED' && nonempty(record.judgment.adapter) && nonempty(record.judgment.model), 'Actual judgment adapter/model or explicit NOT_APPLICABLE required');
    check(Array.isArray(record.tools) && record.tools.length > 0 && record.tools.every(t => nonempty(t.name) && nonempty(t.version) && typeof t.available === 'boolean'), 'Tool availability and versions required');
    check(JSON.stringify(record.approval_decisions) === JSON.stringify(spec.approval_decisions), 'Approval decisions differ from fixed script');
    const environmentKey = `${record.checkpoint}/${record.profile_id}`;
    const environmentDigest = objectDigest({ executor: record.executor, tools: record.tools, runtime: record.runtime });
    const priorEnvironment = checkpointEnvironments.get(environmentKey);
    check(!priorEnvironment || priorEnvironment === environmentDigest, 'Checkpoint arms/repetitions use different tools or execution environments');
    checkpointEnvironments.set(environmentKey, environmentDigest);
    try {
      const bundle = resolveInside(root, record.skill.bundle_path);
      if (!bundleCache.has(bundle)) bundleCache.set(bundle, computeSkillDigest(bundle).digest);
      check(record.skill.digest === bundleCache.get(bundle), 'Frozen skill bundle digest mismatch');
      const manifest = ['skill.yaml', 'skill.yml'].find(file => fs.existsSync(path.join(bundle, file)));
      const version = manifest && fs.readFileSync(path.join(bundle, manifest), 'utf8').match(/^version:\s*["']?([^\s"']+)/m)?.[1];
      check(record.skill.version === version, 'Frozen skill release mismatch');
      const priorBundle = checkpointBundles.get(record.checkpoint);
      check(!priorBundle || priorBundle === record.skill.digest, 'Checkpoint mixes skill bundles');
      checkpointBundles.set(record.checkpoint, record.skill.digest);
      const evidenceFile = resolveInside(root, record.evidence.path);
      check(record.evidence.path.startsWith('results/evidence/'), 'Evidence must be under results/evidence');
      const evidenceBytes = fs.readFileSync(evidenceFile);
      check(record.evidence.digest === sha256(evidenceBytes), 'Evidence digest mismatch');
      const evidence = JSON.parse(evidenceBytes);
      check(evidence.record_id === record.id, 'Evidence belongs to another trial');
      check(objectDigest(evidence.executor) === objectDigest(record.executor), 'Executor evidence mismatch');
      check(nonempty(evidence.executor_metadata_source), 'Actual host metadata source required');
      if (record.tokens !== null) check(objectDigest(evidence.tokens) === objectDigest(record.tokens), 'Host token evidence mismatch');
      check(evidence.isolation?.verified === true && nonempty(evidence.isolation.method), 'Verified isolation evidence required');
      const resolved = resolveTask(spec, scenario, record.arm, evidence.substitutions);
      check(evidence.resolved_task === resolved && record.resolved_task_digest === sha256(resolved), 'Resolved task differs from approved template/substitutions');
      for (const assertion of assertions.filter(a => ['PASS', 'FAIL'].includes(a.status))) {
        const observation = evidence.observations?.find(o => o.assertion_id === assertion.id);
        check(observation?.status === assertion.status && nonempty(observation?.detail), `Missing observable evidence for ${assertion.id}`);
      }
    } catch (error) { errors.push(`${label}: ${error.message}`); }
  }
  return errors;
}

function coverage(spec, records, checkpoint) {
  const missing = [];
  const selected = records.filter(r => r.checkpoint === checkpoint);
  for (const profile of spec.coverage.profiles) for (const scenario of spec.scenarios) for (const arm of arms) {
    for (let repetition = 1; repetition <= spec.repetitions; repetition++) {
      const record = selected.find(r => r.profile_id === profile.id && r.scenario_id === scenario.id && r.arm === arm && r.repetition === repetition);
      if (!record || record.status === 'NOT_RUN') missing.push({ profile: profile.id, scenario: scenario.id, arm, repetition, reason: record?.reason || 'Missing trial' });
    }
  }
  const criticalFailures = selected.flatMap(record => {
    const scenario = spec.scenarios.find(s => s.id === record.scenario_id);
    return record.assertions.filter(a => a.status === 'FAIL' && scenario.assertions.find(s => s.id === a.id)?.critical)
      .map(a => ({ trial: record.id, assertion: a.id, reason: a.reason }));
  });
  return { complete: missing.length === 0, missing, critical_failures: criticalFailures, completed: selected.filter(r => ['PASS', 'FAIL'].includes(r.status)).length,
    passed: selected.filter(r => r.status === 'PASS').length, failed: selected.filter(r => r.status === 'FAIL').length };
}

function evaluate({ spec, records, root, mode = 'structure', checkpoint, baseline, candidate }) {
  const errors = validateSpec(spec, root);
  if (!errors.length) errors.push(...validateRecords(spec, records, root));
  if (errors.length) return { status: 'INVALID', exit_code: 1, errors };
  if (mode === 'structure') return { status: 'PASS', exit_code: 0, records: records.length, measured_quality: false };
  if (mode === 'coverage') {
    if (!checkpoint) return { status: 'INCOMPLETE', exit_code: 2, reason: 'Checkpoint required' };
    const result = coverage(spec, records, checkpoint);
    return { status: result.complete ? 'PASS' : 'INCOMPLETE', exit_code: result.complete ? 0 : 2, ...result };
  }
  if (mode !== 'compare') return { status: 'INVALID', exit_code: 1, errors: ['Unknown mode'] };
  if (!baseline || !candidate || baseline === candidate) return { status: 'INCOMPLETE', exit_code: 2, reason: 'Distinct baseline and candidate checkpoints required' };
  const before = coverage(spec, records, baseline), after = coverage(spec, records, candidate);
  if (!before.complete || !after.complete) return { status: 'INCOMPLETE', exit_code: 2, baseline: before, candidate: after };
  const failures = [];
  for (const record of records.filter(r => r.checkpoint === candidate)) {
    const previous = records.find(r => r.checkpoint === baseline && r.profile_id === record.profile_id && r.scenario_id === record.scenario_id && r.arm === record.arm && r.repetition === record.repetition);
    for (const field of ['runtime', 'tools', 'executor']) if (objectDigest(record[field]) !== objectDigest(previous[field])) failures.push(`${record.id}: incomparable ${field}`);
    const scenario = spec.scenarios.find(s => s.id === record.scenario_id);
    for (const assertion of scenario.assertions.filter(a => a.critical && !(a.runtime_only && record.arm === 'no-skill'))) {
      if (record.assertions.find(a => a.id === assertion.id).status !== 'PASS') failures.push(`${record.id}: critical assertion ${assertion.id} failed`);
    }
  }
  for (const profile of spec.coverage.profiles) for (const arm of arms) {
    const success = checkpointName => records.filter(r => r.checkpoint === checkpointName && r.profile_id === profile.id && r.arm === arm && r.status === 'PASS').length;
    if (success(candidate) < success(baseline)) failures.push(`${profile.id}/${arm}: task success regressed`);
  }
  return { status: failures.length ? 'FAIL' : 'PASS', exit_code: failures.length ? 1 : 0, failures, baseline: before, candidate: after };
}

const requiredStateInvariants = {
  "PLANNING": [
    "objective",
    "consumed-context",
    "allowed-actions",
    "observable-exit",
    "actual-signals",
    "approved-source-boundary",
    "retained-manager-run",
    "scope-and-approval",
    "truthful-evidence",
    "operation-specific-manifest",
    "architectural-shape-and-rationale",
    "hierarchy-and-parent-handlers",
    "nested-prompt-layout",
    "canonical-bootloader-planning",
    "diagram-and-documentation-alignment",
    "skill-type-classification",
    "red-seven-answers",
    "middleware-decisions-within-scope",
    "explicit-unresolved-decisions",
    "no-task-writes",
    "plan-ready-context"
  ],
  "EXECUTING": [
    "objective",
    "consumed-context",
    "allowed-actions",
    "observable-exit",
    "actual-signals",
    "approved-source-boundary",
    "retained-manager-run",
    "scope-and-approval",
    "truthful-evidence",
    "approved-manifest-only",
    "canonical-containment",
    "manager-template-resolution",
    "one-run-one-transport",
    "supported-nested-keys",
    "recursive-directories",
    "canonical-single-bootloader",
    "schema-required-fields",
    "declared-context",
    "javascript-guards",
    "actual-signal-alignment",
    "prompt-references-and-orphans",
    "projection-template-contract",
    "diagram-and-doc-accuracy",
    "portable-checker-and-runtime-validation",
    "delete-absence",
    "red-seven-records",
    "declared-middleware",
    "state-local-independent-contract",
    "measured-provisional-budgets",
    "exit-code-and-executed"
  ],
  "VERIFYING": [
    "objective",
    "consumed-context",
    "allowed-actions",
    "observable-exit",
    "actual-signals",
    "approved-source-boundary",
    "retained-manager-run",
    "scope-and-approval",
    "truthful-evidence",
    "approved-task-outcomes",
    "canonical-target-and-isolated-checks",
    "one-manager-run",
    "checker-errors-vs-advisories",
    "schema-and-prompt-structure",
    "hierarchical-target-resolution",
    "context-vs-payload-contracts",
    "guard-static-review",
    "violating-and-satisfying-real-transitions",
    "no-unguarded-critical-actions",
    "signal-and-state-rejection-with-parent-fallback",
    "guard-evidence-and-coverage-limits",
    "bootloader-exact-single-runtime-owned",
    "measured-provisional-budgets",
    "declared-middleware-verification",
    "runtime-projection-paths-and-contents",
    "ledger-time-vs-rendered-time",
    "truthful-runtime-coverage",
    "verified-signal-and-exit-code",
    "preserved-rollback-routing"
  ]
};

function sourceMeasurement(filename) {
  const bytes = fs.readFileSync(filename);
  const text = bytes.toString('utf8').trim();
  return { method: 'raw-source-whitespace-words', words: text ? text.split(/\s+/u).length : 0, digest: sha256(bytes) };
}

function validateStateContracts(contract, { root, skillRoot, spec }) {
  const errors = [];
  const check = (test, message) => { if (!test) errors.push('State contracts: ' + message); };
  if (!contract || typeof contract !== 'object') return ['State contracts: object required'];
  check(contract.schema_version === 1, 'unsupported schema');
  check(contract.spec_digest === objectDigest(spec), 'selected evaluation digest mismatch');
  check(contract.candidate?.path === '..', 'candidate must identify the authored skill root');
  try {
    check(contract.candidate?.digest === computeSkillDigest(skillRoot).digest, 'candidate bundle digest mismatch');
  } catch (error) { errors.push('State contracts: ' + error.message); }
  let baselineRoot;
  try {
    baselineRoot = resolveInside(root, contract.baseline?.bundle_path);
    check(contract.baseline.bundle_path.startsWith('results/bundles/'), 'baseline must be a frozen bundle');
    check(nonempty(contract.baseline.checkpoint), 'baseline checkpoint required');
    check(contract.baseline.digest === computeSkillDigest(baselineRoot).digest, 'baseline bundle digest mismatch');
  } catch (error) { errors.push('State contracts: baseline ' + error.message); }
  const stateRecords = Array.isArray(contract.states) ? contract.states : [];
  check(stateRecords.every(s => s && typeof s === 'object' && !Array.isArray(s)), 'state records must be objects');
  const states = stateRecords.filter(s => s && typeof s === 'object' && !Array.isArray(s));
  check(states.length === 3 && new Set(states.map(s => s.state)).size === 3, 'exactly three unique state records required');
  for (const state of Object.keys(requiredStateInvariants)) {
    const entry = states.find(s => s.state === state);
    if (!entry) { check(false, state + ': missing state'); continue; }
    const source = 'states/' + state.toLowerCase() + '.md';
    check(entry.source === source, state + ': source path required');
    for (const [side, directory] of [['baseline', baselineRoot], ['candidate', skillRoot]]) {
      const recorded = entry[side];
      check(recorded?.source === source, state + ': ' + side + ' measurement source required');
      check(recorded?.method === 'raw-source-whitespace-words', state + ': ' + side + ' measurement method must describe raw source words');
      check(recorded?.rendered_words === null && recorded?.host_tokens === null, state + ': unmeasured rendered words and host tokens must be null');
      if (directory) try {
        const actual = sourceMeasurement(resolveInside(directory, source));
        check(recorded?.words === actual.words && Number.isInteger(recorded.words), state + ': ' + side + ' word count mismatch');
        check(recorded?.digest === actual.digest, state + ': ' + side + ' source digest mismatch');
      } catch (error) { errors.push('State contracts: ' + state + ': ' + error.message); }
    }
    const invariantRecords = Array.isArray(entry.invariants) ? entry.invariants : [];
    check(invariantRecords.every(i => i && typeof i === 'object' && !Array.isArray(i)), state + ': invariant records must be objects');
    const invariants = invariantRecords.filter(i => i && typeof i === 'object' && !Array.isArray(i));
    const required = requiredStateInvariants[state];
    check(invariants.length === required.length && new Set(invariants.map(i => i.id)).size === required.length, state + ': incomplete or duplicate invariant inventory');
    for (const id of required) {
      const invariant = invariants.find(i => i.id === id);
      check(Boolean(invariant), state + ': missing invariant ' + id);
      if (!invariant) continue;
      check(nonempty(invariant.baseline_evidence) && nonempty(invariant.candidate_evidence), state + ': invariant source evidence required for ' + id);
      check(['preserved', 'clarified', 'replaced-with-approved-contract'].includes(invariant.disposition) && nonempty(invariant.rationale), state + ': reviewed disposition required for ' + id);
    }
    check(invariants.every(i => required.includes(i.id)), state + ': unknown invariant');
    const budget = entry.budget;
    check(budget?.measurement === 'raw-source-whitespace-words', state + ': budget measurement required');
    if (budget?.status === 'provisional') {
      check(budget.max_words === null && Array.isArray(budget.evidence) && budget.evidence.length === 0, state + ': provisional budget cannot claim a hard limit or supporting evidence');
    } else if (budget?.status === 'established') {
      check(Number.isInteger(budget.max_words) && budget.max_words > 0, state + ': positive established budget required');
      check(nonempty(budget.operating_conditions) && Array.isArray(budget.evidence) && budget.evidence.length > 0, state + ': established budget requires operating conditions and evidence');
      for (const item of Array.isArray(budget.evidence) ? budget.evidence : []) try {
        check(nonempty(item.rationale), state + ': budget evidence rationale required');
        const file = resolveInside(root, item.path);
        check(item.path.startsWith('results/evidence/'), state + ': budget evidence must be retained under results/evidence');
        check(validHash(item.digest) && item.digest === sha256(fs.readFileSync(file)), state + ': budget evidence digest mismatch');
      } catch (error) { errors.push('State contracts: ' + state + ': budget ' + error.message); }
    } else check(false, state + ': explicit budget status required');
  }
  return errors;
}

function main(args) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') continue;
    if (!['--mode', '--skill-root', '--checkpoint', '--baseline', '--candidate'].includes(args[i]) || !args[i + 1]) throw new Error(`Invalid argument: ${args[i]}`);
    options[args[i].slice(2)] = args[++i];
  }
  if (options.mode === 'digest') {
    if (!options['skill-root']) return { status: 'INCOMPLETE', exit_code: 2, reason: '--skill-root required' };
    return { ...computeSkillDigest(options['skill-root']), exit_code: 0 };
  }
  const root = __dirname;
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'evals.json'), 'utf8'));
  const contract = JSON.parse(fs.readFileSync(path.join(root, 'state-contracts.json'), 'utf8'));
  const contractErrors = validateStateContracts(contract, { root, skillRoot: path.resolve(root, '..'), spec });
  if (contractErrors.length) return { status: 'INVALID', exit_code: 1, errors: contractErrors };
  const resultRoot = path.join(root, 'results');
  const records = fs.existsSync(resultRoot) ? collectFiles(resultRoot, fs.readdirSync(resultRoot))
    .filter(file => file.endsWith('.result.json')).map(file => JSON.parse(fs.readFileSync(resolveInside(resultRoot, file), 'utf8'))) : [];
  return evaluate({ ...options, spec, records, root });
}

module.exports = { computeSkillDigest, computeFixtureDigest, evaluate, objectDigest, sha256, taskTemplate, resolveTask, requiredStateInvariants, sourceMeasurement, validateStateContracts };
if (require.main === module) {
  try { const result = main(process.argv.slice(2)); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); process.exitCode = result.exit_code; }
  catch (error) { process.stdout.write(`${JSON.stringify({ status: 'INVALID', exit_code: 1, errors: [error.message] })}\n`); process.exitCode = 1; }
}
