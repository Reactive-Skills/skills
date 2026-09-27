#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const RELEASE_MANIFEST_SCHEMA_VERSION = 1;
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
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

function readTopLevelYamlValue(content, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`^${escapedKey}:\\s*(.*?)\\s*$`, 'm'));
  if (!match) return null;

  const value = match[1];
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function parseSemVer(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(SEMVER_PATTERN);
  if (!match) return null;
  return {
    major: BigInt(match[1]),
    minor: BigInt(match[2]),
    patch: BigInt(match[3]),
    prerelease: match[4] ? match[4].split('.') : null
  };
}

function compareSemVer(leftValue, rightValue) {
  const left = parseSemVer(leftValue);
  const right = parseSemVer(rightValue);
  if (!left || !right) throw new Error('Cannot compare invalid SemVer values');

  for (const key of ['major', 'minor', 'patch']) {
    if (left[key] < right[key]) return -1;
    if (left[key] > right[key]) return 1;
  }

  if (!left.prerelease && !right.prerelease) return 0;
  if (!left.prerelease) return 1;
  if (!right.prerelease) return -1;

  const sharedLength = Math.min(left.prerelease.length, right.prerelease.length);
  for (let index = 0; index < sharedLength; index++) {
    const leftPart = left.prerelease[index];
    const rightPart = right.prerelease[index];
    const leftIsNumeric = /^\d+$/.test(leftPart);
    const rightIsNumeric = /^\d+$/.test(rightPart);

    if (leftIsNumeric && rightIsNumeric) {
      const leftNumber = BigInt(leftPart);
      const rightNumber = BigInt(rightPart);
      if (leftNumber < rightNumber) return -1;
      if (leftNumber > rightNumber) return 1;
    } else if (leftIsNumeric !== rightIsNumeric) {
      return leftIsNumeric ? -1 : 1;
    } else if (leftPart !== rightPart) {
      return leftPart < rightPart ? -1 : 1;
    }
  }

  if (left.prerelease.length === right.prerelease.length) return 0;
  return left.prerelease.length < right.prerelease.length ? -1 : 1;
}

