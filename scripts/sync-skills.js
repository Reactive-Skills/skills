#!/usr/bin/env node
/**
 * scripts/sync-skills.js
 * 
 * Synchronizes reactive skills from the authoring repository to:
 * 1. Global registry: ~/.agents/skills/
 * 2. Satellites: ~/.gemini/config/skills/, ~/.claude/skills/, ~/.cline/skills/,
 *    ~/.codex/skills/, ~/.grok/skills/, ~/.kilocode/skills/
 * 
 * PREFERS Windows Directory Junctions / POSIX Symlinks for live, zero-drift updates.
 * Falls back to physical atomic copy when --copy is passed or if linking is not supported.
 * 
 * Usage:
 *   node scripts/sync-skills.js                # Sync all skills via junctions/symlinks
 *   node scripts/sync-skills.js <skill-name>   # Sync a specific skill (e.g. product-manager)
 *   node scripts/sync-skills.js --copy         # Force physical file copy instead of junctions
 *   node scripts/sync-skills.js --dry-run      # Preview sync operations without touching disk
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT_DIR = path.resolve(__dirname, '..');
const HOME = os.homedir();

const GLOBAL_PATH = path.join(HOME, '.agents', 'skills');

const DEFAULT_SATELLITES = [
  path.join(HOME, '.gemini', 'config', 'skills'),
  path.join(HOME, '.claude', 'skills'),
  path.join(HOME, '.cline', 'skills'),
  path.join(HOME, '.codex', 'skills'),
  path.join(HOME, '.grok', 'skills'),
  path.join(HOME, '.kilocode', 'skills'),
];

const IGNORED_DIRS = new Set([
  '.git',
  '.github',
  '.reactive',
  '.scratch',
  'scripts',
  'node_modules',
  'dist',
  'bin',
  'tmp',
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
]);

function discoverSkills(sourceDirs, targetSkill) {
  const skillsMap = new Map();

  for (const src of sourceDirs) {
    if (!fs.existsSync(src)) continue;
    const entries = fs.readdirSync(src, { withFileTypes: true });

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

function syncSkillToTarget(skill, targetDir, useLinks, dryRun) {
  const destPath = path.join(targetDir, skill.name);
  const targetLabel = path.basename(path.dirname(targetDir)) + '/' + path.basename(targetDir);

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
          currentTarget = path.resolve(path.dirname(destPath), fs.readlinkSync(destPath));
        } catch {
          currentTarget = null;
        }

        if (currentTarget && currentTarget.toLowerCase() === path.resolve(skill.sourcePath).toLowerCase()) {
          return { status: 'unchanged', message: `Already linked to source` };
        }

        if (!dryRun) {
          fs.unlinkSync(destPath);
        }
      } else {
        // Physical directory exists: backup and remove
        if (!dryRun) {
          const ts = new Date().toISOString().replace(/[:.]/g, '-');
          const backupDir = path.join(targetDir, '.sync-backups', skill.name, ts);
          fs.mkdirSync(backupDir, { recursive: true });
          copyRecursive(destPath, backupDir);
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
      // Fallback to copy if linking fails
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

    copyRecursive(skill.sourcePath, destPath);
    return { status: 'copied', message: `Copied physical files` };
  }
}

function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const forceCopy = args.includes('--copy');
  const allSources = args.includes('--all-sources');
  const useLinks = !forceCopy;

  // Collect source directories
  let sourceDirs = [ROOT_DIR];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) {
      const s = path.resolve(args[i + 1]);
      if (!sourceDirs.includes(s)) sourceDirs.push(s);
      i++;
    }
  }

  // Check ~/.agents/sources.json if --all-sources is requested
  const sourcesCfgPath = path.join(HOME, '.agents', 'sources.json');
  if (allSources && fs.existsSync(sourcesCfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(sourcesCfgPath, 'utf8'));
      if (Array.isArray(cfg.sources)) {
        for (const s of cfg.sources) {
          const resolved = path.resolve(s);
          if (!sourceDirs.includes(resolved)) {
            sourceDirs.push(resolved);
          }
        }
      }
    } catch {}
  }

  const targetSkill = args.find((a, idx) => !a.startsWith('--') && (idx === 0 || args[idx - 1] !== '--source'));

  console.log('⚡ Reactive Skills Syncer');
  console.log(`Mode: ${useLinks ? '🔗 Link Mode (Junctions/Symlinks - Preferred)' : '📋 Physical Copy Mode'}`);
  console.log(`Sources: ${sourceDirs.map(s => s.replace(HOME, '~')).join(', ')}`);
  if (isDryRun) console.log('🔍 [DRY RUN ACTIVE]');
  console.log('');

  const skills = discoverSkills(sourceDirs, targetSkill);
  if (skills.length === 0) {
    console.error(targetSkill ? `❌ Skill "${targetSkill}" not found in source(s).` : '❌ No skills found.');
    process.exit(1);
  }

  const allDestinations = [GLOBAL_PATH, ...DEFAULT_SATELLITES];
  console.log(`Syncing ${skills.length} skill(s) across ${allDestinations.length} destinations...\n`);

  for (const skill of skills) {
    console.log(`📦 Skill: [${skill.name}]`);
    console.log(`   Source: ${skill.sourcePath}`);

    for (const destDir of allDestinations) {
      const relLabel = destDir.replace(HOME, '~');
      const res = syncSkillToTarget(skill, destDir, useLinks, isDryRun);
      const icon = res.status === 'linked' ? '🔗' :
                   res.status === 'unchanged' ? '✓ ' :
                   res.status === 'copied' ? '📋' :
                   res.status === 'copied_fallback' ? '⚠️ ' : '🔍';
      console.log(`   ${icon} ${relLabel.padEnd(30)} -> ${res.message}`);
    }
    console.log('');
  }

  console.log('🎉 Sync process completed successfully!');
}

main();
