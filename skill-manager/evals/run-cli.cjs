#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn, spawnSync } = require('node:child_process');
const { computeSkillDigest, computeFixtureDigest, objectDigest, sha256, taskTemplate, resolveTask } = require('./validate-evals.cjs');

const root = __dirname;
const defaultRuntime = 'C:/Users/brand/.codex/worktrees/skill-cli-signals-20261002/apps/axi/dist/cli/index.js';
const codex = 'C:/Users/brand/AppData/Local/Programs/OpenAI/Codex/bin/codex.exe';
const rtkDir = 'C:/Users/brand/AppData/Local/Microsoft/WinGet/Packages/rtk-ai.rtk_Microsoft.Winget.Source_8wekyb3d8bbwe';
const nodeDir = 'C:/Users/brand/AppData/Roaming/nvm/v24.16.0';
const hostHome = os.homedir();
const replySchema = {
  type: 'object', additionalProperties: false,
  properties: {
    status: { type: 'string', enum: ['AWAITING_APPROVAL', 'COMPLETE', 'BLOCKED'] },
    files_to_write: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    findings: { type: 'array', items: { type: 'string' } },
  }, required: ['status', 'files_to_write', 'summary', 'findings'],
};

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`);
}

function inside(base, relative) {
  if (typeof relative !== 'string' || path.isAbsolute(relative) || /^[A-Za-z]:/.test(relative)) throw new Error('Expected workspace-relative file');
  const target = path.resolve(base, relative);
  const rel = path.relative(base, target);
  if (!rel || rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw new Error('Path escapes workspace');
  return target;
}

function snapshot(workspace) {
  const result = {};
  function visit(directory, prefix) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = `${prefix}/${entry.name}`;
      const full = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Unexpected fixture link: ${relative}`);
      if (entry.isDirectory()) visit(full, relative);
      else result[relative] = sha256(fs.readFileSync(full));
    }
  }
  for (const source of ['source-a', 'source-b', 'distribution']) visit(path.join(workspace, source), source);
  for (const filename of ['sources.json', 'attached-note.txt']) if (fs.existsSync(path.join(workspace, filename))) result[filename] = sha256(fs.readFileSync(path.join(workspace, filename)));
  return result;
}

function changes(before, after) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].sort().filter(file => before[file] !== after[file]);
}

function measuredTokens(phases) {
  if (!phases.length || !phases[0].session || phases.some(phase => phase.session !== phases[0].session)) throw new Error('Token totals require one verified session');
  const usage = phases.at(-1).usage.at(-1);
  if (!usage || !Number.isInteger(usage.input_tokens) || !Number.isInteger(usage.output_tokens)) return null;
  // Codex resume reports cumulative thread usage, including previous phases.
  return { input: usage.input_tokens, output: usage.output_tokens, measurement: 'host', source: 'Final cumulative Codex CLI turn.completed usage for the single trial session' };
}

function approveManifest(scenarioId, proposed, workspace) {
  if (!Array.isArray(proposed) || proposed.length === 0 || new Set(proposed).size !== proposed.length) return { approved: false, reason: 'Missing or duplicate file manifest' };
  const files = proposed.map(file => {
    const full = path.isAbsolute(file) ? path.resolve(file) : inside(workspace, file);
    return path.relative(workspace, full).replaceAll('\\', '/');
  });
  const valid = files.every(file => {
    if (file.includes('..') || path.isAbsolute(file)) return false;
    if (scenarioId === 'update-source') return file === 'source-a/eval-update/states/review.md';
    if (scenarioId === 'reference-navigation') return file === 'source-a/eval-reference/states/work/review.md';
    if (scenarioId === 'create-hsm') return /^source-a\/eval-report\/(?:skill\.yaml|SKILL\.md|README\.md|CONTEXT\.md|STATECHART\.md|states\/(?:init|done|cancelled|work)\.md|states\/work\/(?:collect|review|_parent)\.md|guards\/\.gitkeep|templates\/[a-z_-]+\.md\.hbs)$/.test(file);
    return false;
  });
  return { approved: valid, files, reason: valid ? 'Exact scenario manifest approved after presentation' : 'Manifest exceeds the fixed scenario boundary' };
}

