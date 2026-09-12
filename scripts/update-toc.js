#!/usr/bin/env node
/**
 * scripts/update-toc.js
 * 
 * Automatically discovers all reactive skills in the repository,
 * extracts their metadata from skill.yaml, and updates the Table of Contents
 * in README.md between the <!-- TOC_START --> and <!-- TOC_END --> markers.
 * 
 * Usage:
 *   node scripts/update-toc.js          # Updates README.md in-place
 *   node scripts/update-toc.js --check  # Verifies README.md is up-to-date (exits 1 if not)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const README_PATH = path.join(ROOT_DIR, 'README.md');

const TOC_START_MARKER = '<!-- TOC_START -->';
const TOC_END_MARKER = '<!-- TOC_END -->';

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

function parseYamlMetadata(content) {
  const meta = {};
  const lines = content.split(/\r?\n/);
  
  let inDescription = false;
  let descLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (inDescription) {
      if (/^\s+/.test(line)) {
        descLines.push(line.trim());
        continue;
      } else {
        inDescription = false;
        meta.description = descLines.join(' ');
      }
    }

    const nameMatch = line.match(/^name:\s*(.+)$/);
    if (nameMatch) {
      meta.name = nameMatch[1].trim().replace(/^['"]|['"]$/g, '');
      continue;
    }

    const versionMatch = line.match(/^version:\s*(.+)$/);
    if (versionMatch) {
      meta.version = versionMatch[1].trim().replace(/^['"]|['"]$/g, '');
      continue;
    }

    const schemaMatch = line.match(/^schema_version:\s*(.+)$/);
    if (schemaMatch) {
      meta.schema_version = schemaMatch[1].trim().replace(/^['"]|['"]$/g, '');
      continue;
    }

    const descMatch = line.match(/^description:\s*(.*)$/);
    if (descMatch) {
      const rest = descMatch[1].trim();
      if (rest === '>' || rest === '|' || rest === '>-' || rest === '|-') {
        inDescription = true;
        descLines = [];
      } else if (rest.length > 0) {
        meta.description = rest.replace(/^['"]|['"]$/g, '');
      }
      continue;
    }
  }

  if (inDescription && descLines.length > 0) {
    meta.description = descLines.join(' ');
  }

  // Count states if states: block exists
  const statesMatch = content.match(/^states:\s*([\s\S]*?)(^[\w_]+:|$)/m);
  if (statesMatch) {
    const stateLines = statesMatch[1].split(/\r?\n/);
    let stateCount = 0;
    for (const sLine of stateLines) {
      if (/^\s{2}[A-Za-z0-9_-]+:\s*$/.test(sLine)) {
        stateCount++;
      }
    }
    meta.statesCount = stateCount;
  }

  return meta;
}

function discoverSkills() {
  const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || IGNORED_DIRS.has(entry.name)) {
      continue;
    }

    const skillYamlPath = path.join(ROOT_DIR, entry.name, 'skill.yaml');
    if (!fs.existsSync(skillYamlPath)) {
      continue;
    }

    try {
      const yamlContent = fs.readFileSync(skillYamlPath, 'utf8');
      const meta = parseYamlMetadata(yamlContent);
      
      skills.push({
        dirName: entry.name,
        name: meta.name || entry.name,
        version: meta.version || '1.0.0',
        schemaVersion: meta.schema_version || '2.2.0',
        description: meta.description || 'No description provided',
        statesCount: meta.statesCount || null,
        hasSkillMd: fs.existsSync(path.join(ROOT_DIR, entry.name, 'SKILL.md'))
      });
    } catch (err) {
      console.warn(`⚠️ Warning: Could not parse ${skillYamlPath}: ${err.message}`);
    }
  }

  // Sort alphabetically by skill name
  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

function generateMarkdownTable(skills) {
  let out = '';
  out += '| Skill | Version | Schema | Description |\n';
  out += '| :--- | :--- | :--- | :--- |\n';

  for (const skill of skills) {
    const link = `[\`${skill.name}\`](${skill.dirName}/)`;
    const ver = `\`v${skill.version}\``;
    const schema = `\`v${skill.schemaVersion}\``;
    const desc = skill.description.replace(/\|/g, '\\|');
    out += `| ${link} | ${ver} | ${schema} | ${desc} |\n`;
  }

  return out;
}

function main() {
  const isCheckMode = process.argv.includes('--check');
  
  if (!fs.existsSync(README_PATH)) {
    console.error(`❌ Error: README.md not found at ${README_PATH}`);
    process.exit(1);
  }

  const skills = discoverSkills();
  console.log(`🔍 Discovered ${skills.length} reactive skills: ${skills.map(s => s.name).join(', ')}`);

  const generatedTable = generateMarkdownTable(skills);
  const readmeContent = fs.readFileSync(README_PATH, 'utf8');

  const startIndex = readmeContent.indexOf(TOC_START_MARKER);
  const endIndex = readmeContent.indexOf(TOC_END_MARKER);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    console.error(`❌ Error: Markers ${TOC_START_MARKER} and ${TOC_END_MARKER} not found or malformed in README.md`);
    process.exit(1);
  }

  const before = readmeContent.slice(0, startIndex + TOC_START_MARKER.length);
  const after = readmeContent.slice(endIndex);
  const updatedReadme = `${before}\n\n${generatedTable}\n${after}`;

  if (isCheckMode) {
    if (readmeContent !== updatedReadme) {
      console.error('❌ Table of Contents in README.md is OUT OF DATE! Run `node scripts/update-toc.js` to update it.');
      process.exit(1);
    }
    console.log('✅ Table of Contents in README.md is up-to-date.');
    return;
  }

  fs.writeFileSync(README_PATH, updatedReadme, 'utf8');
  console.log('✅ Successfully updated README.md Table of Contents!');
}

main();