function discoverSkills() {
  return fs.readdirSync(ROOT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !IGNORED_DIRS.has(entry.name))
    .map((entry) => ({ name: entry.name, dir: path.join(ROOT_DIR, entry.name) }))
    .filter((skill) => fs.existsSync(path.join(skill.dir, 'skill.yaml')))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function readSkillMetadata(skill) {
  const yamlPath = path.join(skill.dir, 'skill.yaml');
  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  return {
    yamlContent,
    name: readTopLevelYamlValue(yamlContent, 'name'),
    version: readTopLevelYamlValue(yamlContent, 'version'),
    schemaVersion: readTopLevelYamlValue(yamlContent, 'schema_version')
  };
}

function getBaseRef(args) {
  const index = args.indexOf('--base-ref');
  return index >= 0 ? args[index + 1] : process.env.SKILL_RELEASE_BASE_REF || null;
}

function runGit(args) {
  return execFileSync('git', args, { cwd: ROOT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function getChangedFiles(baseRef) {
  const changed = runGit(['diff', '--name-only', '--diff-filter=ACDMRT', baseRef, '--']);
  const untracked = runGit(['ls-files', '--others', '--exclude-standard']);
  return `${changed}\n${untracked}`
    .split(/\r?\n/)
    .map((file) => file.trim().replace(/\\/g, '/'))
    .filter(Boolean);
}

function getBaseSkillNames(baseRef) {
  return runGit(['ls-tree', '-r', '--name-only', baseRef])
    .split(/\r?\n/)
    .filter((file) => /^[^/]+\/skill\.yaml$/.test(file))
    .map((file) => file.split('/')[0])
    .sort();
}

function hasSkillContentChanges(skill, baseRef, changedFiles) {
  const prefix = `${skill.name}/`;
  const skillFiles = changedFiles.filter((file) => file.startsWith(prefix));

  for (const file of skillFiles) {
    const relativePath = file.slice(prefix.length);
    if (relativePath === 'skill-release.json') continue;
    if (relativePath !== 'skill.yaml') return true;

    let diff = '';
    try {
      diff = runGit(['diff', '--no-ext-diff', '--unified=0', baseRef, '--', file]);
    } catch (error) {
      throw new Error(`Could not compare ${file} to ${baseRef}: ${error.message}`);
    }

    const contentLines = diff.split(/\r?\n/).filter((line) => {
      if (!/^[+-]/.test(line) || line.startsWith('+++') || line.startsWith('---')) return false;
      return !/^[+-](?:version|schema_version):\s*/.test(line);
    });
    if (contentLines.length > 0) return true;
  }

  return false;
}

function baseSkillVersion(skillName, baseRef) {
  let baseYaml;
  try {
    baseYaml = runGit(['show', `${baseRef}:${skillName}/skill.yaml`]);
  } catch {
    return null;
  }
  return readTopLevelYamlValue(baseYaml, 'version');
}

function validateSkill(skill, errors) {
  let metadata;
  try {
    metadata = readSkillMetadata(skill);
  } catch (error) {
    errors.push(`${skill.name}: cannot read skill.yaml: ${error.message}`);
    return null;
  }

  if (!metadata.name) errors.push(`${skill.name}: skill.yaml is missing top-level name`);
  if (metadata.name && metadata.name !== skill.name) {
    errors.push(`${skill.name}: skill.yaml name is "${metadata.name}" but directory is "${skill.name}"`);
  }
  if (!parseSemVer(metadata.version)) {
    errors.push(`${skill.name}: skill.yaml version "${metadata.version || ''}" is not valid SemVer`);
  }
  if (!parseSemVer(metadata.schemaVersion)) {
    errors.push(`${skill.name}: schema_version "${metadata.schemaVersion || ''}" must be a SemVer schema identifier`);
  }

  const releasePath = path.join(skill.dir, 'skill-release.json');
  if (!fs.existsSync(releasePath)) {
    errors.push(`${skill.name}: missing skill-release.json`);
    return metadata;
  }

  let release;
  try {
    release = JSON.parse(fs.readFileSync(releasePath, 'utf8'));
  } catch (error) {
    errors.push(`${skill.name}: skill-release.json is invalid JSON: ${error.message}`);
    return metadata;
  }

  if (!release || typeof release !== 'object' || Array.isArray(release)) {
    errors.push(`${skill.name}: skill-release.json must contain a JSON object`);
    return metadata;
  }

  if (release.schemaVersion !== RELEASE_MANIFEST_SCHEMA_VERSION) {
    errors.push(`${skill.name}: skill-release.json schemaVersion must be ${RELEASE_MANIFEST_SCHEMA_VERSION}`);
  }
  if (release.skillId !== metadata.name) {
    errors.push(`${skill.name}: skill-release.json skillId must match skill.yaml name "${metadata.name || ''}"`);
  }
  if (!['stable', 'preview', 'experimental'].includes(release.channel)) {
    errors.push(`${skill.name}: skill-release.json channel must be stable, preview, or experimental`);
  }
  if (release.type !== 'reactive') {
    errors.push(`${skill.name}: skill-release.json type must be "reactive"`);
  }
  if (!parseSemVer(release.version)) {
    errors.push(`${skill.name}: skill-release.json version "${release.version || ''}" is not valid SemVer`);
  }
  if (release.version !== metadata.version) {
    errors.push(`${skill.name}: skill-release.json version "${release.version || ''}" must exactly match skill.yaml version "${metadata.version || ''}"`);
  }
  if (!parseSemVer(release.reactiveSchemaVersion)) {
    errors.push(`${skill.name}: skill-release.json reactiveSchemaVersion must be a SemVer schema identifier`);
  }
  if (release.reactiveSchemaVersion !== metadata.schemaVersion) {
    errors.push(`${skill.name}: skill-release.json reactiveSchemaVersion "${release.reactiveSchemaVersion || ''}" must exactly match skill.yaml schema_version "${metadata.schemaVersion || ''}"`);
  }

  return metadata;
}

function main() {
  const args = process.argv.slice(2);
  const baseRef = getBaseRef(args);
  const errors = [];
  const skills = discoverSkills();
  let baseSkillNames = [];

  if (skills.length === 0) {
    console.error('No reactive skills found.');
    process.exit(1);
  }

  let changedFiles = [];
  if (baseRef && !/^0{40}$/.test(baseRef)) {
    try {
      runGit(['rev-parse', '--verify', `${baseRef}^{commit}`]);
      changedFiles = getChangedFiles(baseRef);
      baseSkillNames = getBaseSkillNames(baseRef);
    } catch (error) {
      errors.push(`Cannot compare against base ref "${baseRef}": ${error.message}`);
    }
  }

  const currentSkillNames = new Set(skills.map((skill) => skill.name));
  for (const baseSkillName of baseSkillNames) {
    if (!currentSkillNames.has(baseSkillName)) {
      errors.push(`${baseSkillName}: registry skill was removed or renamed; use a separately approved retirement or migration policy`);
    }
  }

  for (const skill of skills) {
    const metadata = validateSkill(skill, errors);
    if (!metadata || !baseRef || /^0{40}$/.test(baseRef) || errors.some((error) => error.startsWith(`${skill.name}:`))) {
      continue;
    }

    if (!baseSkillNames.includes(skill.name)) {
      if (metadata.version !== '1.0.0') {
        errors.push(`${skill.name}: new registry skills must start at version 1.0.0`);
      }
      continue;
    }

    const oldVersion = baseSkillVersion(skill.name, baseRef);
    if (!oldVersion) {
      errors.push(`${skill.name}: could not read the baseline skill.yaml version from ${baseRef}`);
      continue;
    }
    if (!parseSemVer(oldVersion)) {
      errors.push(`${skill.name}: base skill.yaml version "${oldVersion}" is not valid SemVer`);
      continue;
    }

    let versionOrder;
    try {
      versionOrder = compareSemVer(metadata.version, oldVersion);
    } catch {
      continue;
    }
    if (versionOrder < 0) {
      errors.push(`${skill.name}: version cannot decrease from ${oldVersion} to ${metadata.version}`);
      continue;
    }

    if (hasSkillContentChanges(skill, baseRef, changedFiles) && versionOrder <= 0) {
      errors.push(`${skill.name}: skill content changed without increasing skill.yaml version above ${oldVersion}`);
    }
  }

  if (errors.length > 0) {
    console.error('Skill release validation failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Validated release metadata for ${skills.length} reactive skills.`);
  if (baseRef && !/^0{40}$/.test(baseRef)) {
    console.log(`Checked version increases for changes against ${baseRef}.`);
  } else {
    console.log('No base ref supplied; version increase checks were skipped.');
  }
}

main();
