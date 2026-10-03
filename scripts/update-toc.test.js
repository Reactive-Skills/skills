'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SCRIPT = path.join(__dirname, 'update-toc.js');

// Builds a throwaway repository layout so the CLI runs exactly as it does in a checkout.
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'update-toc-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.copyFileSync(SCRIPT, path.join(root, 'scripts', 'update-toc.js'));
  fs.mkdirSync(path.join(root, 'demo'));
  fs.writeFileSync(path.join(root, 'demo', 'skill.yaml'), 'name: demo\nversion: 1.0.0\nschema_version: 2.2.0\ndescription: Demo skill\n');
  fs.writeFileSync(path.join(root, 'README.md'), '# Skills\n\n<!-- TOC_START -->\n<!-- TOC_END -->\n\nFooter\n');
  return root;
}

const run = (root, ...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'update-toc.js'), ...args], { encoding: 'utf8' });
const readme = root => fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const toCrlf = text => text.replace(/\r?\n/g, '\r\n');

test('check passes for a current README with LF endings', t => {
  const root = fixture(t);
  assert.equal(run(root).status, 0);
  assert.equal(run(root, '--check').status, 0);
});

test('check passes for a current README with CRLF endings', t => {
  const root = fixture(t);
  assert.equal(run(root).status, 0);
  fs.writeFileSync(path.join(root, 'README.md'), toCrlf(readme(root)));
  const result = run(root, '--check');
  assert.equal(result.status, 0, result.stderr);
});

test('check fails for a stale README regardless of line endings', t => {
  const root = fixture(t);
  fs.writeFileSync(path.join(root, 'README.md'), toCrlf(readme(root)));
  assert.equal(run(root, '--check').status, 1);
});

test('update preserves CRLF endings without mixing in LF', t => {
  const root = fixture(t);
  fs.writeFileSync(path.join(root, 'README.md'), toCrlf(readme(root)));
  assert.equal(run(root).status, 0);
  const content = readme(root);
  assert.match(content, /\[`demo`\]/);
  assert.doesNotMatch(content, /(?<!\r)\n/);
});