function prepareTrial(spec, scenario, checkpoint, arm, repetition, runtime = defaultRuntime) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), `skill-eval-${scenario.id}-${arm}-`));
  const workspace = path.join(base, 'workspace');
  const fixtureHome = path.join(workspace, 'home');
  const bundleRoot = path.join(root, 'results/bundles', checkpoint);
  if (!fs.existsSync(bundleRoot)) {
    const source = path.resolve(root, '..');
    for (const relative of computeSkillDigest(source).files) {
      const destination = path.join(bundleRoot, relative);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(path.join(source, relative), destination);
    }
  }
  const bundle = computeSkillDigest(bundleRoot);
  const manager = path.join(workspace, 'frozen-manager');
  for (const relative of bundle.files) {
    const destination = path.join(manager, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(bundleRoot, relative), destination);
  }
  const seed = JSON.parse(fs.readFileSync(path.join(root, scenario.fixture_path, 'seed.json'), 'utf8'));
  for (const [relative, content] of Object.entries(seed.files)) write(inside(workspace, relative), relative === 'sources.json' ? content.split('{{WORKSPACE}}').join(workspace.replaceAll('\\', '/')) : content);
  fs.mkdirSync(path.join(fixtureHome, '.agents'), { recursive: true });
  fs.copyFileSync(path.join(workspace, 'sources.json'), path.join(fixtureHome, '.agents/sources.json'));
  const bin = path.join(workspace, 'bin');
  write(path.join(bin, 'reactive-skills-axi.cmd'), `@echo off\r\n"${process.execPath}" "${runtime}" %*\r\n`);
  write(path.join(base, 'reply-schema.json'), replySchema);
  const runtimeCommand = `rtk node "${runtime.replaceAll('\\', '/')}"`;
  const substitutions = { WORKSPACE: workspace.replaceAll('\\', '/'), MANAGER: manager.replaceAll('\\', '/'), RUNTIME: runtimeCommand };
  const task = resolveTask(spec, scenario, arm, substitutions);
  write(path.join(base, 'task.txt'), task);
  return { id: `${checkpoint}-${spec.coverage.profiles[0].id}-${scenario.id}-${arm}-${repetition}`, checkpoint, arm, repetition, scenario_id: scenario.id, base, workspace, fixtureHome, manager, bin, runtime, substitutions, task,
    bundle: { digest: bundle.digest, bundle_path: `results/bundles/${checkpoint}`, version: fs.readFileSync(path.join(bundleRoot, 'skill.yaml'), 'utf8').match(/^version:\s*(\S+)/m)[1] },
    spec_digest: objectDigest(spec), fixture_digest: computeFixtureDigest(path.join(root, scenario.fixture_path)), task_template_digest: sha256(taskTemplate(spec, scenario)), resolved_task_digest: sha256(task), before: snapshot(workspace), phases: [] };
}

function buildArgs(trial, output, resumeId) {
  const args = ['exec'];
  if (resumeId) args.push('resume', resumeId);
  args.push('--ignore-user-config', '--ignore-rules', '--skip-git-repo-check', '--json', '-m', 'gpt-6.1-sol',
    '-c', 'model_reasoning_effort="xhigh"', '-c', 'windows.sandbox="unelevated"', '-c', 'approval_policy="never"',
    '-c', 'sandbox_mode="workspace-write"', '-c', 'sandbox_workspace_write.exclude_tmpdir_env_var=true', '-c', 'sandbox_workspace_write.exclude_slash_tmp=true',
    '-c', 'project_doc_max_bytes=0', '-c', `shell_environment_policy.set.USERPROFILE=${JSON.stringify(trial.fixtureHome)}`,
    '-c', `shell_environment_policy.set.HOME=${JSON.stringify(trial.fixtureHome)}`,
    '--disable', 'apps', '--disable', 'plugins', '--disable', 'browser_use', '--disable', 'computer_use', '--disable', 'multi_agent',
    '--output-schema', path.join(trial.base, 'reply-schema.json'), '-o', output);
  if (!resumeId) args.push('-C', trial.workspace);
  args.push('-');
  return args;
}

function childEnvironment(trial) {
  const env = { ...process.env, CODEX_HOME: path.join(hostHome, '.codex') };
  const key = Object.keys(env).find(name => name.toLowerCase() === 'path');
  const prior = env[key] || '';
  for (const name of Object.keys(env)) if (name.toLowerCase() === 'path' || /(?:API_KEY|TOKEN|SECRET|PASSWORD)$/.test(name)) delete env[name];
  env.PATH = [trial.bin, rtkDir, nodeDir, prior].join(path.delimiter);
  return env;
}

