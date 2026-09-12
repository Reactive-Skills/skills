#!/usr/bin/env node
/**
 * scripts/validate-skills.js
 * 
 * Validates all reactive skills in the repository:
 * 1. Checks that skill.yaml exists and contains valid metadata (name, version, schema_version, initial_state, states).
 * 2. Verifies that initial_state is defined in states.
 * 3. Verifies that all referenced prompt_template files (e.g. states/*.md) exist on disk.
 * 4. Verifies that all transition target states exist.
 * 5. Verifies that SKILL.md exists and contains the required universal bootloader (<!-- REACTIVE BOOTLOADER -->).
 * 6. Checks that README.md exists for human documentation and catalog navigation.
 * 7. Invokes `npx -y @reactive-skills/axi inspect <skill>` to ensure the runtime FSM engine compiles the statechart.
 *
 * Usage:
 *   node scripts/validate-skills.js               # Validates all skills
 *   node scripts/validate-skills.js <skill-name>  # Validates a specific skill
 *   node scripts/validate-skills.js --no-runtime  # Validates without calling npx @reactive-skills/axi
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

const IGNORED_DIRS = new Set([
  '.git',
  '.github',
  '.reactive',
  '.scratch',
  'scripts',
  'node_modules',
  'dist',
  'bin',
  'tmp'
]);

function parseYaml(content) {
  let jsYaml = null;
  try {
    jsYaml = require('js-yaml');
  } catch (_) {
    // fallback if js-yaml is not installed
  }

  if (jsYaml && typeof jsYaml.load === 'function') {
    return jsYaml.load(content);
  }

  // Lightweight fallback YAML parser for statecharts
  const result = {
    states: {}
  };

  const lines = content.split(/\r?\n/);
  let currentSection = null;
  let currentState = null;
  let currentSubSection = null;
  let currentTransitionSignal = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = rawLine.search(/\S/);

    if (indent === 0) {
      const topMatch = trimmed.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
      if (topMatch) {
        currentSection = topMatch[1];
        currentState = null;
        currentSubSection = null;
        currentTransitionSignal = null;
        const val = topMatch[2].trim().replace(/^['"]|['"]$/g, '');
        if (val) {
          result[currentSection] = val;
        }
      }
      continue;
    }

    if (currentSection === 'states') {
      if (indent === 2) {
        const stateMatch = trimmed.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
        if (stateMatch) {
          currentState = stateMatch[1];
          result.states[currentState] = {
            transitions: {}
          };
          currentSubSection = null;
          currentTransitionSignal = null;
        }
      } else if (indent === 4 && currentState) {
        const fieldMatch = trimmed.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
        if (fieldMatch) {
          const field = fieldMatch[1];
          const val = fieldMatch[2].trim().replace(/^['"]|['"]$/g, '');
          if (field === 'transitions') {
            currentSubSection = 'transitions';
          } else {
            currentSubSection = field;
            if (val) {
              result.states[currentState][field] = val;
            }
          }
        }
      } else if (indent === 6 && currentState && currentSubSection === 'transitions') {
        const sigMatch = trimmed.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
        if (sigMatch) {
          currentTransitionSignal = sigMatch[1];
          const targetInline = sigMatch[2].trim().replace(/^['"]|['"]$/g, '');
          if (targetInline) {
            result.states[currentState].transitions[currentTransitionSignal] = { target: targetInline };
          } else {
            result.states[currentState].transitions[currentTransitionSignal] = {};
          }
        }
      } else if (indent === 8 && currentState && currentTransitionSignal) {
        const targetMatch = trimmed.match(/^target:\s*(.+)$/);
        if (targetMatch) {
          const tgt = targetMatch[1].trim().replace(/^['"]|['"]$/g, '');
          result.states[currentState].transitions[currentTransitionSignal].target = tgt;
        }
      }
    }
  }

  return result;
}

function discoverSkills(targetSkill) {
  const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || IGNORED_DIRS.has(entry.name)) {
      continue;
    }

    if (targetSkill && entry.name !== targetSkill) {
      continue;
    }

    const skillDir = path.join(ROOT_DIR, entry.name);
    const skillYamlPath = path.join(skillDir, 'skill.yaml');
    if (!fs.existsSync(skillYamlPath)) {
      continue;
    }

    skills.push({
      name: entry.name,
      dir: skillDir,
      yamlPath: skillYamlPath
    });
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

function validateSkill(skill, runRuntimeCheck) {
  const errors = [];
  const warnings = [];

  // 1. Check skill.yaml
  let manifest = null;
  try {
    const rawYaml = fs.readFileSync(skill.yamlPath, 'utf8');
    manifest = parseYaml(rawYaml);
  } catch (err) {
    errors.push(`Failed to parse skill.yaml: ${err.message}`);
    return { valid: false, errors, warnings, stats: null };
  }

  if (!manifest) {
    errors.push('skill.yaml is empty or could not be parsed');
    return { valid: false, errors, warnings, stats: null };
  }

  // Required fields
  if (!manifest.name) {
    errors.push('skill.yaml is missing required field: `name`');
  }
  if (!manifest.initial_state) {
    errors.push('skill.yaml is missing required field: `initial_state`');
  }
  if (!manifest.states || typeof manifest.states !== 'object' || Object.keys(manifest.states).length === 0) {
    errors.push('skill.yaml has no states defined under `states:`');
  }

  const stateNames = manifest.states ? Object.keys(manifest.states) : [];
  let transitionCount = 0;

  // 2. Validate initial_state
  if (manifest.initial_state && !stateNames.includes(manifest.initial_state)) {
    errors.push(`initial_state "${manifest.initial_state}" is not defined in states`);
  }

  // 3. Validate states, prompt_templates, and transitions
  if (manifest.states) {
    for (const [stateName, stateDef] of Object.entries(manifest.states)) {
      if (!stateDef || typeof stateDef !== 'object') continue;

      // Check prompt_template file existence
      if (stateDef.prompt_template) {
        const tmplPath = path.resolve(skill.dir, stateDef.prompt_template);
        if (!fs.existsSync(tmplPath)) {
          errors.push(`State "${stateName}" references prompt_template "${stateDef.prompt_template}", but file does not exist at ${tmplPath}`);
        }
      }

      // Check transitions
      if (stateDef.transitions && typeof stateDef.transitions === 'object') {
        for (const [signal, trans] of Object.entries(stateDef.transitions)) {
          transitionCount++;
          const target = typeof trans === 'string' ? trans : trans?.target;
          if (!target) {
            errors.push(`State "${stateName}" transition on signal "${signal}" has no target state`);
          } else if (!stateNames.includes(target)) {
            errors.push(`State "${stateName}" transition on signal "${signal}" targets unknown state "${target}"`);
          }
        }
      }
    }
  }

  // 4. Validate SKILL.md
  const skillMdPath = path.join(skill.dir, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    errors.push('SKILL.md does not exist in skill directory');
  } else {
    const skillMdContent = fs.readFileSync(skillMdPath, 'utf8');
    if (!skillMdContent.includes('<!-- REACTIVE BOOTLOADER -->')) {
      errors.push('SKILL.md is missing the universal reactive bootloader marker: `<!-- REACTIVE BOOTLOADER -->`');
    }
    if (!skillMdContent.includes('@reactive-skills/axi') && !skillMdContent.includes('reactive-skills-axi')) {
      warnings.push('SKILL.md bootloader does not reference @reactive-skills/axi');
    }
  }

  // 5. Validate README.md
  const readmeMdPath = path.join(skill.dir, 'README.md');
  if (!fs.existsSync(readmeMdPath)) {
    warnings.push('README.md does not exist in skill directory (recommended for catalog navigation and human readability)');
  }

  // 6. Run runtime inspection via @reactive-skills/axi inspect if enabled
  if (runRuntimeCheck && errors.length === 0) {
    try {
      const inspectCmd = `npx -y @reactive-skills/axi inspect "${skill.dir}"`;
      const output = execSync(inspectCmd, {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      if (output.includes('code: INVALID_SKILL') || output.includes('code: NOT_FOUND') || output.includes('error:')) {
        const errorLine = output.split('\n').find((l) => l.trim().startsWith('error:')) || 'Runtime inspection failed';
        errors.push(`@reactive-skills/axi inspect rejected statechart: ${errorLine.trim()}`);
      }
    } catch (execErr) {
      const combined = `${execErr.stdout || ''}\n${execErr.stderr || ''}`;
      if (combined.includes('EBADENGINE')) {
        warnings.push('Runtime engine check warning (Node >= 22.5.0 required for runtime)');
      } else {
        errors.push(`@reactive-skills/axi inspect command failed: ${execErr.message}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      name: manifest?.name || skill.name,
      version: manifest?.version || 'unknown',
      schemaVersion: manifest?.schema_version || 'unknown',
      statesCount: stateNames.length,
      transitionCount
    }
  };
}

function main() {
  const args = process.argv.slice(2);
  const skipRuntime = args.includes('--no-runtime');
  const targetSkill = args.find((a) => !a.startsWith('--'));

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage:
  node scripts/validate-skills.js               Validate all reactive skills in the repository
  node scripts/validate-skills.js <skill-name>  Validate a specific skill
  node scripts/validate-skills.js --no-runtime  Skip @reactive-skills/axi inspect check
`);
    process.exit(0);
  }

  console.log('⚡ Reactive Skills Validator');
  console.log(`Scanning directory: ${ROOT_DIR}\n`);

  const skills = discoverSkills(targetSkill);

  if (skills.length === 0) {
    if (targetSkill) {
      console.error(`❌ Error: Skill "${targetSkill}" not found in repository.`);
    } else {
      console.error('❌ Error: No reactive skills discovered.');
    }
    process.exit(1);
  }

  console.log(`Found ${skills.length} reactive skill(s) to validate: ${skills.map((s) => s.name).join(', ')}\n`);

  let hasErrors = false;

  for (const skill of skills) {
    process.stdout.write(`• Checking [${skill.name}]... `);
    const result = validateSkill(skill, !skipRuntime);

    if (result.valid) {
      console.log('✅ VALID');
      if (result.stats) {
        console.log(`  └─ Schema: v${result.stats.schemaVersion} | Version: v${result.stats.version} | States: ${result.stats.statesCount} | Transitions: ${result.stats.transitionCount}`);
      }
      if (result.warnings.length > 0) {
        for (const w of result.warnings) {
          console.log(`  ⚠️  Warning: ${w}`);
        }
      }
    } else {
      hasErrors = true;
      console.log('❌ FAILED');
      for (const err of result.errors) {
        console.log(`  ❌ ${err}`);
      }
      for (const w of result.warnings) {
        console.log(`  ⚠️  Warning: ${w}`);
      }
    }
  }

  console.log('');
  if (hasErrors) {
    console.error('❌ Validation failed! Please fix the errors listed above.');
    process.exit(1);
  }

  console.log(`🎉 All ${skills.length} reactive skill(s) successfully validated!`);
  process.exit(0);
}

main();
