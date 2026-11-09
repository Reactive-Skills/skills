'use strict';

// Run with the real installed runtime, for example:
// REACTIVE_RUNTIME_MODULE=/absolute/runtime/dist/index.js node --test guards/projection_contract.test.cjs
// DOCS_ARCHITECT_SKILL_DIR may select an isolated skill copy; default is this file's parent skill.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { before, test } = require('node:test');
const skillDir = path.resolve(process.env.DOCS_ARCHITECT_SKILL_DIR || path.join(__dirname, '..'));
let ProjectionEngine;
let EventStore;

before(async () => {
  const selected = process.env.REACTIVE_RUNTIME_MODULE;
  if (!selected) throw new Error('Set REACTIVE_RUNTIME_MODULE to the actual installed @reactive-skills/runtime/dist/index.js (absolute path or file: URL); no simulated renderer or skipped test is used.');
  const target = selected.startsWith('file:') ? selected : pathToFileURL(path.resolve(selected)).href;
  let runtime;
  try { runtime = await import(target); }
  catch (cause) { throw new Error('Cannot load REACTIVE_RUNTIME_MODULE=' + selected + '; select the installed runtime entry and a supported Node version.', {cause}); }
  ({ ProjectionEngine, EventStore } = runtime);
  assert.equal(typeof ProjectionEngine, 'function', 'Selected runtime must export its real ProjectionEngine');
  assert.equal(typeof EventStore, 'function', 'Selected runtime must export its real EventStore');
  for (const file of ['documentation_architecture.md.hbs', 'diagram_inventory.md.hbs', 'state_snapshot.json.hbs']) {
    assert.ok(fs.statSync(path.join(skillDir, 'templates', file)).isFile(), 'Missing skill template: ' + file);
  }
});

function defaultContext() {
  return {source_paths:[],audience:null,outcomes:[],documentation_scope:null,extracted_facts:[],architecture_decision:null,documentation_outline:null,diagram_inventory:[],draft_path:null,validation_exit_code:null,review_decision:null,deliverable_path:null};
}
function populatedContext(diagrams) {
  return {...defaultContext(), source_paths:['docs/fictional.md'],audience:'fictional operators',outcomes:['Inspect "quoted" strings, \\ paths, <tags>, & and Unicode → 🌱\nsecond line'],documentation_scope:'Fictional architecture sentinel',extracted_facts:['Fictional fact'],architecture_decision:'Fictional decision <safe> & "quoted"',documentation_outline:['Fictional guide'],diagram_inventory:diagrams,draft_path:'docs/fictional.md',validation_exit_code:0,review_decision:null,deliverable_path:null};
}
function render(t, context, state) {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-architect-projection-test-'));
  // Real EventStore with real SQLite, isolated entirely in memory. Existing ledgers are never opened.
  const store = new EventStore({inMemory:true,enableSqlite:true,workspaceDir:workspace,skillId:'docs-architect-projection-test',runId:'projection-contract-fixture'});
  t.after(() => { store.close(); fs.rmSync(workspace, {recursive:true,force:true}); });
  store.append('STATE_TRANSITION', {from:'VALIDATE',to:state,signal:'FICTIONAL_TEST_TRANSITION'});
  const definitions = [
    {template:'templates/documentation_architecture.md.hbs',output:'documentation-architecture.md',trigger_on:['STATE_TRANSITION']},
    {template:'templates/diagram_inventory.md.hbs',output:'diagram-inventory.md',trigger_on:['STATE_TRANSITION']},
    {template:'templates/state_snapshot.json.hbs',output:'state.json',trigger_on:['STATE_TRANSITION']}
  ];
  const beforeTime = Date.now();
  const engine = new ProjectionEngine(skillDir, definitions, workspace, 'projection-contract', true);
  const written = engine.project(store, state, 'docs-architect', context, 'STATE_TRANSITION');
  const failures = store.getAll().filter(event => (event.event_type || event.type) === 'PROJECTION_FAILED');
  assert.deepEqual(failures.map(event => event.payload), [], 'Real renderer emitted PROJECTION_FAILED');
  assert.equal(written.length, 6, 'Each projection must write its current mirror and job archive');
  const snapshot = JSON.parse(fs.readFileSync(path.join(workspace, 'state.json'), 'utf8'));
  assert.equal(snapshot.current_state, state, 'Snapshot must use runtime currentState');
  assert.ok(Number.isFinite(Date.parse(snapshot.timestamp)), 'Snapshot timestamp must use runtime lastUpdated');
  assert.ok(Date.parse(snapshot.timestamp) >= beforeTime && Date.parse(snapshot.timestamp) <= Date.now(), 'Snapshot timestamp must describe this render');
  assert.deepEqual(snapshot.context, context, 'JSON values must survive quotes, escaping, arrays, null and zero unchanged');
  for (const name of ['documentation-architecture.md','diagram-inventory.md','state.json']) {
    assert.equal(fs.readFileSync(path.join(workspace,name),'utf8'),fs.readFileSync(path.join(workspace,'jobs','projection-contract',name),'utf8'), 'Archive must match mirror: ' + name);
  }
  return {snapshot,architecture:fs.readFileSync(path.join(workspace,'documentation-architecture.md'),'utf8'),diagrams:fs.readFileSync(path.join(workspace,'diagram-inventory.md'),'utf8')};
}

test('actual renderer preserves JSON and populates structured documentation and diagram fields', t => {
  const context = populatedContext([{title:'Fictional topology sentinel',type:'Mermaid',sources:'docs/fictional.md:10',status:'rendered'}]);
  const output = render(t, context, 'SUCCESS');
  assert.ok(output.architecture.includes('Fictional architecture sentinel'));
  assert.ok(output.architecture.includes('fictional operators'));
  assert.ok(output.architecture.includes('Fictional guide'));
  assert.ok(output.architecture.includes('Fictional fact'));
  assert.ok(output.architecture.includes('Validation exit code: `0`'), 'Zero must not disappear as a falsy value');
  assert.ok(output.diagrams.includes('Fictional topology sentinel'));
  assert.ok(output.diagrams.includes('Mermaid'));
  assert.ok(output.diagrams.includes('docs/fictional.md:10'));
  assert.ok(output.diagrams.includes('rendered'));
});

test('legacy string diagram records remain readable without rewriting retained context', t => {
  const context = populatedContext(['Fictional legacy diagram sentinel']);
  const output = render(t, context, 'REVIEW');
  assert.ok(output.diagrams.includes('Fictional legacy diagram sentinel'), 'Legacy string item must be displayed explicitly');
  assert.deepEqual(output.snapshot.context.diagram_inventory, context.diagram_inventory);
});

test('default initial context renders empty arrays and nulls as valid JSON without missing-helper failures', t => {
  const context = defaultContext();
  const output = render(t, context, 'INTAKE');
  assert.deepEqual(output.snapshot.context.source_paths, []);
  assert.equal(output.snapshot.context.audience, null);
  assert.equal(output.snapshot.context.validation_exit_code, null);
  assert.ok(output.architecture.startsWith('# Documentation Architecture:'));
  assert.ok(output.diagrams.startsWith('# Diagram Inventory'));
  assert.ok(!output.architecture.includes('undefined'));
  assert.ok(!output.diagrams.includes('undefined'));
});