function runPhase(trial, prompt, resumeId) {
  const phaseNumber = trial.phases.length + 1;
  const output = path.join(trial.base, `phase-${phaseNumber}.json`);
  const log = path.join(trial.base, `phase-${phaseNumber}.jsonl`);
  return new Promise((resolve, reject) => {
    const child = spawn(codex, buildArgs(trial, output, resumeId), { cwd: trial.workspace, env: childEnvironment(trial), windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => {
      write(log, stdout);
      write(path.join(trial.base, `phase-${phaseNumber}.stderr.txt`), stderr);
      const events = stdout.split(/\r?\n/).filter(Boolean).map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
      const session = events.find(event => event.type === 'thread.started')?.thread_id || resumeId;
      let reply = null;
      if (fs.existsSync(output)) { try { reply = JSON.parse(fs.readFileSync(output, 'utf8')); } catch {} }
      const phase = { number: phaseNumber, exit_code: code, session, reply, usage: events.filter(event => event.type === 'turn.completed').map(event => event.usage), log, after: snapshot(trial.workspace) };
      trial.phases.push(phase);
      resolve(phase);
    });
    child.stdin.end(prompt);
  });
}

async function runTrial(options) {
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'evals.json'), 'utf8'));
  const scenario = spec.scenarios.find(item => item.id === options.scenario);
  if (!scenario || !['no-skill', 'with-skill'].includes(options.arm) || !Number.isInteger(options.repetition) || options.repetition < 1 || options.repetition > spec.repetitions) throw new Error('Invalid scenario, arm, or repetition');
  if (!/^[a-z0-9-]+$/.test(options.checkpoint || '')) throw new Error('Safe checkpoint name required');
  const trial = prepareTrial(spec, scenario, options.checkpoint, options.arm, options.repetition, options.runtime);
  const report = path.join(root, 'results', options.checkpoint, `${trial.id}.trial.json`);
  if (fs.existsSync(report)) throw new Error('Trial already recorded; never overwrite prior attempts');
  console.log(JSON.stringify({ trial: trial.id, state: 'STARTED', workspace: trial.workspace }));
  write(report, { ...trial, state: 'RUNNING' });
  const first = await runPhase(trial, trial.task);
  const earlyChanges = changes(trial.before, first.after);
  trial.preapproval_changes = earlyChanges;
  if (earlyChanges.length > 0) trial.stop_reason = 'Task files changed before approval';
  else if (first.exit_code !== 0 || !first.reply) trial.stop_reason = 'Executor did not produce a structured response';
  else if (first.reply.status === 'AWAITING_APPROVAL') {
    const decision = approveManifest(scenario.id, first.reply.files_to_write, trial.workspace);
    trial.approval = { ...decision, timestamp: new Date().toISOString(), before: first.after };
    if (decision.approved && first.session) {
      const approval = `Approved only these workspace-relative task files: ${JSON.stringify(decision.files)}.\n${spec.approval_script}\nDo not change other task files or distributions, install tools, configure providers, or sync. Runtime-owned ledger/projection writes inside this workspace remain allowed. Continue the requested operation and verify the observable results.`;
      trial.approval.prompt = approval;
      await runPhase(trial, approval, first.session);
    } else trial.stop_reason = first.session ? decision.reason : 'Missing session identity prevents an approved continuation';
  }
  trial.after = snapshot(trial.workspace);
  trial.changes = changes(trial.before, trial.after);
  trial.state = 'AWAITING_INDEPENDENT_ASSERTION_REVIEW';
  trial.finished_at = new Date().toISOString();
  write(report, trial);
  console.log(JSON.stringify({ trial: trial.id, state: trial.state, stop_reason: trial.stop_reason, final_status: trial.phases.at(-1)?.reply?.status, changes: trial.changes, report }));
  return trial;
}

module.exports = { inside, snapshot, changes, measuredTokens, approveManifest, prepareTrial, buildArgs, runPhase, runTrial };
if (require.main === module) {
  const options = {};
  for (let i = 2; i < process.argv.length; i += 2) options[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
  options.repetition = Number(options.repetition);
  runTrial(options).catch(error => { console.error(error.message); process.exitCode = 1; });
}
