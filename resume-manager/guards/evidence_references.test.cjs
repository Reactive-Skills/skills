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

test('references preserve voice, timeline and resume authenticity decisions', async t => {
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
    for (const mode of ['inline', 'path', 'receipt']) {
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


test('references preserve missing-count, chronology and unverified-metric refusals', async t => {
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
    const binding = f.text('review.md', 'Current draft');
    const { result } = await f.api.submitEvidenceSignal(f.engine, signal, payload, { ['/' + key]: binding });
    assert.equal(result.transitioned, false, JSON.stringify({state, payload, result}));
    assert.equal(f.engine.getCurrentState(), state);
  }
});

test('resume review refuses a missing file and a forged receipt', async t => {
  const f = await fixture(t, 'AUTHENTICITY_REVIEW');
  const payload = { authenticity_flag_count: 0, unverified_metric_count: 0 };
  await assert.rejects(f.api.submitEvidenceSignal(f.engine, 'RESUME_AUTHENTIC', payload, {
    '/resume_text': { path: 'missing.md', media_type: 'text/markdown' }
  }));
  const binding = f.text('review.md', 'Headline and bullets');
  const receipt = f.api.importEvidence(f.engine, binding.path, binding.media_type);
  const { result } = await f.api.submitEvidenceSignal(f.engine, 'RESUME_AUTHENTIC', payload, {
    '/resume_text': { reference: { ...receipt, sha256: '0'.repeat(64) } }
  });
  assert.equal(result.transitioned, false);
  assert.equal(f.engine.getCurrentState(), 'AUTHENTICITY_REVIEW');
});

test('flagged resume references retain both factual and style-count retry routes', async t => {
  for (const counts of [
    { authenticity_flag_count: 0, unverified_metric_count: 0 },
    { authenticity_flag_count: 1, unverified_metric_count: 0 },
    { authenticity_flag_count: 0, unverified_metric_count: 1 }
  ]) {
    for (const mode of ['inline', 'path']) {
      const f = await fixture(t, 'AUTHENTICITY_REVIEW');
      const text = 'Headline and flagged bullets';
      const result = mode === 'inline'
        ? await f.engine.handleSignal('RESUME_FLAGGED', { ...counts, resume_text: text })
        : (await f.api.submitEvidenceSignal(f.engine, 'RESUME_FLAGGED', counts, {
          '/resume_text': f.text('review.md', text)
        })).result;
      const flagged = counts.authenticity_flag_count + counts.unverified_metric_count > 0;
      assert.equal(result.transitioned, flagged);
      assert.equal(f.engine.getCurrentState(), flagged ? 'DRAFTING' : 'AUTHENTICITY_REVIEW');
      const transitions = f.engine.getEventStore().query({ type: 'STATE_TRANSITION' });
      assert.equal(transitions.some(e => e.payload.signal === 'RESUME_FLAGGED'), flagged);
    }
  }
});
