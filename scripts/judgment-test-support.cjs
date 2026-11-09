// Offline fixtures share the same installed runtime as the catalog guard suites.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const { execSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const axiRequire = createRequire(path.join(process.env.JUDGMENT_TEST_NODE_MODULES ||
  execSync('npm root -g', { encoding: 'utf8' }).trim(), '@reactive-skills/axi/package.json'));
const entry = axiRequire.resolve('@reactive-skills/runtime');
const runtime = import(pathToFileURL(entry).href);
const yaml = axiRequire('js-yaml');
const manifest = skill => yaml.load(fs.readFileSync(path.join(root, skill, 'skill.yaml'), 'utf8'));
const bytes = value => Buffer.byteLength(JSON.stringify(value), 'utf8');
const sentinel = 'UNRELATED_PRIVATE_FIXTURE_' + 'x'.repeat(2400);

async function stubJev(t, answer) {
  const api = await runtime;
  api.JudgmentEngine.reset();
  const sdkRequire = createRequire(entry);
  const file = sdkRequire.resolve('@typesafe-ai/sdk/package.json');
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  const sdk = await import(pathToFileURL(path.join(path.dirname(file), pkg.exports['.'].import.default)).href);
  const original = sdk.TypeSafeClient.prototype.systemOne;
  const key = process.env.TYPESAFE_API_KEY;
  process.env.TYPESAFE_API_KEY = 'offline-judgment-fixture';
  const calls = [];
  sdk.TypeSafeClient.prototype.systemOne = async request => {
    assert.deepEqual(Object.keys(request).sort(), ['questions', 'state']);
    assert.deepEqual(Object.keys(request.questions), ['judgment']);
    calls.push(structuredClone(request));
    return { model: 'offline-fixture', answers: { judgment: answer(request) } };
  };
  t.after(() => {
    sdk.TypeSafeClient.prototype.systemOne = original;
    if (key === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = key;
    api.JudgmentEngine.reset();
  });
  return calls;
}

async function fixture(t, skill, state, initialContext = {}) {
  const api = await runtime;
  const workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'judgment-inputs-'));
  const skillDir = path.join(workspaceDir, skill);
  fs.cpSync(path.join(root, skill), skillDir, { recursive: true });
  const file = path.join(skillDir, 'skill.yaml');
  // Enter nested states through their real parent chain; initial_state is a root name.
  const definition = yaml.load(fs.readFileSync(file, 'utf8'));
  const segments = state.split('.');
  definition.initial_state = segments[0];
  let parent = definition.states[segments[0]];
  for (const segment of segments.slice(1)) {
    parent.initial_substate = segment;
    parent = parent.substates[segment];
  }
  fs.writeFileSync(file, yaml.dump(definition));
  let engine = new api.FSMEngine({ skillDir, workspaceDir, jobId: 'fixture', initialContext });
  t.after(() => { engine.close(); fs.rmSync(workspaceDir, { recursive: true, force: true }); });
  return { get engine() { return engine; }, reopen() {
    const jobId = engine.getJobId();
    engine.close();
    engine = new api.FSMEngine({ skillDir, workspaceDir, jobId });
    return engine;
  } };
}

async function capabilities(skill) {
  const api = await runtime;
  const actual = await api.getRuntimeCapabilities();
  const requirements = manifest(skill).runtime_requirements;
  assert.equal(requirements.min_runtime_version, '0.20.0');
  assert.equal(api.evaluateRuntimeRequirements(requirements, actual).compatible, true);
  assert.equal(api.evaluateRuntimeRequirements(requirements, { ...actual, runtime_version: '0.19.0' }).compatible, false);
  for (const capability of ['judgment.context_paths', 'judgment.payload_selection']) {
    assert.ok(requirements.required_capabilities.includes(capability));
    assert.equal(api.evaluateRuntimeRequirements(requirements, {
      ...actual, capabilities: actual.capabilities.filter(value => value !== capability),
    }).compatible, false);
  }
}

// Compare the actual SDK-boundary request against the same transition's legacy declaration.
// The SDK stub is a controlled evidence oracle, not a semantic model accuracy measurement.
async function legacyRequest(judgment, context, payload, currentState) {
  const api = await runtime;
  const legacy = { ...judgment };
  for (const key of ['context_paths', 'payload_paths', 'required_context_paths', 'include_payload', 'precondition']) delete legacy[key];
  return api.JudgmentEngine.evaluate(legacy, { context, event: { payload }, currentState });
}

function candidateContext(engine, payload) {
  const context = { ...engine.getContext() };
  for (const key of engine.getManifest().context_keys || []) {
    if (payload[key] !== undefined) context[key] = payload[key];
  }
  return context;
}

function measurement(t, name, before, after) {
  const baseline = bytes(before), selected = bytes(after);
  assert.ok(selected < baseline);
  assert.ok(!JSON.stringify(after).includes(sentinel));
  t.diagnostic(JSON.stringify({ judgment: name, baselineStateBytes: baseline,
    selectedStateBytes: selected, removedStateBytes: baseline - selected }));
}

module.exports = { assert, root, runtime, manifest, fixture, stubJev, capabilities,
  legacyRequest, candidateContext, measurement, sentinel };
