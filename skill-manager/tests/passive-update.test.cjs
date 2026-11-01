'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { checkAuthoringQuality } = require('../scripts/authoring-quality.cjs');
const manager = path.resolve(__dirname, '..');
const runtime = 'reactive-skills-axi';
const passive = '---\nname: sample\ndescription: Generic instructions.\n---\n\n# Sample\nPreserve this instruction.\n';
const reactiveManifest = 'schema_version: 2.1.0\nname: sample\nversion: 1.0.0\ninitial_state: READY\nstates:\n  READY: {}\n';

function fixture(t) {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'manager-update-'));
  const source = path.join(workspace, 'source');
  const target = path.join(source, 'sample');
  const capture = path.join(source, '.backup/sample/fixture');
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'SKILL.md'), passive);
  t.after(() => fs.rmSync(workspace, { recursive: true, force: true }));
  return { workspace, source, target, capture };
}

// The host follows served prompts and supplies check results; these cases drive the
// real runtime, so they prove prompts, guards and projections, not the host's work.
function runManager(f, operation = 'UPDATE', paths = { authoring_source: f.source, target_skill_dir: f.target, manager_skill_dir: manager }) {
  let runId, view, deliverables;
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
    deliverables = receipt.deliverables || deliverables;
    return receipt;
  }
  call('invoke', null, { skill_name: 'sample', operation, ...paths });
  for (const signal of ['RUNTIME_READY', 'USER_INVOKED', 'PARSED']) call('emit', signal);
  return {
    emit: (signal, body) => call('emit', signal, body),
    state: () => view.state,
    prompt: () => view.prompt,
    inventory: () => JSON.parse(fs.readFileSync(deliverables.find(file => file.endsWith('inventory.json')), 'utf8')),
    snapshot: () => fs.readFileSync(deliverables.find(file => file.endsWith('-snapshot.md')), 'utf8'),
  };
}

function passiveUpdatePlan(f) {
  return { operation: 'UPDATE', shape: null, frontmatter_check: ['checker', f.target], pre_update_capture_dir: f.capture, files_to_modify: ['SKILL.md'], files_to_create: [], files_to_delete: [] };
}

function approvedPassiveUpdate(f) {
  const run = runManager(f);
  run.emit('EXISTS_UPDATE_DELETE', { contextUpdates: { target_type: 'passive', skillExists: true, isLegacy: true } });
  run.emit('PLAN_READY', { contextUpdates: { plan: passiveUpdatePlan(f) } });
  run.emit('USER_APPROVED', { approval_evidence: 'Fixture permits SKILL.md only.' });
  return run;
}

function failedVerification(run, failed_check) {
  run.emit('EXECUTED', { exit_code: 1, failed_check });
  assert.equal(run.emit('VERIFIED_OK', { exit_code: 1 }).transitioned, false);
  assert.equal(run.state(), 'VERIFYING');
  run.emit('VERIFIED_FAIL', { exit_code: 1, failed_check });
}

test('passive authoring checks require SKILL.md and references but no manifest', t => {
  const { target } = fixture(t);
  assert.deepEqual(checkAuthoringQuality(target).errors, []);
  fs.appendFileSync(path.join(target, 'SKILL.md'), '[missing](references/missing.md)\n');
  assert.equal(checkAuthoringQuality(target).errors[0].code, 'BROKEN_REFERENCE');
  fs.unlinkSync(path.join(target, 'SKILL.md'));
  assert.ok(checkAuthoringQuality(target).errors.some(e => e.path === 'SKILL.md'));
});

test('source paths resolved during DETECTING reach the later containment prompts', t => {
  const f = fixture(t);
  const run = runManager(f, 'UPDATE', {});
  assert.equal(run.state(), 'DETECTING');
  assert.match(run.prompt(), /`context\.authoring_source`, `context\.target_skill_dir`, and `context\.manager_skill_dir` in `contextUpdates`/);
  run.emit('EXISTS_UPDATE_DELETE', { contextUpdates: { target_type: 'passive', authoring_source: f.source, target_skill_dir: f.target, manager_skill_dir: manager } });
  run.emit('PLAN_READY', { contextUpdates: { plan: passiveUpdatePlan(f) } });
  run.emit('USER_APPROVED', { approval_evidence: 'Fixture permits SKILL.md only.' });
  assert.ok(run.prompt().includes(`Recheck canonical containment of \`${f.target}\` within \`${f.source}\``));
  run.emit('EXECUTED', { exit_code: 0 });
  assert.ok(run.prompt().includes(`Use the approved absolute \`${f.target}\` within \`${f.source}\``));
  assert.ok(run.prompt().includes(`node "${manager}/scripts/authoring-quality.cjs" "${f.target}" --json`));
  run.emit('VERIFIED_FAIL', { exit_code: 1, failed_check: 'outside-source' });
  assert.ok(run.prompt().includes(`recheck that \`${f.target}\` canonically remains inside \`${f.source}\``));
});

