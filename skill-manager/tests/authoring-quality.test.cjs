'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { checkAuthoringQuality } = require('../scripts/authoring-quality.cjs');
const packageRoot = path.resolve(__dirname, '..');
const seed = path.join(__dirname, 'fixtures/authoring-quality/nested');

function fixture(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'authoring-quality-'));
  const root = path.join(temp, 'skill');
  fs.cpSync(seed, root, { recursive: true });
  t.after(() => {
    assert.ok(path.resolve(temp).startsWith(path.resolve(os.tmpdir()) + path.sep));
    fs.rmSync(temp, { recursive: true, force: true });
  });
  return { temp, root, write: (relative, text) => {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
  } };
}

function snapshot(root) {
  const records = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { records.push([path.relative(root, file), 'directory']); walk(file); }
      else records.push([path.relative(root, file), crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]);
    }
  }
  walk(root);
  return records;
}

test('nested state references resolve from manifest root and containing document', t => {
  const { root } = fixture(t);
  const result = checkAuthoringQuality(root);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
  assert.ok(result.measurements.some(item => item.path === 'states/work/collect.md' && item.whitespace_words > 0));
});

test('broken inline, reference-style, and manifest targets report exact lines', t => {
  const { root, write } = fixture(t);
  write('SKILL.md', '# Fixture\n[missing](references/absent.md)\n[policy][rule]\n[rule]: absent.md\n');
  write('skill.yaml', 'states:\n  WORK:\n    prompt_template: states/work/absent.md\n');
  const result = checkAuthoringQuality(root);
  assert.equal(result.errors.length, 4);
  assert.ok(result.errors.every(item => item.code === 'BROKEN_REFERENCE' && item.message.includes('ENOENT')));
  assert.ok(result.errors.some(item => item.path === 'SKILL.md' && item.line === 2));
  assert.ok(result.errors.some(item => item.path === 'skill.yaml' && item.line === 3));
});

test('examples, placeholders, URLs, comments, and fragments do not become file errors', t => {
  const { root, write } = fixture(t);
  write('SKILL.md', '# Fixture\n```md\n[example](absent.md)\n```\n~~~\n[example](absent.md)\n~~~\n`[example](absent.md)`\n<!-- [example](absent.md) -->\n[web](https://example.invalid/a)\n[mail](mailto:fake@example.invalid)\n[anchor](#not-checked)\n[template]({{context.target}}/missing.md)\n');
  write('skill.yaml', 'description: |-\n  prompt_template: absent.md\nstates:\n  WORK:\n    prompt_template: "{{context.target}}/missing.md"\n');
  assert.deepEqual(checkAuthoringQuality(root).errors, []);
});

test('Windows separators, spaces, fragments, parentheses, and code link labels resolve', t => {
  const { root, write } = fixture(t);
  write('references/policy (v2).md', '# Policy\n');
  write('SKILL.md', '[`policy`](references/policy.md)\n[windows](references\\policy.md)\n[space](<references/policy (v2).md>)\n[encoded](references/policy%20(v2).md#policy)\n[title](references/policy.md "Policy title")\n');
  write('skill.yaml', "prompt_template: 'states\\work\\collect.md'\n");
  assert.deepEqual(checkAuthoringQuality(root).errors, []);
});

test('incomplete Markdown and spaced Handlebars examples do not invent missing files', t => {
  const { root, write } = fixture(t);
  write('SKILL.md', '[unfinished](absent.md\n[template](<{{ context.target }}/missing.md>)\n');
  assert.deepEqual(checkAuthoringQuality(root).errors, []);
});

test('image badges also check their outer file link', t => {
  const { root, write } = fixture(t);
  write('SKILL.md', '[![badge](missing.svg)](missing.md)\n');
  const result = checkAuthoringQuality(root);
  assert.equal(result.errors.length, 2);
  assert.ok(result.errors.every(item => item.code === 'BROKEN_REFERENCE'));
});

test('external dependencies are advisory and never read', t => {
  const { root, write } = fixture(t);
  write('SKILL.md', '[outside](../private.md)\n[windows](C:\\private\\secret.md)\n[unix](/private/secret.md)\n');
  const original = fs.statSync;
  fs.statSync = (file, ...args) => {
    assert.ok(path.resolve(file).startsWith(root), 'stat outside package');
    return original(file, ...args);
  };
  try {
    const result = checkAuthoringQuality(root);
    assert.deepEqual(result.errors, []);
    assert.equal(result.warnings.filter(item => item.code === 'EXTERNAL_DEPENDENCY').length, 3);
  } finally { fs.statSync = original; }
});

