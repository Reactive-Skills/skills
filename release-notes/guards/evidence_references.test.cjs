const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const { execSync } = require('node:child_process');
const { test } = require('node:test');

const skillDir = path.resolve(__dirname, '..');
const axiRequire = createRequire(path.join(process.env.EVIDENCE_PILOT_NODE_MODULES ||
  execSync('npm root -g', { encoding: 'utf8' }).trim(), '@reactive-skills/axi/package.json'));
const runtime = import(pathToFileURL(axiRequire.resolve('@reactive-skills/runtime')).href);

async function fixture(t, state) {
  const api = await runtime;
  const workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'evidence-pilot-'));
  const target = path.join(workspaceDir, 'skill');
  fs.cpSync(skillDir, target, { recursive: true });
  if (state) {
    // Start a focused guard fixture at the real state; keep all transitions unchanged.
    const manifest = path.join(target, 'skill.yaml');
    fs.writeFileSync(manifest, fs.readFileSync(manifest, 'utf8')
      .replace(/^initial_state:.*$/m, `initial_state: ${state}`));
  }
  let engine = new api.FSMEngine({ skillDir: target, workspaceDir, jobId: 'pilot' });
  t.after(() => { engine.close(); fs.rmSync(workspaceDir, { recursive: true, force: true }); });
  return { api, workspaceDir, get engine() { return engine; },
    reopen() { const runId = engine.getJobId(); engine.close();
      engine = new api.FSMEngine({ skillDir: target, workspaceDir, jobId: runId }); return engine; },
    text(name, content) { fs.writeFileSync(path.join(workspaceDir, name), content);
      return { path: name, media_type: 'text/markdown' }; }
  };
}

test('requires runtime 0.20.0 and both evidence capabilities', async t => {
  const f = await fixture(t);
  const req = f.engine.getManifest().runtime_requirements;
  const cap = await f.api.getRuntimeCapabilities();
  assert.equal(req.min_runtime_version, '0.20.0');
  assert.equal(f.api.evaluateRuntimeRequirements(req, cap).compatible, true);
  assert.equal(f.api.evaluateRuntimeRequirements(req, { ...cap, runtime_version: '0.19.0' }).compatible, false);
  for (const missing of ['evidence.local_registry', 'evidence.reference_submission']) {
    assert.ok(req.required_capabilities.includes(missing));
    assert.equal(f.api.evaluateRuntimeRequirements(req, {
      ...cap, capabilities: cap.capabilities.filter(c => c !== missing)
    }).compatible, false);
  }
});

async function compose(f) {
  for (const [signal, payload] of [
    ['INTAKE_READY', { repository: '.', release_version: '1.2.0', scope_refs: ['v1.1.0', 'HEAD'] }],
    ['COLLECTION_COMPLETE', { commits: [{ hash: 'abc', message: 'fix: preserve text' }] }],
    ['ENTRIES_CLASSIFIED', { changelog_entries: [{ category: 'Fixed', description: 'Preserve text', commit: 'abc' }] }]
  ]) assert.equal((await f.engine.handleSignal(signal, payload)).transitioned, true);
}

test('inline and referenced notes retain non-empty acceptance and rejection', async t => {
  for (const text of ['', '# Release 1.2.0\nFixed & checked.']) {
    for (const mode of ['inline', 'path', 'receipt']) await t.test(`${mode}: ${text ? 'non-empty' : 'empty'}`, async t => {
      const f = await fixture(t);
      await compose(f);
      let result;
      if (mode === 'inline') result = await f.engine.handleSignal('NOTES_COMPOSED', { release_notes: text });
      else {
        let binding = f.text('notes.md', text);
        if (mode === 'receipt') binding = { reference: f.api.importEvidence(f.engine, binding.path, binding.media_type) };
        ({ result } = await f.api.submitEvidenceSignal(f.engine, 'NOTES_COMPOSED', {}, { '/release_notes': binding }));
      }
      assert.equal(result.transitioned, text.length > 0);
      assert.equal(f.engine.getCurrentState(), text ? 'VALIDATE' : 'COMPOSE');
      if (text) {
        const projected = result.deliverablesWritten.find(p => p.endsWith('state.json'));
        assert.ok(projected);
        assert.equal(JSON.parse(fs.readFileSync(projected, 'utf8')).context.release_notes, text);
        const context = f.reopen().getContext();
        const resolved = new f.api.EvidenceResolver(f.engine.getManifest().evidence,
          () => f.engine.getEventStore().getEvidenceStore()).resolveContext(context);
        assert.equal(resolved.release_notes, text);
        assert.equal((await f.engine.handleSignal('VALIDATION_PASSED', { exit_code: 1 })).transitioned, false);
        assert.equal((await f.engine.handleSignal('VALIDATION_PASSED', { exit_code: 0 })).transitioned, true);
        assert.equal((await f.engine.handleSignal('USER_APPROVED', {})).transitioned, false);
        assert.equal((await f.engine.handleSignal('USER_APPROVED', { approved: true })).transitioned, true);
      }
    });
  }
});

test('missing, foreign and mismatched references cannot advance composition', async t => {
  const f = await fixture(t);
  await compose(f);
  await assert.rejects(f.api.submitEvidenceSignal(f.engine, 'NOTES_COMPOSED', {}, {
    '/release_notes': { path: 'missing.md', media_type: 'text/markdown' }
  }));
  const other = await fixture(t);
  const file = other.text('notes.md', '# Notes');
  const receipt = other.api.importEvidence(other.engine, file.path, file.media_type);
  const foreign = await f.api.submitEvidenceSignal(f.engine, 'NOTES_COMPOSED', {}, {
    '/release_notes': { reference: receipt }
  });
  assert.equal(foreign.result.transitioned, false);
  assert.match(foreign.result.refusalReason, /evidence|run|registration/i);
  await assert.rejects(f.api.submitEvidenceSignal(f.engine, 'NOTES_COMPOSED', {}, {
    '/release_notes': { path: 'notes.md', media_type: 'text/plain' }
  }));
  const local = f.text('notes.md', '# Current draft');
  const registered = f.api.importEvidence(f.engine, local.path, local.media_type);
  const tampered = await f.api.submitEvidenceSignal(f.engine, 'NOTES_COMPOSED', {}, {
    '/release_notes': { reference: { ...registered, byte_length: registered.byte_length + 1 } }
  });
  assert.equal(tampered.result.transitioned, false);
  assert.equal(f.engine.getCurrentState(), 'COMPOSE');
});

test('empty referenced notes retain the explicit composition failure route', async t => {
  for (const text of ['', '# Notes']) {
    for (const mode of ['inline', 'path']) {
      const f = await fixture(t);
      await compose(f);
      const result = mode === 'inline'
        ? await f.engine.handleSignal('COMPOSITION_FAILED', { release_notes: text })
        : (await f.api.submitEvidenceSignal(f.engine, 'COMPOSITION_FAILED', {}, {
          '/release_notes': f.text('notes.md', text)
        })).result;
      assert.equal(result.transitioned, text.length === 0);
      assert.equal(f.engine.getCurrentState(), text ? 'COMPOSE' : 'ERROR');
    }
  }
});