test('passive UPDATE stays gated by approval and verification and projects its target type', t => {
  const f = fixture(t);
  const run = runManager(f);
  run.emit('EXISTS_UPDATE_DELETE', { contextUpdates: { target_type: 'passive', skillExists: true, isLegacy: true } });
  assert.equal(run.state(), 'PLANNING');
  run.emit('PLAN_READY', { contextUpdates: { plan: passiveUpdatePlan(f) } });
  assert.equal(run.state(), 'APPROVING');
  assert.equal(run.emit('EXECUTED').transitioned, false);
  run.emit('USER_APPROVED', { approval_evidence: 'Fixture authorizes only the declared file.' });
  assert.ok(run.prompt().includes(`copy the whole \`${f.target}\` recursively`));
  assert.ok(run.prompt().includes(`to \`${f.capture}\``));
  run.emit('EXECUTED', { exit_code: 0, contextUpdates: { target_type: 'passive', files: ['SKILL.md'] } });
  assert.ok(run.prompt().includes(`every other target path with the capture at \`${f.capture}\``));
  for (const exit_code of [undefined, 1]) {
    assert.equal(run.emit('VERIFIED_OK', { exit_code }).transitioned, false);
    assert.equal(run.state(), 'VERIFYING');
  }
  run.emit('VERIFIED_OK', { exit_code: 0 });
  assert.equal(run.state(), 'PROJECTING');
  run.emit('PROJECTED');
  assert.equal(run.state(), 'SUCCESS');
  const inventory = run.inventory();
  assert.equal(inventory.target_type, 'passive');
  assert.deepEqual(inventory.files, ['SKILL.md']);
  assert.match(run.snapshot(), /Target type: passive/);
});

test('missing UPDATE stops at ERROR', t => {
  const f = fixture(t);
  fs.unlinkSync(path.join(f.target, 'SKILL.md'));
  const run = runManager(f);
  run.emit('NOT_EXISTS_UPDATE_DELETE', { contextUpdates: { target_type: 'missing', skillExists: false } });
  assert.equal(run.state(), 'ERROR');
  assert.equal(run.inventory().target_type, 'missing');
});

test('revising a passive plan is served the fields that keep its checker and capture', t => {
  const f = fixture(t);
  const run = runManager(f);
  run.emit('EXISTS_UPDATE_DELETE', { contextUpdates: { target_type: 'passive' } });
  run.emit('PLAN_READY', { contextUpdates: { plan: passiveUpdatePlan(f) } });
  run.emit('USER_REVISE', { feedback: 'Change the wording.', contextUpdates: { revision_feedback: 'Change the wording.' } });
  assert.equal(run.state(), 'REVISING');
  assert.match(run.prompt(), /`pre_update_capture_dir` for UPDATE, `shape: null` and `frontmatter_check` for passive UPDATE/);
});

test('rejected passive plan cannot skip approval and ends cancelled', t => {
  const f = fixture(t);
  const run = runManager(f);
  run.emit('EXISTS_UPDATE_DELETE', { contextUpdates: { target_type: 'passive' } });
  run.emit('PLAN_READY');
  assert.equal(run.emit('VERIFIED_OK', { exit_code: 0 }).transitioned, false);
  run.emit('USER_REJECTED');
  assert.equal(run.state(), 'CANCELLED');
});

