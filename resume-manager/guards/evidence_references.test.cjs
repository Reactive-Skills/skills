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

test('letter references and inline resume review preserve voice, timeline and authenticity decisions', async t => {
  const api = await runtime;
  const observed = [];
  let probability = 1;
  // Controlled adapter proves input/threshold parity, not semantic model accuracy.
  api.JudgmentEngine.registerAdapter({ id: 'jev', supports: () => true,
    isConfigured: () => true, isAvailable: async () => true,
    async evaluate(req, ctx) {
      const selected = api.scopeJudgmentContext(ctx.context, req.contextPaths);
      observed.push({ selected: selected.context, includePayload: req.includePayload });
      return { verdict: probability >= 0.75, passed: probability >= 0.75,
        probability, confidence: 1, adapterName: 'jev', latencyMs: 0 };
    }
  });
  t.after(() => api.JudgmentEngine.reset());
  for (const state of ['DRAFTING', 'AUTHENTICITY_REVIEW']) {
    const drafting = state === 'DRAFTING';
    const signal = drafting ? 'MATERIALS_DRAFTED' : 'RESUME_AUTHENTIC';
    const key = drafting ? 'cover_letter_text' : 'resume_text';
    const text = drafting ? 'I built the import service.\n' : 'Engineer\nBuilt import checks by validating source records.\n';
    for (const mode of drafting ? ['inline', 'path', 'receipt'] : ['inline']) {
      for (const valid of [false, true]) await t.test(`${state} ${mode} counts ${valid}`, async t => {
        const f = await fixture(t, state);
        const payload = drafting ? { timeline_reconciled: true, unresolved_gap_count: valid ? 0 : 1, voice_register: 'plain' }
          : { authenticity_flag_count: valid ? 0 : 1, unverified_metric_count: 0 };
        probability = 0.75;
        let result;
        if (mode === 'inline') result = await f.engine.handleSignal(signal, { ...payload, [key]: text });
        else {
          let binding = f.text('review.md', text);
          if (mode === 'receipt') binding = { reference: api.importEvidence(f.engine, binding.path, binding.media_type) };
          ({ result } = await api.submitEvidenceSignal(f.engine, signal, payload, { ['/' + key]: binding }));
        }
        assert.equal(result.transitioned, valid);
        assert.equal(f.engine.getCurrentState(), valid ? (drafting ? 'AUTHENTICITY_REVIEW' : 'EXPORTING') : state);
        assert.deepEqual(observed.at(-1), { selected: drafting ? { cover_letter_text: text, voice_register: 'plain' } : { resume_text: text }, includePayload: false });
        if (valid) {
          f.reopen();
          const resolved = new api.EvidenceResolver(f.engine.getManifest().evidence,
            () => f.engine.getEventStore().getEvidenceStore()).resolveContext(f.engine.getContext());
          assert.equal(resolved[key], text);
        }
      });
      await t.test(`${state} ${mode} rejects below style threshold`, async t => {
        const f = await fixture(t, state);
        probability = 0.74;
        const payload = drafting ? { timeline_reconciled: true, unresolved_gap_count: 0, voice_register: 'plain' }
          : { authenticity_flag_count: 0, unverified_metric_count: 0 };
        if (mode === 'inline') await f.engine.handleSignal(signal, { ...payload, [key]: text });
        else {
          let binding = f.text('review.md', text);
          if (mode === 'receipt') binding = { reference: api.importEvidence(f.engine, binding.path, binding.media_type) };
          await api.submitEvidenceSignal(f.engine, signal, payload, { ['/' + key]: binding });
        }
        assert.equal(f.engine.getCurrentState(), 'DRAFTING');
      });
    }
  }
});