test('escaping directory links stay advisory without scanning outside content', t => {
  const { root, temp } = fixture(t);
  const outside = path.join(temp, 'outside');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, 'private.md'), '[bad](missing.md)');
  fs.symlinkSync(outside, path.join(root, 'references/external'), process.platform === 'win32' ? 'junction' : 'dir');
  const result = checkAuthoringQuality(root);
  assert.deepEqual(result.errors, []);
  assert.ok(result.warnings.some(item => item.code === 'EXTERNAL_DEPENDENCY'));
  assert.ok(result.measurements.every(item => !item.path.includes('external')));
});

test('missing inputs and non-file prompt targets are definite errors', t => {
  const { root, write, temp } = fixture(t);
  assert.equal(checkAuthoringQuality(path.join(temp, 'missing')).errors[0].code, 'UNREADABLE_INPUT');
  fs.unlinkSync(path.join(root, 'SKILL.md'));
  write('skill.yaml', 'prompt_template: states/work\n');
  const result = checkAuthoringQuality(root);
  assert.ok(result.errors.some(item => item.path === 'SKILL.md' && item.code === 'UNREADABLE_INPUT'));
  assert.ok(result.errors.some(item => item.path === 'skill.yaml' && item.code === 'BROKEN_REFERENCE'));
});

test('long supporting documents need working contents or section navigation', t => {
  const { root, write } = fixture(t);
  const padding = 'Evidence line.\n'.repeat(105);
  write('references/long.md', '# Long\n' + padding);
  assert.ok(checkAuthoringQuality(root).warnings.some(item => item.path === 'references/long.md' && item.code === 'MISSING_CONTENTS'));
  write('references/long.md', '# Long\n## 📖 CONTENTS\n- [Evidence](#evidence)\n## Evidence\n' + padding);
  assert.deepEqual(checkAuthoringQuality(root).warnings, []);
  write('references/long.md', '# Long\n- [First](#first)\n- [Second](#-second)\n## First\n## 🧭 Second\n' + padding);
  assert.deepEqual(checkAuthoringQuality(root).warnings, []);
  write('references/long.md', '# Long\n## Contents\n- [Missing](#missing)\n' + padding);
  assert.equal(checkAuthoringQuality(root).warnings[0].code, 'MISSING_CONTENTS');
});

test('body measurement excludes frontmatter and state words are measurements only', t => {
  const { root, write } = fixture(t);
  const frontmatter = '---\n' + 'metadata: example\n'.repeat(510) + '---\n';
  write('SKILL.md', frontmatter + '# Short\n');
  write('states/work/collect.md', 'word '.repeat(250));
  let result = checkAuthoringQuality(root);
  assert.deepEqual(result.warnings, []);
  assert.equal(result.measurements.find(item => item.path === 'SKILL.md').body_lines, 1);
  assert.equal(result.measurements.find(item => item.path === 'states/work/collect.md').whitespace_words, 250);
  write('SKILL.md', frontmatter + 'Body.\n'.repeat(501));
  result = checkAuthoringQuality(root);
  assert.equal(result.warnings[0].code, 'LARGE_SKILL_BODY');
});

test('nonliteral manifest values defer to the actual runtime without schema parsing', t => {
  const { root, write } = fixture(t);
  write('skill.yaml', 'prompt_template: >-\n  states/work/collect.md\n');
  const result = checkAuthoringQuality(root);
  assert.deepEqual(result.errors, []);
  assert.equal(result.warnings[0].code, 'DYNAMIC_PROMPT_REFERENCE');
});

