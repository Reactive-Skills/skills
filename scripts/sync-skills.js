#!/usr/bin/env node
/**
 * scripts/sync-skills.js (and sync-skills.cjs)
 *
 * Universal Reactive Skills Synchronizer & Junction Linker
 *
 * Reconciles authoring repositories with global agent runtimes:
 * 1. Global registry: ~/.agents/skills/
 * 2. Satellites: ~/.gemini/config/skills/, ~/.claude/skills/, ~/.cline/skills/,
 *    ~/.codex/skills/, ~/.grok/skills/, ~/.kilocode/skills/, ~/.copilot/skills/, ~/.pi/skills/, ~/.devin/skills/
 *
 * Key Invariants:
 * - PREFERS Windows Directory Junctions (or POSIX symlinks) by default for zero-drift live editing.
 * - Auto-discovers all registered source directories from ~/.agents/sources.json + current working directory.
 * - Safely backs up existing physical folders before converting to junctions.
 * - Compatible with @reactive-skills/runtime flags and workflows.
 *
 * Usage:
 *   node scripts/sync-skills.js                  # Sync all discovered skills via junctions
 *   node scripts/sync-skills.js <skill-name>     # Sync specific skill (e.g. synthesis)
 *   node scripts/sync-skills.js --dry-run        # Preview operations without writing to disk
 *   node scripts/sync-skills.js --copy           # Force physical file copy instead of junctions
 *   node scripts/sync-skills.js --source <dir>   # Override source directory
 *   node scripts/sync-skills.js --target <dir>   # Target specific destination only
 *   node scripts/sync-skills.js --json           # Output machine-readable JSON
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir();
const SCRIPT_PARENT_DIR = path.resolve(__dirname, '..');
const GLOBAL_PATH = path.join(HOME, '.agents', 'skills');

const KNOWN_SATELLITES = [
  path.join(HOME, '.gemini', 'config', 'skills'),
  path.join(HOME, '.claude', 'skills'),
  path.join(HOME, '.cline', 'skills'),
  path.join(HOME, '.codex', 'skills'),
  path.join(HOME, '.grok', 'skills'),
  path.join(HOME, '.kilocode', 'skills'),
  path.join(HOME, '.copilot', 'skills'),
  path.join(HOME, '.pi', 'skills'),
  path.join(HOME, '.devin', 'skills'),
];

const IGNORED_DIRS = new Set([
  '.git',
  '.github',
  '.reactive',
  '.scratch',
  '.sync-backups',
  '.backup',
  'scripts',
  'node_modules',
  'dist',
  'bin',
  'tmp',
  'tests',
  '.docs',
  '.cache',
  '.idea',
  '.vscode',
  '.playwright-mcp',
]);

const EXCLUDE_FROM_COPY = new Set([
  '.git',
  '.docs',
  '.reactive',
  '.playwright-mcp',
  '.backup',
  '.sync-backups',
  'node_modules',
  'dist',
  'tests',
  'scripts',
]);

function normalize(p) {
  if (!p) return '';
  const resolved = path.resolve(p);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function expandPath(p) {
  if (p === '~' || p.startsWith('~/') || p.startsWith('~\\')) {
    return path.join(HOME, p.slice(1));
  }
  return path.resolve(p);
}

function resolveSourceDirs(explicitSources) {
  if (explicitSources && explicitSources.length > 0) {
    return explicitSources.map(expandPath);
  }

  const sources = [];
  const seen = new Set();

  function addSource(p) {
    if (!p) return;
    const resolved = expandPath(p);
    const norm = normalize(resolved);
    if (!seen.has(norm) && fs.existsSync(resolved)) {
      seen.add(norm);
      sources.push(resolved);
    }
  }

  // 1. Current working directory (if it's a skill root or contains skills)
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'skill.yaml')) || fs.existsSync(path.join(cwd, 'SKILL.md'))) {
    // Current directory is itself a single skill - parent is source
    addSource(path.dirname(cwd));
  } else {
    // Check if cwd has child directories that look like skills
    try {
      const entries = fs.readdirSync(cwd, { withFileTypes: true });
      const hasChildSkills = entries.some(e => {
        if (!e.isDirectory() || IGNORED_DIRS.has(e.name)) return false;
        return fs.existsSync(path.join(cwd, e.name, 'skill.yaml')) ||
               fs.existsSync(path.join(cwd, e.name, 'SKILL.md')) ||
               fs.existsSync(path.join(cwd, e.name, 'skill.md'));
      });
      if (hasChildSkills) {
        addSource(cwd);
      }
    } catch {}
  }

  // 2. Script parent directory (e.g. repo where sync-skills.js lives)
  addSource(SCRIPT_PARENT_DIR);

  // 3. ~/.agents/sources.json
  const sourcesCfgPath = path.join(HOME, '.agents', 'sources.json');
  if (fs.existsSync(sourcesCfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(sourcesCfgPath, 'utf8'));
      if (Array.isArray(cfg.sources)) {
        for (const s of cfg.sources) {
          addSource(s);
        }
      }
    } catch {}
  }

  return sources;
}

function discoverSkills(sourceDirs, targetSkill) {
  const skillsMap = new Map();

  for (const src of sourceDirs) {
    if (!fs.existsSync(src)) continue;
    let entries;
    try {
      entries = fs.readdirSync(src, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory() || IGNORED_DIRS.has(entry.name)) continue;
      if (targetSkill && entry.name !== targetSkill) continue;

      const skillDir = path.join(src, entry.name);
      const hasYaml = fs.existsSync(path.join(skillDir, 'skill.yaml'));
      const hasSkillMd = fs.existsSync(path.join(skillDir, 'SKILL.md')) || fs.existsSync(path.join(skillDir, 'skill.md'));

      if (hasYaml || hasSkillMd) {
        if (!skillsMap.has(entry.name)) {
          skillsMap.set(entry.name, {
            name: entry.name,
            sourcePath: skillDir,
            sourceDir: src,
          });
        }
      }
    }
  }

  return Array.from(skillsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function removeDirRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      removeDirRecursive(full);
    } else {
      fs.unlinkSync(full);
    }
  }
  fs.rmdirSync(dirPath);
}

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDE_FROM_COPY.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function syncSkillToTarget(skill, targetDir, useLinks, dryRun, noBackup) {
  const destPath = path.join(targetDir, skill.name);

  // Guard: Never link or copy onto itself
  if (normalize(destPath) === normalize(skill.sourcePath)) {
    return { status: 'self_target', message: 'Target is skill source location (skipped)' };
  }

  if (!fs.existsSync(targetDir)) {
    if (!dryRun) fs.mkdirSync(targetDir, { recursive: true });
  }

  let lstat;
  try {
    lstat = fs.lstatSync(destPath);
  } catch {
    lstat = null;
  }

  if (useLinks) {
    const linkType = process.platform === 'win32' ? 'junction' : 'dir';

    if (lstat) {
      if (lstat.isSymbolicLink()) {
        let currentTarget;
        try {
          currentTarget = fs.readlinkSync(destPath);
          if (process.platform === 'win32') {
            currentTarget = currentTarget.replace(/^\\\\\?\\/, '');
          }
          currentTarget = path.resolve(path.dirname(destPath), currentTarget);
        } catch {
          currentTarget = null;
        }

        if (currentTarget && normalize(currentTarget) === normalize(skill.sourcePath)) {
          return { status: 'unchanged', message: 'Already linked to source' };
        }

        if (!dryRun) {
          fs.unlinkSync(destPath);
        }
      } else {
        // Physical directory exists: backup and replace
        if (!dryRun) {
          if (!noBackup) {
            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            const backupDir = path.join(targetDir, '.sync-backups', skill.name, ts);
            fs.mkdirSync(backupDir, { recursive: true });
            copyRecursive(destPath, backupDir);
          }
          removeDirRecursive(destPath);
        }
      }
    }

    if (dryRun) {
      return { status: 'dry_run', message: `Would link (${linkType}) -> ${destPath}` };
    }

    try {
      fs.symlinkSync(path.resolve(skill.sourcePath), destPath, linkType);
      return { status: 'linked', message: `Linked (${linkType})` };
    } catch (err) {
      copyRecursive(skill.sourcePath, destPath);
      return { status: 'copied_fallback', message: `Link failed (${err.message}), fell back to copy` };
    }
  } else {
    // Physical copy mode
    if (lstat && lstat.isSymbolicLink()) {
      if (!dryRun) fs.unlinkSync(destPath);
    }

    if (dryRun) {
      return { status: 'dry_run', message: `Would copy files to ${destPath}` };
    }

    if (!noBackup && lstat && !lstat.isSymbolicLink()) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(targetDir, '.sync-backups', skill.name, ts);
      fs.mkdirSync(backupDir, { recursive: true });
      copyRecursive(destPath, backupDir);
    }

    copyRecursive(skill.sourcePath, destPath);
    return { status: 'copied', message: 'Copied physical files' };
  }
}

function printHelp() {
  console.log(`
⚡ Reactive Skills Syncer

Usage:
  node scripts/sync-skills.js [skill-name] [flags]

Flags:
  --link               Use directory junctions / symlinks (default: true)
  --copy               Force physical file copy instead of junctions
  --dry-run            Preview sync actions without touching disk
  --no-backup          Skip backing up physical directories before replacement
  --source, -s <dir>   Specify source directory (can be repeated)
  --target, -t <dir>   Specify target directory (can be repeated)
  --json               Output machine-readable JSON
  --help, -h           Show this help message

Registered source directories are loaded automatically from ~/.agents/sources.json
along with the current working directory.
`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const isDryRun = args.includes('--dry-run');
  const forceCopy = args.includes('--copy');
  const useLinks = !forceCopy;
  const noBackup = args.includes('--no-backup');
  const jsonOutput = args.includes('--json');

  const explicitSources = [];
  const explicitTargets = [];

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--source' || args[i] === '-s') && args[i + 1]) {
      explicitSources.push(args[++i]);
    } else if ((args[i] === '--target' || args[i] === '-t') && args[i + 1]) {
      explicitTargets.push(args[++i]);
    }
  }

  const targetSkill = args.find((a, idx) => {
    if (a.startsWith('-')) return false;
    if (idx > 0 && (args[idx - 1] === '--source' || args[idx - 1] === '-s' ||
                    args[idx - 1] === '--target' || args[idx - 1] === '-t')) {
      return false;
    }
    return true;
  });

  const sourceDirs = resolveSourceDirs(explicitSources);

  let targetDirs;
  if (explicitTargets.length > 0) {
    targetDirs = explicitTargets.map(expandPath);
  } else {
    // Default targets: GLOBAL_PATH + all satellites that exist or whose parent exists
    const validSatellites = KNOWN_SATELLITES.filter(s => {
      const parent = path.dirname(s);
      return fs.existsSync(s) || fs.existsSync(parent);
    });
    targetDirs = [GLOBAL_PATH, ...validSatellites];
  }

  const skills = discoverSkills(sourceDirs, targetSkill);

  if (jsonOutput) {
    const report = {
      dryRun: isDryRun,
      mode: useLinks ? 'link' : 'copy',
      sources: sourceDirs,
      targets: targetDirs,
      skillsFound: skills.length,
      results: [],
    };

    for (const skill of skills) {
      for (const destDir of targetDirs) {
        const res = syncSkillToTarget(skill, destDir, useLinks, isDryRun, noBackup);
        report.results.push({
          skill: skill.name,
          source: skill.sourcePath,
          target: destDir,
          status: res.status,
          message: res.message,
        });
      }
    }
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log('⚡ Universal Reactive Skills Syncer');
  console.log(`Mode: ${useLinks ? '🔗 Link Mode (Junctions - Zero-Drift Preferred)' : '📋 Physical Copy Mode'}`);
  console.log(`Sources: ${sourceDirs.map(s => s.replace(HOME, '~')).join(', ')}`);
  if (isDryRun) console.log('🔍 [DRY RUN ACTIVE]');
  console.log('');

  if (skills.length === 0) {
    console.error(targetSkill ? `❌ Skill "${targetSkill}" not found in source(s).` : '❌ No skills found.');
    process.exit(1);
  }

  console.log(`Syncing ${skills.length} skill(s) across ${targetDirs.length} destination(s)...\n`);

  let totalLinked = 0;
  let totalUnchanged = 0;
  let totalCopied = 0;
  let totalSkipped = 0;

  for (const skill of skills) {
    console.log(`📦 Skill: [${skill.name}]`);
    console.log(`   Source: ${skill.sourcePath.replace(HOME, '~')}`);

    for (const destDir of targetDirs) {
      const relLabel = destDir.replace(HOME, '~');
      const res = syncSkillToTarget(skill, destDir, useLinks, isDryRun, noBackup);

      if (res.status === 'linked') totalLinked++;
      else if (res.status === 'unchanged') totalUnchanged++;
      else if (res.status === 'copied' || res.status === 'copied_fallback') totalCopied++;
      else if (res.status === 'self_target') totalSkipped++;

      const icon = res.status === 'linked' ? '🔗' :
                   res.status === 'unchanged' ? '✓ ' :
                   res.status === 'copied' ? '📋' :
                   res.status === 'copied_fallback' ? '⚠️ ' :
                   res.status === 'self_target' ? '↷ ' : '🔍';

      console.log(`   ${icon} ${relLabel.padEnd(35)} -> ${res.message}`);
    }
    console.log('');
  }

  console.log('🎉 Sync complete!');
  console.log(`Summary: ${totalLinked} linked, ${totalUnchanged} unchanged, ${totalCopied} copied, ${totalSkipped} self-skipped.`);
}

main();