test('letter references and inline resume review preserve missing-count, chronology and unverified-metric refusals', async t => {
  const api = await runtime;
  // Isolate count guards from the independent style judgment and its retry routing.
  api.JudgmentEngine.registerAdapter({ id: 'jev', supports: () => true,
    isConfigured: () => true, isAvailable: async () => true,
    evaluate: async () => ({ verdict: true, passed: true, probability: 1,
      confidence: 1, adapterName: 'jev', latencyMs: 0 })
  });
  t.after(() => api.JudgmentEngine.reset());
  for (const [state, signal, key, payload] of [
    ['DRAFTING', 'MATERIALS_DRAFTED', 'cover_letter_text', { timeline_reconciled: false, unresolved_gap_count: 0 }],
    ['DRAFTING', 'MATERIALS_DRAFTED', 'cover_letter_text', { timeline_reconciled: true }],
    ['AUTHENTICITY_REVIEW', 'RESUME_AUTHENTIC', 'resume_text', { authenticity_flag_count: 0, unverified_metric_count: 1 }],
    ['AUTHENTICITY_REVIEW', 'RESUME_AUTHENTIC', 'resume_text', {}]
  ]) {
    const f = await fixture(t, state);
    const result = state === 'DRAFTING'
      ? (await f.api.submitEvidenceSignal(f.engine, signal, payload, { ['/' + key]: f.text('review.md', 'Current draft') })).result
      : await f.engine.handleSignal(signal, { ...payload, [key]: 'Current draft' });
    assert.equal(result.transitioned, false, JSON.stringify({state, payload, result}));
    assert.equal(f.engine.getCurrentState(), state);
  }
});

test('saved letter refuses a missing file and a forged receipt', async t => {
  const f = await fixture(t, 'DRAFTING');
  const payload = { timeline_reconciled: true, unresolved_gap_count: 0, voice_register: 'plain' };
  await assert.rejects(f.api.submitEvidenceSignal(f.engine, 'MATERIALS_DRAFTED', payload, {
    '/cover_letter_text': { path: 'missing.md', media_type: 'text/markdown' }
  }));
  const binding = f.text('letter.md', 'I built the import service.');
  const receipt = f.api.importEvidence(f.engine, binding.path, binding.media_type);
  const { result } = await f.api.submitEvidenceSignal(f.engine, 'MATERIALS_DRAFTED', payload, {
    '/cover_letter_text': { reference: { ...receipt, sha256: '0'.repeat(64) } }
  });
  assert.equal(result.transitioned, false);
  assert.equal(f.engine.getCurrentState(), 'DRAFTING');
});

test('inline flagged resume review retains both factual and style-count retry routes', async t => {
  for (const counts of [
    { authenticity_flag_count: 0, unverified_metric_count: 0 },
    { authenticity_flag_count: 1, unverified_metric_count: 0 },
    { authenticity_flag_count: 0, unverified_metric_count: 1 }
  ]) {
    const f = await fixture(t, 'AUTHENTICITY_REVIEW');
    const result = await f.engine.handleSignal('RESUME_FLAGGED', { ...counts, resume_text: 'Headline and flagged bullets' });
    const flagged = counts.authenticity_flag_count + counts.unverified_metric_count > 0;
    assert.equal(result.transitioned, flagged);
    assert.equal(f.engine.getCurrentState(), flagged ? 'DRAFTING' : 'AUTHENTICITY_REVIEW');
    const transitions = f.engine.getEventStore().query({ type: 'STATE_TRANSITION' });
    assert.equal(transitions.some(e => e.payload.signal === 'RESUME_FLAGGED'), flagged);
  }
});

test('measures a saved letter from file write through import, voice check and projection', async t => {
  // The controlled adapter refuses a missing letter, so each transition proves the check saw the text.
  const rows = await measurePath(t, { state: 'DRAFTING', signal: 'MATERIALS_DRAFTED', key: 'cover_letter_text',
    payload: { resume_path: 'resume.md', cover_letter_path: 'draft.md', timeline_reconciled: true,
      unresolved_gap_count: 0, timeline_audit_notes: 'reconciled', voice_register: 'plain' },
    expected: 'AUTHENTICITY_REVIEW', projection: 'snapshot.md' });
  for (const row of rows) {
    assert.match(row.projected, /draft\.md/);
    t.diagnostic(JSON.stringify({ ...row, projected: undefined }));
  }
  const [inline, ref, receipt] = rows;
  assert.deepEqual([inline.calls, ref.calls, receipt.calls], [1, 1, 2]);
  assert.ok(ref.requestBytes < inline.requestBytes && receipt.requestBytes < inline.requestBytes);
  assert.equal(inline.blobReads + inline.receiptReads, 0);
  assert.ok(ref.blobReads > 0 && ref.receiptReads > 0);
  assert.equal(ref.projectionWriteBytes, inline.projectionWriteBytes);
});
