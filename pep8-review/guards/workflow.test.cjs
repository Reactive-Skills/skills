const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const { execSync } = require('node:child_process');
const { test } = require('node:test');

const skillDir = path.resolve(__dirname, '..');
let runtimePromise;
function runtime() {
  if (!runtimePromise) {
    let entry = process.env.PEP8_REVIEW_RUNTIME;
    if (entry) entry = path.resolve(entry);
    else {
      try {
        entry = require.resolve('@reactive-skills/runtime');
      } catch {
        // One command string through the shell finds npm.cmd on Windows without the argument
        // array that Node 24 deprecates alongside `shell` (DEP0190).
        const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
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
  const workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pep8-review-test-'));
  const engine = new FSMEngine({ skillDir, workspaceDir, initialContext: {}, jobId: 'acceptance' });
  t.after(() => {
    engine.getEventStore().close();
    const target = fs.realpathSync(workspaceDir);
    assert.equal(path.dirname(target), fs.realpathSync(os.tmpdir()));
    assert.match(path.basename(target), /^pep8-review-test-/);
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 3 });
  });
  const inventory = () => JSON.parse(fs.readFileSync(path.join(workspaceDir, '.docs/pep8-review/jobs/acceptance/latest-inventory.json'), 'utf8'));
  return { engine, workspaceDir, inventory };
}

async function accept(engine, name, payload, state) {
  const result = await engine.handleSignal(name, payload);
  assert.equal(result.transitioned, true, `${name} must be accepted`);
  assert.equal(engine.getCurrentState(), state);
}

async function reject(engine, name, payload) {
  const before = engine.getCurrentState();
  const result = await engine.handleSignal(name, payload);
  assert.equal(result.transitioned, false, `${name} must be refused for ${JSON.stringify(payload)}`);
  assert.equal(engine.getCurrentState(), before);
}

const finding = { file: 'app/models.py', line: 12, rule: 'PEP 8: Imports', explanation: 'Imports are on one line.', suggestion: 'Put each import on its own line.' };
const rules = { style_sources: ['https://peps.python.org/pep-0008/', 'pyproject.toml'], project_rules: { line_length: 88 } };

async function reachReview(engine, inventory) {
  await reject(engine, 'RUNTIME_READY', {});
  await accept(engine, 'RUNTIME_READY', { compatible: true }, 'INTAKE');
  assert.equal(inventory().finding_count, 0, 'inventory is valid JSON before review fields exist');
  await reject(engine, 'INPUT_READY', {});
  await reject(engine, 'INPUT_READY', { review_input: 'diff', review_scope: 'everything' });
  await accept(engine, 'INPUT_READY', { review_input: 'diff --git a/app/models.py', review_scope: 'changed_lines' }, 'DISCOVER_RULES');
  await reject(engine, 'RULES_READY', { style_sources: [], project_rules: {} });
  await reject(engine, 'RULES_READY', { style_sources: rules.style_sources });
  await accept(engine, 'RULES_READY', rules, 'REVIEW');
}

test('a review with findings reaches REPORT and projects valid inventory', async t => {
  const { engine, inventory } = await fixture(t);
  await reachReview(engine, inventory);
  await reject(engine, 'REVIEW_COMPLETE', {});
  await reject(engine, 'REVIEW_COMPLETE', { findings: [finding], finding_count: 2, outcome: 'findings' });
  await reject(engine, 'REVIEW_COMPLETE', { findings: [finding], finding_count: 1, outcome: 'no_findings' });
  await reject(engine, 'REVIEW_COMPLETE', { findings: [{ ...finding, suggestion: '' }], finding_count: 1, outcome: 'findings' });
  await accept(engine, 'REVIEW_COMPLETE', { findings: [finding], finding_count: 1, outcome: 'findings', review_summary: 'One import finding.' }, 'REPORT');
  const projected = inventory();
  assert.equal(projected.outcome, 'findings');
  assert.equal(projected.scope, 'changed_lines');
  assert.deepEqual(projected.findings, [finding]);
  assert.deepEqual(projected.style_sources, rules.style_sources);
});

test('a clean review reports no_findings', async t => {
  const { engine, inventory } = await fixture(t);
  await reachReview(engine, inventory);
  await reject(engine, 'REVIEW_COMPLETE', { findings: [], finding_count: 0, outcome: 'findings' });
  await accept(engine, 'REVIEW_COMPLETE', { findings: [], finding_count: 0, outcome: 'no_findings', review_summary: 'No actionable style findings.' }, 'REPORT');
  assert.equal(inventory().outcome, 'no_findings');
});

test('missing runtime ends in ERROR', async t => {
  const { engine } = await fixture(t);
  await accept(engine, 'SETUP_REQUIRED', { error_reason: 'No compatible runtime.' }, 'ERROR');
});
