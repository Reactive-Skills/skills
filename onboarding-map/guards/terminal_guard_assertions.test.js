const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { execSync } = require('node:child_process');
const { test } = require('node:test');

const skillDir = path.resolve(__dirname, '..');

function runtimeEntry() {
  if (process.env.ONBOARDING_MAP_RUNTIME) return path.resolve(process.env.ONBOARDING_MAP_RUNTIME);
  try {
    return require.resolve('@reactive-skills/runtime');
  } catch {
    // One command string through the shell finds npm.cmd on Windows without the argument
    // array that Node 24 deprecates alongside `shell` (DEP0190).
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    const axiRequire = createRequire(path.join(globalRoot, '@reactive-skills/axi/package.json'));
    return axiRequire.resolve('@reactive-skills/runtime');
  }
}

// Parse skill.yaml with the runtime's own YAML parser; the runtime manifest drops `type: terminal`.
const yaml = createRequire(runtimeEntry())('js-yaml');
const { states } = yaml.load(fs.readFileSync(path.join(skillDir, 'skill.yaml'), 'utf8'));

test('terminal states have no outgoing transitions', () => {
  const terminal = Object.entries(states).filter(([, state]) => state.type === 'terminal');
  assert.deepEqual(terminal.map(([name]) => name).sort(), ['BLOCKED', 'ERROR', 'SUCCESS']);
  for (const [name, state] of terminal) {
    assert.deepEqual(Object.keys(state.transitions || {}), [], `${name} must not transition`);
  }
});

test('every state has a prompt_template on disk', () => {
  for (const [name, state] of Object.entries(states)) {
    assert.ok(state.prompt_template, `${name} must declare a prompt_template`);
    assert.ok(fs.existsSync(path.join(skillDir, state.prompt_template)), `${name} prompt ${state.prompt_template} must exist`);
  }
});
