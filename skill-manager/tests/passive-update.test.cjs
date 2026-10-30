'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { checkAuthoringQuality } = require('../scripts/authoring-quality.cjs');
const manager = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(manager, file), 'utf8');
const passive = '---\nname: sample\ndescription: Generic instructions.\n---\n\n# Sample\nPreserve this instruction.\n';

function fixture(t) {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'manager-update-'));
  const source = path.join(workspace, 'source');
  const target = path.join(source, 'sample');
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'SKILL.md'), passive);
  t.after(() => {
    if (process.env.SKILL_MANAGER_TEST_EVIDENCE) fs.cpSync(workspace, path.join(process.env.SKILL_MANAGER_TEST_EVIDENCE, path.basename(workspace)), { recursive: true });
    fs.rmSync(workspace, { recursive: true, force: true });
  });
  return { workspace, source, target };
}

test('passive authoring checks require SKILL.md and references but no manifest', t => {
  const { target } = fixture(t);
  assert.deepEqual(checkAuthoringQuality(target).errors, []);
  fs.appendFileSync(path.join(target, 'SKILL.md'), '[missing](references/missing.md)\n');
  assert.equal(checkAuthoringQuality(target).errors[0].code, 'BROKEN_REFERENCE');
  fs.unlinkSync(path.join(target, 'SKILL.md'));
  assert.ok(checkAuthoringQuality(target).errors.some(e => e.path === 'SKILL.md'));
});

test('served contract branches passive UPDATE without weakening reactive validation', () => {
  assert.match(read('states/detecting.md'), /target_type.*passive/);
  assert.match(read('states/planning.md'), /frontmatter/);
  assert.match(read('states/approving.md'), /Passive/);
  assert.match(read('states/executing.md'), /passive/);
  const verifying = read('states/verifying.md');
  assert.match(verifying, /frontmatter/);
  assert.match(verifying, /protected/);
  assert.match(verifying, /canonical bootloader pointer/);
  assert.match(verifying, /VERIFIED_FAIL/);
  assert.match(read('templates/inventory.json.hbs'), /target_type/);
});

// The host follows served prompts and supplies real check results; runtime signals
// do not execute files or authenticate host-supplied approval/check evidence.
const runtime = process.env.REACTIVE_SKILLS_AXI || 'reactive-skills-axi';
const runtimeAvailable = spawnSync(runtime, ['capabilities', '--json'], { encoding: 'utf8' }).status === 0;
const validator = process.env.SKILL_FRONTMATTER_VALIDATOR;