test('standalone package works from unrelated CWD with identical export/CLI results and no side effects', t => {
  const { root, temp, write } = fixture(t);
  const standalone = path.join(temp, 'standalone');
  fs.cpSync(packageRoot, standalone, { recursive: true, filter: source => !['evals', 'tests', 'node_modules', '.reactive'].includes(path.basename(source)) });
  const unrelated = path.join(temp, 'unrelated');
  fs.mkdirSync(unrelated);
  const guard = path.join(temp, 'deny-network.cjs');
  fs.writeFileSync(guard, `const Module=require('node:module');const original=Module._load;Module._load=function(id,...args){if(/^(node:)?(https?|net|tls|dns|child_process)$/.test(id))throw Error('Forbidden network/process dependency');if(!Module.isBuiltin(id)&&!require('node:path').isAbsolute(id)&&!id.startsWith('.'))throw Error('Nonbuiltin dependency');return original.call(this,id,...args)};global.fetch=()=>{throw Error('Forbidden fetch')};`);
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/API_KEY|TOKEN|SECRET|PASSWORD|NODE_OPTIONS/i.test(key)));
  const before = snapshot(temp);
  const expected = checkAuthoringQuality(root);
  const cli = spawnSync(process.execPath, ['--require', guard, path.join(standalone, 'scripts/authoring-quality.cjs'), path.relative(unrelated, root), '--json'], { cwd: unrelated, env, encoding: 'utf8' });
  assert.equal(cli.status, 0, cli.stderr);
  assert.deepEqual(JSON.parse(cli.stdout), expected);
  assert.deepEqual(snapshot(temp), before);
  write('references/long.md', 'Long.\n'.repeat(110));
  const advisory = spawnSync(process.execPath, [path.join(standalone, 'scripts/authoring-quality.cjs'), root], { cwd: unrelated, env, encoding: 'utf8' });
  assert.equal(advisory.status, 0);
  assert.equal(JSON.parse(advisory.stdout).warnings[0].code, 'MISSING_CONTENTS');
  write('SKILL.md', '[broken](missing.md)\n');
  const broken = spawnSync(process.execPath, [path.join(standalone, 'scripts/authoring-quality.cjs'), root, '--json'], { cwd: unrelated, env, encoding: 'utf8' });
  assert.equal(broken.status, 1);
  assert.equal(JSON.parse(broken.stdout).errors[0].code, 'BROKEN_REFERENCE');
});

test('registry defaults to manager only, opt-in preserves errors, and missing helper is explicit', t => {
  const { temp } = fixture(t);
  const registry = path.join(temp, 'registry');
  fs.mkdirSync(path.join(registry, 'scripts'), { recursive: true });
  fs.copyFileSync(path.join(packageRoot, '../scripts/validate-skills.js'), path.join(registry, 'scripts/validate-skills.js'));
  const pointer = fs.readFileSync(path.join(packageRoot, 'templates/reactive_bootloader.md.hbs'), 'utf8');
  for (const name of ['skill-manager', 'nested']) {
    const target = path.join(registry, name);
    fs.cpSync(seed, target, { recursive: true });
    fs.writeFileSync(path.join(target, 'skill.yaml'), fs.readFileSync(path.join(seed, 'skill.yaml'), 'utf8').replace('name: nested', 'name: ' + name));
    fs.appendFileSync(path.join(target, 'SKILL.md'), '\n' + pointer.replaceAll('{{skill_name}}', name));
  }
  const manager = path.join(registry, 'skill-manager');
  fs.mkdirSync(path.join(manager, 'templates'));
  fs.writeFileSync(path.join(manager, 'templates/reactive_bootloader.md.hbs'), pointer);
  fs.mkdirSync(path.join(manager, 'scripts'));
  const helper = path.join(manager, 'scripts/authoring-quality.cjs');
  fs.copyFileSync(path.join(packageRoot, 'scripts/authoring-quality.cjs'), helper);
  fs.appendFileSync(path.join(registry, 'nested/SKILL.md'), '\n[broken](missing.md)\n');
  const run = args => spawnSync(process.execPath, [path.join(registry, 'scripts/validate-skills.js'), '--no-runtime', ...args], { cwd: temp, encoding: 'utf8' });
  assert.equal(run([]).status, 0);
  const optedIn = run(['nested', '--authoring-quality']);
  assert.equal(optedIn.status, 1);
  assert.match(optedIn.stdout, /BROKEN_REFERENCE/);
  fs.appendFileSync(path.join(manager, 'SKILL.md'), '\n[broken](missing.md)\n');
  assert.equal(run(['skill-manager']).status, 1);
  fs.unlinkSync(helper);
  const missing = run(['skill-manager']);
  assert.equal(missing.status, 1);
  assert.match(missing.stdout, /checker is missing or unreadable/);
});