test('failed passive checks roll back from the capture instead of a repository restore', t => {
  for (const failed_check of ['frontmatter', 'reference']) {
    const f = fixture(t);
    const run = approvedPassiveUpdate(f);
    failedVerification(run, failed_check);
    assert.equal(run.state(), 'ROLLING_BACK', failed_check);
    assert.ok(run.prompt().includes(`byte-for-byte from \`${f.capture}\``), failed_check);
    assert.match(run.prompt(), /Never use `git restore`/);
    assert.match(run.prompt(), /capture is missing or incomplete, emit `ROLLBACK_FAILED`/);
    assert.match(run.prompt(), /`contextUpdates\.target_type`/);
    run.emit('ROLLED_BACK', { contextUpdates: { target_type: 'passive' } });
    assert.equal(run.state(), 'ERROR');
    assert.equal(run.inventory().target_type, 'passive');
  }
});

test('changes outside the approved plan or source end in ROLLBACK_FAILED', t => {
  for (const failed_check of ['outside-source', 'escaping-link', 'unapproved-file']) {
    const f = fixture(t);
    const run = approvedPassiveUpdate(f);
    failedVerification(run, failed_check);
    assert.equal(run.state(), 'ROLLING_BACK', failed_check);
    assert.match(run.prompt(), /Do not restore a change outside the approved plan or source; emit `ROLLBACK_FAILED` listing each such path/);
    run.emit('ROLLBACK_FAILED', { failed_check, contextUpdates: { target_type: 'passive' } });
    assert.equal(run.state(), 'ERROR');
    assert.equal(run.inventory().target_type, 'passive');
  }
});

test('failed CREATE projects the rolled-back target type, not the one recorded before rollback', t => {
  const f = fixture(t);
  fs.rmSync(f.target, { recursive: true });
  const run = runManager(f, 'CREATE');
  run.emit('NOT_EXISTS_CREATE', { contextUpdates: { target_type: 'missing' } });
  run.emit('PLAN_READY', { contextUpdates: { plan: { operation: 'CREATE', files_to_create: ['skill.yaml'] } } });
  run.emit('USER_APPROVED', { approval_evidence: 'Fixture permits the manifest.' });
  run.emit('EXECUTED', { exit_code: 1, contextUpdates: { target_type: 'reactive', files: ['skill.yaml'] } });
  assert.equal(run.inventory().target_type, 'reactive');
  run.emit('VERIFIED_FAIL', { exit_code: 1 });
  assert.equal(run.state(), 'ROLLING_BACK');
  assert.match(run.prompt(), /`contextUpdates\.target_type`/);
  run.emit('ROLLED_BACK', { contextUpdates: { target_type: 'missing' } });
  assert.equal(run.state(), 'ERROR');
  assert.equal(run.inventory().target_type, 'missing');
});

test('reactive runtime and canonical bootloader failures retain verification rejection', t => {
  for (const failure of ['manifest', 'bootloader']) {
    const f = fixture(t);
    fs.writeFileSync(path.join(f.target, 'skill.yaml'), failure === 'manifest' ? 'states: [broken\n' : reactiveManifest);
    let result;
    if (failure === 'manifest') {
      result = spawnSync(runtime, ['validate', f.target], { cwd: f.workspace, encoding: 'utf8' });
      assert.match(result.stdout + result.stderr, /error|invalid|failed/i);
    } else {
      const scripts = path.join(f.source, 'scripts');
      fs.mkdirSync(scripts);
      fs.copyFileSync(path.join(manager, '../scripts/validate-skills.js'), path.join(scripts, 'validate-skills.js'));
      const templates = path.join(f.source, 'skill-manager/templates');
      fs.mkdirSync(templates, { recursive: true });
      fs.copyFileSync(path.join(manager, 'templates/reactive_bootloader.md.hbs'), path.join(templates, 'reactive_bootloader.md.hbs'));
      result = spawnSync(process.execPath, [path.join(scripts, 'validate-skills.js'), 'sample', '--no-runtime'], { cwd: f.workspace, encoding: 'utf8' });
      assert.match(result.stdout + result.stderr, /bootloader pointer block/);
    }
    assert.notEqual(result.status, 0, failure);
    const run = runManager(f);
    run.emit('EXISTS_UPDATE_DELETE', { contextUpdates: { target_type: 'reactive' } });
    run.emit('PLAN_READY', { contextUpdates: { plan: { operation: 'UPDATE', pre_update_capture_dir: f.capture, files_to_modify: ['skill.yaml'] } } });
    run.emit('USER_APPROVED', { approval_evidence: 'Fixture update authorization.' });
    run.emit('EXECUTED', { exit_code: 1 });
    assert.ok(run.prompt().includes(`validate "${f.target}"`));
    assert.match(run.prompt(), /canonical bootloader pointer/);
    assert.equal(run.emit('VERIFIED_OK', { exit_code: 1 }).transitioned, false);
    run.emit('VERIFIED_FAIL', { exit_code: 1, failed_check: failure });
    assert.equal(run.state(), 'ROLLING_BACK');
    assert.ok(run.prompt().includes(`byte-for-byte from \`${f.capture}\``));
    run.emit('ROLLBACK_FAILED', { reason: 'Fixture retains original invalid input.' });
    assert.equal(run.state(), 'ERROR');
    assert.equal(run.inventory().target_type, 'reactive');
  }
});