function runManager(f, operation = 'UPDATE') {
  let runId, view;
  function call(command, signal, payload = {}) {
    const args = [command, manager];
    if (signal) args.push(signal);
    args.push('--job', runId || 'fixture');
    const input = path.join(f.workspace, 'payload.json');
    fs.writeFileSync(input, JSON.stringify(payload));
    const result = spawnSync(runtime, [...args, '--payload', '@' + input, '--output', 'compact-v1'], { cwd: f.workspace, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const receipt = JSON.parse(result.stdout);
    view = receipt.view || receipt;
    runId = view.run_id;
    fs.writeFileSync(path.join(f.workspace, `${view.seq}-${command}-${signal || 'initial'}.json`), JSON.stringify(receipt, null, 2));
    return receipt;
  }
  call('invoke', null, { skill_name: 'sample', operation, authoring_source: f.source, target_skill_dir: f.target, manager_skill_dir: manager });
  for (const signal of ['RUNTIME_READY', 'USER_INVOKED', 'PARSED']) call('emit', signal);
  return { emit: (signal, payload) => call('emit', signal, payload), view: () => view };
}

function detect(f, run, operation = 'UPDATE') {
  const reactive = fs.existsSync(path.join(f.target, 'skill.yaml'));
  const exists = reactive || fs.existsSync(path.join(f.target, 'SKILL.md'));
  const target_type = reactive ? 'reactive' : exists ? 'passive' : 'missing';
  assert.match(run.view().prompt, /target_type.*passive/);
  const signal = operation === 'MIGRATE_LEGACY' ? 'IS_LEGACY' : exists ? 'EXISTS_UPDATE_DELETE' : 'NOT_EXISTS_UPDATE_DELETE';
  run.emit(signal, { contextUpdates: { target_type, skillExists: exists, isLegacy: target_type === 'passive' } });
  return target_type;
}

test('actual passive UPDATE checks, guarded verification and truthful projection', { skip: !runtimeAvailable || !validator }, t => {
  const f = fixture(t);
  const run = runManager(f);
  assert.equal(detect(f, run), 'passive');
  const file = path.join(f.target, 'SKILL.md');
  const plan = { operation: 'UPDATE', target_type: 'passive', shape: null, frontmatter_check: ['python3', validator, f.target], files_to_modify: ['SKILL.md'], files_to_create: [], files_to_delete: [] };
  run.emit('PLAN_READY', { contextUpdates: { plan } });
  assert.equal(run.view().state, 'APPROVING');
  assert.equal(run.emit('EXECUTED').transitioned, false);
  assert.equal(fs.readFileSync(file, 'utf8'), passive);
  run.emit('USER_APPROVED', { approval_evidence: 'Fixture authorizes only the declared file.' });
  fs.appendFileSync(file, '\nAn approved clarification.\n');
  const frontmatter = spawnSync('python3', [validator, f.target], { encoding: 'utf8' });
  assert.equal(frontmatter.status, 0, frontmatter.stdout + frontmatter.stderr);
  assert.deepEqual(checkAuthoringQuality(f.target).errors, []);
  assert.ok(fs.readFileSync(file, 'utf8').startsWith(passive));
  run.emit('EXECUTED', { exit_code: 0, contextUpdates: { files: ['SKILL.md'] } });
  for (const exit_code of [undefined, 1]) {
    assert.equal(run.emit('VERIFIED_OK', { exit_code }).transitioned, false);
    assert.equal(run.view().state, 'VERIFYING');
  }
  run.emit('VERIFIED_OK', { exit_code: 0, checks: { frontmatter: frontmatter.stdout.trim(), authoring_errors: 0, protected_content: true, passive_identity: true } });
  assert.equal(run.view().state, 'PROJECTING');
  const receipt = run.emit('PROJECTED');
  assert.equal(run.view().state, 'SUCCESS');
  const inventory = JSON.parse(fs.readFileSync(receipt.deliverables.find(f => f.endsWith('inventory.json')), 'utf8'));
  assert.equal(inventory.target_type, 'passive');
  assert.deepEqual(inventory.files, ['SKILL.md']);
  const snapshot = fs.readFileSync(receipt.deliverables.find(f => f.endsWith('-snapshot.md')), 'utf8');
  assert.match(snapshot, /passive/);
  for (const name of ['skill.yaml', 'skill.yml']) assert.equal(fs.existsSync(path.join(f.target, name)), false);
  assert.equal(fs.readFileSync(file, 'utf8').includes('REACTIVE BOOTLOADER'), false);
});

test('actual missing UPDATE rejects and legacy migration stays explicit', { skip: !runtimeAvailable }, t => {
  const missing = fixture(t);
  fs.unlinkSync(path.join(missing.target, 'SKILL.md'));
  const run = runManager(missing);
  assert.equal(detect(missing, run), 'missing');
  assert.equal(run.view().state, 'ERROR');
  const legacy = fixture(t);
  const migration = runManager(legacy, 'MIGRATE_LEGACY');
  detect(legacy, migration, 'MIGRATE_LEGACY');
  assert.equal(migration.view().state, 'BACKING_UP_MIGRATE');
  const backup = path.join(legacy.source, '.backup/sample/original');
  fs.cpSync(legacy.target, backup, { recursive: true });
  migration.emit('BACKED_UP_LEGACY');
  migration.emit('INFERRED', { confidence: 1 });
  migration.emit('PLAN_READY');
  migration.emit('USER_REJECTED');
  assert.equal(migration.view().state, 'RESTORING_MIGRATE');
  fs.cpSync(backup, legacy.target, { recursive: true });
  migration.emit('RESTORED');
  assert.equal(migration.view().state, 'ERROR');
  assert.equal(fs.readFileSync(path.join(legacy.target, 'SKILL.md'), 'utf8'), passive);
});

test('malformed passive frontmatter fails the supported standard checker', { skip: !validator }, t => {
  const { target } = fixture(t);
  for (const text of ['# Missing frontmatter\n', '---\nname: [broken\n---\n', '---\nname: sample\ndescription: []\n---\n']) {
    fs.writeFileSync(path.join(target, 'SKILL.md'), text);
    assert.notEqual(spawnSync('python3', [validator, target], { encoding: 'utf8' }).status, 0);
  }
});

test('failed passive checks reach scoped rollback, never verified projection', { skip: !runtimeAvailable || !validator }, t => {
  for (const failure of ['frontmatter', 'reference', 'outside-source', 'escaping-link', 'unapproved-file']) {
    const f = fixture(t);
    const file = path.join(f.target, 'SKILL.md');
    const run = runManager(f);
    detect(f, run);
    run.emit('PLAN_READY', { contextUpdates: { plan: { target_type: 'passive', shape: null, frontmatter_check: ['python3', validator, f.target], files_to_modify: ['SKILL.md'] } } });
    run.emit('USER_APPROVED', { approval_evidence: 'Fixture permits SKILL.md only.' });
    let check;
    if (failure === 'frontmatter') {
      fs.writeFileSync(file, '# Invalid frontmatter\n');
      check = spawnSync('python3', [validator, f.target], { encoding: 'utf8' }).status;
    } else if (failure === 'reference') {
      fs.appendFileSync(file, '[broken](missing.md)\n');
      check = checkAuthoringQuality(f.target).errors.length;
    } else {
      // Executor checks the real canonical destination and exact file plan before
      // writing. No outside-source or unapproved file is actually mutated.
      if (failure === 'escaping-link') fs.symlinkSync(f.workspace, path.join(f.target, 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
      const proposed = failure === 'outside-source' ? path.join(f.workspace, 'outside.md') : failure === 'escaping-link' ? path.join(f.target, 'escape/outside.md') : path.join(f.target, 'extra.md');
      const contained = path.relative(fs.realpathSync(f.source), fs.realpathSync(path.dirname(proposed)));
      const inside = contained !== '..' && !contained.startsWith('..' + path.sep) && !path.isAbsolute(contained);
      check = inside && proposed === file ? 0 : 1;
      assert.equal(fs.existsSync(proposed), false);
    }
    assert.notEqual(check, 0, failure);
    run.emit('EXECUTED', { exit_code: 1, failed_check: failure });
    assert.equal(run.emit('VERIFIED_OK', { exit_code: 1 }).transitioned, false);
    run.emit('VERIFIED_FAIL', { exit_code: 1, failed_check: failure });
    assert.equal(run.view().state, 'ROLLING_BACK');
    assert.match(run.view().prompt, /only the paths in the approved file plan/);
    fs.writeFileSync(file, passive);
    run.emit('ROLLED_BACK');
    assert.equal(run.view().state, 'ERROR');
    assert.equal(fs.readFileSync(file, 'utf8'), passive);
    assert.equal(fs.existsSync(path.join(f.target, 'skill.yaml')), false);
  }
});

test('reactive runtime and canonical bootloader failures retain verification rejection', { skip: !runtimeAvailable }, t => {
  for (const failure of ['manifest', 'bootloader']) {
    const f = fixture(t);
    fs.writeFileSync(path.join(f.target, 'skill.yaml'), failure === 'manifest' ? 'states: [broken\n' : 'schema_version: 2.1.0\nname: sample\nversion: 1.0.0\ninitial_state: READY\nstates:\n  READY: {}\n');
    const run = runManager(f);
    assert.equal(detect(f, run), 'reactive');
    run.emit('PLAN_READY');
    run.emit('USER_APPROVED', { approval_evidence: 'Fixture update authorization.' });
    let check;
    if (failure === 'manifest') {
      const result = spawnSync(runtime, ['validate', f.target], { cwd: f.workspace, encoding: 'utf8' });
      check = result.status;
      assert.match(result.stdout + result.stderr, /error|invalid|failed/i);
    } else {
      // Use the existing registry validator, including its canonical template.
      const scripts = path.join(f.source, 'scripts');
      fs.mkdirSync(scripts);
      fs.copyFileSync(path.join(manager, '../scripts/validate-skills.js'), path.join(scripts, 'validate-skills.js'));
      const templates = path.join(f.source, 'skill-manager/templates');
      fs.mkdirSync(templates, { recursive: true });
      fs.copyFileSync(path.join(manager, 'templates/reactive_bootloader.md.hbs'), path.join(templates, 'reactive_bootloader.md.hbs'));
      const result = spawnSync(process.execPath, [path.join(scripts, 'validate-skills.js'), 'sample', '--no-runtime'], { cwd: f.workspace, encoding: 'utf8' });
      check = result.status;
      assert.match(result.stdout + result.stderr, /bootloader pointer block/);
    }
    assert.notEqual(check, 0, failure);
    run.emit('EXECUTED', { exit_code: 1 });
    assert.match(run.view().prompt, /canonical bootloader pointer/);
    assert.equal(run.emit('VERIFIED_OK', { exit_code: 1 }).transitioned, false);
    run.emit('VERIFIED_FAIL', { exit_code: 1, failed_check: failure });
    assert.equal(run.view().state, 'ROLLING_BACK');
    run.emit('ROLLBACK_FAILED', { reason: 'Fixture retains original invalid input.' });
    assert.equal(run.view().state, 'ERROR');
  }
});

test('rejected passive plan writes nothing and cannot skip approval', { skip: !runtimeAvailable }, t => {
  const f = fixture(t);
  const run = runManager(f);
  detect(f, run);
  run.emit('PLAN_READY');
  assert.equal(run.emit('VERIFIED_OK', { exit_code: 0 }).transitioned, false);
  run.emit('USER_REJECTED');
  assert.equal(run.view().state, 'CANCELLED');
  assert.equal(fs.readFileSync(path.join(f.target, 'SKILL.md'), 'utf8'), passive);
});

test('reactive migration failure restores its real backup through the existing route', { skip: !runtimeAvailable }, t => {
  const f = fixture(t);
  const manifest = path.join(f.target, 'skill.yaml');
  const original = 'schema_version: reactive/v1\nname: sample\n';
  fs.writeFileSync(manifest, original);
  const run = runManager(f, 'MIGRATE_REACTIVE');
  assert.match(fs.readFileSync(manifest, 'utf8'), /schema_version: reactive\/v1/);
  run.emit('IS_V1_REACTIVE', { contextUpdates: { target_type: 'reactive', isV1Reactive: true } });
  const backup = path.join(f.source, '.backup/sample/original');
  fs.cpSync(f.target, backup, { recursive: true });
  run.emit('BACKED_UP_REACTIVE');
  assert.equal(run.view().state, 'INSPECTING_REACTIVE');
  run.emit('INSPECTED');
  run.emit('PLAN_READY');
  run.emit('USER_APPROVED', { approval_evidence: 'Fixture permits migration of the manifest.' });
  fs.writeFileSync(manifest, 'schema_version: [broken\n');
  const result = spawnSync(runtime, ['validate', f.target], { cwd: f.workspace, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  run.emit('EXECUTED', { exit_code: 1 });
  assert.equal(run.emit('VERIFIED_OK', { exit_code: 1 }).transitioned, false);
  run.emit('VERIFIED_FAIL', { exit_code: 1 });
  assert.equal(run.view().state, 'RESTORING_MIGRATE');
  fs.cpSync(backup, f.target, { recursive: true });
  run.emit('RESTORED');
  assert.equal(run.view().state, 'ERROR');
  assert.equal(fs.readFileSync(manifest, 'utf8'), original);
  assert.equal(fs.readFileSync(path.join(f.target, 'SKILL.md'), 'utf8'), passive);
});
