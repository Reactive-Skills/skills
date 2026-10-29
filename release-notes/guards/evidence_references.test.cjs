const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const { execSync, execFileSync } = require('node:child_process');
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

// Count host-visible work for one saved 2,400-byte draft from file write to projection.
const ioPreload = `import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
const counts = { sourceReads: 0, blobReads: 0, receiptReads: 0, projectionWrites: 0, projectionWriteBytes: 0 };
const kinds = new Map(), open = fs.openSync, read = fs.readSync, close = fs.closeSync, write = fs.writeFileSync;
fs.openSync = (file, ...a) => { const fd = open(file, ...a), p = String(file);
  if (p.endsWith('draft.md')) kinds.set(fd, 'source');
  else if (p.includes('evidence-v1')) kinds.set(fd, p.endsWith('.receipt.json') ? 'receipt' : 'blob');
  return fd; };
fs.readSync = (fd, ...a) => { const n = read(fd, ...a); if (n > 0 && kinds.has(fd)) counts[kinds.get(fd) + 'Reads']++; return n; };
fs.closeSync = (fd, ...a) => { kinds.delete(fd); return close(fd, ...a); };
fs.writeFileSync = (file, data, ...a) => { if (String(file).includes('.docs')) {
  counts.projectionWrites++; counts.projectionWriteBytes += Buffer.byteLength(data); } return write(file, data, ...a); };
syncBuiltinESMExports();
const api = await import(process.env.PILOT_RUNTIME_URL);
api.JudgmentEngine.registerAdapter({ id: 'jev', supports: () => true, isConfigured: () => true, isAvailable: async () => true,
  async evaluate(req, ctx) { const scoped = api.scopeJudgmentContext(ctx.context, req.contextPaths).context;
    if (!Object.values(scoped).every(v => typeof v === 'string' && v.length > 0)) throw new Error('Missing judgment input');
    return { verdict: true, passed: true, probability: 1, confidence: 1, adapterName: 'jev', latencyMs: 0 }; } });
process.on('exit', () => write(process.env.PILOT_IO_LOG, JSON.stringify(counts)));
`;

async function measurePath(t, { state, signal, key, payload, expected, projection }) {
  const cli = axiRequire.resolve('@reactive-skills/axi/' + axiRequire('@reactive-skills/axi/package.json').bin['reactive-skills-axi']);
  const text = 'Built source checks by validating records.\n'.repeat(60).slice(0, 2400);
  const rows = [];
  for (const mode of ['inline', 'path', 'receipt']) {
    const workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'evidence-measure-'));
    const tools = fs.mkdtempSync(path.join(os.tmpdir(), 'evidence-measure-tools-'));
    t.after(() => { for (const d of [workspaceDir, tools]) fs.rmSync(d, { recursive: true, force: true }); });
    const skill = path.join(workspaceDir, path.basename(skillDir));
    fs.cpSync(skillDir, skill, { recursive: true });
    const manifest = path.join(skill, 'skill.yaml');
    fs.writeFileSync(manifest, fs.readFileSync(manifest, 'utf8').replace(/^initial_state:.*$/m, `initial_state: ${state}`));
    fs.writeFileSync(path.join(tools, 'io.mjs'), ioPreload);
    const log = path.join(tools, 'io.json');
    const env = { PATH: process.env.PATH, HOME: workspaceDir, WORKSPACE_DIR: workspaceDir, PILOT_IO_LOG: log,
      PILOT_RUNTIME_URL: pathToFileURL(axiRequire.resolve('@reactive-skills/runtime')).href };
    const totals = { calls: 0, requestBytes: 0, responseBytes: 0, sourceReads: 0, blobReads: 0, receiptReads: 0, projectionWrites: 0, projectionWriteBytes: 0 };
    const call = (args, into = totals) => {
      const out = execFileSync(process.execPath, ['--import', pathToFileURL(path.join(tools, 'io.mjs')).href, cli, ...args], { env, encoding: 'utf8' });
      if (into) {
        into.calls++;
        // The temporary skill path is the same for every shape and machine-specific, so it is not counted.
        into.requestBytes += args.filter(a => a !== skill).reduce((n, a) => n + Buffer.byteLength(a), 0);
        into.responseBytes += Buffer.byteLength(out);
        for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(log, 'utf8')))) into[k] += v;
      }
      return out;
    };
    // Starting the run is identical for every shape and is not counted.
    const run = JSON.parse(call(['invoke', skill, '--job', 'measure', '--output', 'compact-v1'], null)).run_id;
    fs.writeFileSync(path.join(workspaceDir, 'draft.md'), text);
    let body = { ...payload }, evidence;
    if (mode === 'inline') { body[key] = fs.readFileSync(path.join(workspaceDir, 'draft.md'), 'utf8'); totals.sourceReads++; }
    else {
      evidence = { path: 'draft.md', media_type: 'text/markdown' };
      if (mode === 'receipt') evidence = { reference: JSON.parse(call(['evidence', skill, 'import', 'draft.md', '--media-type', 'text/markdown', '--job', run])).reference };
    }
    const response = JSON.parse(call(['emit', skill, signal, '--job', run, '--output', 'compact-v1', '--payload', JSON.stringify(body),
      ...(evidence ? ['--evidence', JSON.stringify({ ['/' + key]: evidence })] : [])]));
    assert.equal(response.transitioned, true);
    assert.equal(response.view.state, expected);
    // The host reads the actual projection once to verify it, in every shape.
    const projected = fs.readFileSync(response.deliverables.find(p => p.endsWith(projection)), 'utf8');
    let reread;
    if (mode === 'receipt') {
      // Seeing the saved text again needs an explicit read; inline hosts already hold it.
      reread = { calls: 0, requestBytes: 0, responseBytes: 0, sourceReads: 0, blobReads: 0, receiptReads: 0, projectionWrites: 0, projectionWriteBytes: 0 };
      assert.ok(call(['evidence', skill, 'read', JSON.stringify(evidence.reference), '--job', run], reread).includes(text.slice(0, 40)));
    }
    rows.push({ mode, ...totals, reread, projected });
  }
  return rows;
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

test('inline empty notes retain the explicit composition failure route', async t => {
  for (const text of ['', '# Notes']) {
    const f = await fixture(t);
    await compose(f);
    const result = await f.engine.handleSignal('COMPOSITION_FAILED', { release_notes: text });
    assert.equal(result.transitioned, text.length === 0);
    assert.equal(f.engine.getCurrentState(), text ? 'COMPOSE' : 'ERROR');
  }
});

test('measures saved notes from file write through import, guard and projection', async t => {
  const rows = await measurePath(t, { state: 'COMPOSE', signal: 'NOTES_COMPOSED', key: 'release_notes',
    payload: {}, expected: 'VALIDATE', projection: 'state.json' });
  for (const row of rows) {
    assert.equal(JSON.parse(row.projected).context.release_notes.length, 2400);
    t.diagnostic(JSON.stringify({ ...row, projected: undefined }));
  }
  const [inline, ref, receipt] = rows;
  assert.deepEqual([inline.calls, ref.calls, receipt.calls], [1, 1, 2]);
  assert.ok(ref.requestBytes < inline.requestBytes && receipt.requestBytes < inline.requestBytes);
  assert.equal(inline.blobReads + inline.receiptReads, 0);
  assert.ok(ref.blobReads > 0 && ref.receiptReads > 0);
  assert.equal(ref.projectionWriteBytes, inline.projectionWriteBytes);
});