function migratedToApproval(f, operation) {
  const run = runManager(f, operation);
  if (operation === 'MIGRATE_LEGACY') {
    run.emit('IS_LEGACY', { contextUpdates: { target_type: 'passive', isLegacy: true } });
    run.emit('BACKED_UP_LEGACY');
    run.emit('INFERRED', { confidence: 1 });
  } else {
    run.emit('IS_V1_REACTIVE', { contextUpdates: { target_type: 'reactive', isV1Reactive: true } });
    run.emit('BACKED_UP_REACTIVE');
    assert.equal(run.state(), 'INSPECTING_REACTIVE');
    run.emit('INSPECTED');
  }
  run.emit('PLAN_READY');
  assert.equal(run.state(), 'APPROVING_MIGRATE');
  return run;
}

test('successful legacy migration projects the refreshed reactive target type', t => {
  const f = fixture(t);
  const run = migratedToApproval(f, 'MIGRATE_LEGACY');
  assert.equal(run.inventory().target_type, 'passive');
  run.emit('USER_APPROVED', { approval_evidence: 'Fixture permits migration.' });
  assert.match(run.prompt(), /`contextUpdates\.target_type`/);
  run.emit('EXECUTED', { exit_code: 0, contextUpdates: { target_type: 'reactive', files: ['skill.yaml'] } });
  assert.match(run.prompt(), /`contextUpdates\.target_type`/);
  run.emit('VERIFIED_OK', { exit_code: 0, contextUpdates: { target_type: 'reactive' } });
  run.emit('PROJECTED');
  assert.equal(run.state(), 'SUCCESS');
  assert.equal(run.inventory().target_type, 'reactive');
  assert.match(run.snapshot(), /Target type: reactive/);
});

test('rejected legacy migration restores through the existing route and stays passive', t => {
  const f = fixture(t);
  const run = migratedToApproval(f, 'MIGRATE_LEGACY');
  run.emit('USER_REJECTED');
  assert.equal(run.state(), 'RESTORING_MIGRATE');
  assert.match(run.prompt(), /`contextUpdates\.target_type`/);
  run.emit('RESTORED', { contextUpdates: { target_type: 'passive' } });
  assert.equal(run.state(), 'ERROR');
  assert.equal(run.inventory().target_type, 'passive');
});

test('failed reactive migration is rejected by the runtime and takes the restore route', t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.target, 'skill.yaml'), 'schema_version: reactive/v1\nname: sample\n');
  const run = migratedToApproval(f, 'MIGRATE_REACTIVE');
  run.emit('USER_APPROVED', { approval_evidence: 'Fixture permits migration of the manifest.' });
  fs.writeFileSync(path.join(f.target, 'skill.yaml'), 'schema_version: [broken\n');
  assert.notEqual(spawnSync(runtime, ['validate', f.target], { cwd: f.workspace, encoding: 'utf8' }).status, 0);
  run.emit('EXECUTED', { exit_code: 1 });
  assert.equal(run.emit('VERIFIED_OK', { exit_code: 1 }).transitioned, false);
  run.emit('VERIFIED_FAIL', { exit_code: 1 });
  assert.equal(run.state(), 'RESTORING_MIGRATE');
  run.emit('RESTORED', { contextUpdates: { target_type: 'reactive' } });
  assert.equal(run.state(), 'ERROR');
  assert.equal(run.inventory().target_type, 'reactive');
});
