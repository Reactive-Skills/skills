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
    let entry = process.env.PRODUCT_MANAGER_RUNTIME;
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

async function project(t, context) {
  const { FSMEngine, ProjectionEngine } = await runtime();
  const workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'product-manager-test-'));
  const engine = new FSMEngine({ skillDir, workspaceDir, initialContext: {}, jobId: 'projection' });
  t.after(() => {
    engine.getEventStore().close();
    const target = fs.realpathSync(workspaceDir);
    assert.equal(path.dirname(target), fs.realpathSync(os.tmpdir()));
    assert.match(path.basename(target), /^product-manager-test-/);
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 3 });
  });
  const projections = engine.getManifest().deliverable_projections;
  const projector = new ProjectionEngine(skillDir, projections, workspaceDir);
  const before = Date.now();
  projector.project(engine.getEventStore(), 'PROJECTING', 'product-manager', context);
  const after = Date.now();
  // Templates may be checked out with CRLF line endings; assertions read lines.
  const read = file => fs.readFileSync(path.join(workspaceDir, '.docs/product-manager', file), 'utf8').replace(/\r\n/g, '\n');
  return { read, before, after };
}

const structured = {
  product_name: 'Ledger Lite',
  opportunity_type: 'new_product',
  target_persona: 'Freelance bookkeepers',
  problem_statement: 'Reconciling client receipts takes hours each week.',
  worthwhileness_score: 4,
  strategic_goals: [{ objective: 'Cut reconciliation time', target_metric: 'median < 15 minutes', timeframe: 'Q1', key_results: ['Import 90% of receipts automatically'] }],
  anti_goals: ['Full accounting suite'],
  smart_requirements: [{ id: 'R1', title: 'Receipt import', specific: 'Import CSV receipts', measurable: 'import.test passes', relevant_goal: 'Cut reconciliation time', time_sequence: '1' }],
  eisenhower_matrix: {
    q1_do_now: [{ id: 'R1', title: 'Receipt import' }],
    q2_schedule: [],
    q3_delegate: [],
    q4_defer_reject: [{ id: 'R9', title: 'Payroll', rationale: 'Outside the anti-goal boundary' }],
  },
  vertical_slices: [{
    id: 'VS-1',
    title: 'Walking skeleton',
    user_value: 'See imported receipts',
    in_scope: ['CSV upload', 'Receipt list'],
    out_of_scope: ['Bank feeds'],
    layer_touchpoints: ['UI', 'storage'],
    dependencies: [],
    acceptance_criteria: ['Given a CSV, when uploaded, then receipts are listed'],
    verification_script: 'npm test -- import',
  }],
  mvp_slice_ids: ['VS-1', 'VS-2'],
};

test('product spec renders runtime context fields', async t => {
  const { read } = await project(t, structured);
  const spec = read('Ledger Lite-spec.md');
  assert.match(spec, /^# Lean Product Specification: Ledger Lite$/m);
  assert.match(spec, /\*\*Opportunity Type\*\*: new_product/);
  assert.match(spec, /\*\*Worthwhileness Score\*\*: 4 \/ 5\.0/);
  assert.match(spec, /Reconciling client receipts takes hours each week\./);
  assert.match(spec, /Freelance bookkeepers/);
  assert.match(spec, /\*\*Cut reconciliation time\*\*/);
  assert.match(spec, /`median < 15 minutes`/);
  assert.match(spec, /Import 90% of receipts automatically/);
  assert.match(spec, /Full accounting suite/);
  assert.match(spec, /\| `R1` \| \*\*Receipt import\*\* \|/);
  assert.match(spec, /### Slice `VS-1`: Walking skeleton/);
  assert.match(spec, /- CSV upload/);
  assert.match(spec, /- Bank feeds/);
  assert.match(spec, /Given a CSV, when uploaded, then receipts are listed/);
  assert.match(spec, /^- \*\*Approved MVP Slices\*\*: `VS-1`, `VS-2`$/m);
});

test('eisenhower matrix renders structured and text entries', async t => {
  const { read } = await project(t, {
    ...structured,
    eisenhower_matrix: { ...structured.eisenhower_matrix, q2_schedule: ['Offline mode'], q4_defer_reject: [...structured.eisenhower_matrix.q4_defer_reject, 'Mobile app'] },
  });
  const matrix = read('Ledger Lite-eisenhower.md');
  assert.match(matrix, /^# Eisenhower Prioritization Matrix: Ledger Lite$/m);
  assert.match(matrix, /`R1` - Receipt import/);
  assert.match(matrix, /• Offline mode/);
  assert.match(matrix, /\| `R9` \| \*\*Payroll\*\* \| Outside the anti-goal boundary \|/);
  assert.match(matrix, /\*\*Mobile app\*\*/);
});

test('text-shaped goals, requirements, and slice fields stay visible', async t => {
  const { read } = await project(t, {
    ...structured,
    strategic_goals: ['Win ten pilot customers'],
    smart_requirements: ['Import receipts from CSV'],
    vertical_slices: [{ id: 'VS-1', title: 'Walking skeleton', in_scope: 'CSV upload only', out_of_scope: 'Bank feeds', layer_touchpoints: 'UI and storage', acceptance_criteria: 'Receipts appear after upload' }],
  });
  const spec = read('Ledger Lite-spec.md');
  assert.match(spec, /Win ten pilot customers/);
  assert.match(spec, /^\| - \| \*\*Requirement\*\* \| Import receipts from CSV \|/m);
  assert.match(spec, /CSV upload only/);
  assert.match(spec, /Bank feeds/);
  assert.match(spec, /UI and storage/);
  assert.match(spec, /Receipts appear after upload/);
});

test('inventory is valid JSON with typed values and projection timestamp', async t => {
  const { read, before, after } = await project(t, { ...structured, product_name: 'Ledger & Lite' });
  const inventory = JSON.parse(read('inventory.json'));
  assert.equal(inventory.product_name, 'Ledger & Lite');
  assert.equal(inventory.opportunity_type, 'new_product');
  assert.equal(inventory.worthwhileness_score, 4);
  assert.deepEqual(inventory.mvp_slices, ['VS-1', 'VS-2']);
  const stamped = Date.parse(inventory.timestamp);
  assert.ok(stamped >= before - 1000 && stamped <= after + 1000, `timestamp ${inventory.timestamp} is the projection time`);
});
