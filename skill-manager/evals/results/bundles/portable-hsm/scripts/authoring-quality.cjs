#!/usr/bin/env node
'use strict';

// File and navigation checks only. The runtime owns YAML/schema validation.
const fs = require('node:fs');
const path = require('node:path');

const SUPPORT_DIRS = new Set(['states', 'references', 'docs', 'templates', 'guards', 'scripts', 'assets', 'runtime']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.reactive', 'tests', 'evals', 'results']);
const slash = value => value.replace(/\\/g, '/');
const within = (root, target) => {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
};
const linesOf = text => text.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n');
const wordCount = text => text.trim() ? text.trim().split(/\s+/u).length : 0;
const slug = text => text.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/\s/g, '-');

function proseLines(text) {
  let fence = null;
  const visible = text.replace(/<!--[\s\S]*?-->/g, comment => comment.replace(/[^\n]/g, ' '));
  return linesOf(visible).map(line => {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && line.slice(marker[0].length).trim() === '') fence = null;
      return '';
    }
    if (marker) { fence = marker[1]; return ''; }
    // Preserve brackets around code-formatted link labels, while hiding code examples.
    return line.replace(/(`+)([\s\S]*?)\1/g, match => ' '.repeat(match.length));
  });
}

function linkDestination(source) {
  if (source.startsWith('<')) {
    const end = source.indexOf('>');
    return end < 0 ? null : source.slice(1, end);
  }
  let depth = 0;
  let end = 0;
  for (; end < source.length; end++) {
    const c = source[end];
    if (c === '\\' && /[()\s]/.test(source[end + 1] || '')) { end++; continue; }
    if (c === '(') depth++;
    if (c === ')') { if (depth === 0) break; depth--; }
    if (/\s/.test(c) && depth === 0) break;
  }
  return source.slice(0, end) || null;
}

function markdownLinks(lines) {
  const links = [];
  const definitions = new Map();
  const labelKey = value => value.trim().replace(/\s+/g, ' ').toLowerCase();
  lines.forEach((line, index) => {
    const definition = line.match(/^\s{0,3}\[([^\]]+)\]:\s*(.*)$/);
    if (definition) {
      const target = linkDestination(definition[2]);
      if (target) { definitions.set(labelKey(definition[1]), target); links.push({ target, line: index + 1 }); }
    }
  });
  lines.forEach((line, index) => {
    if (/^\s{0,3}\[[^\]]+\]:/.test(line)) return;
    for (const match of line.matchAll(/(?<!\\)\[((?:[^\[\]\n]|\[[^\]\n]*\])*)\](?:\(\s*|\[([^\]]*)\])?/g)) {
      if (match[1].includes('[')) for (const nested of markdownLinks([match[1]])) links.push({ target: nested.target, line: index + 1 });
      if (match[0].endsWith('(') || /\(\s*$/.test(match[0])) {
        const rest = line.slice(match.index + match[0].length);
        const target = linkDestination(rest);
        const consumed = rest.startsWith('<') ? rest.indexOf('>') + 1 : target?.length;
        // An unfinished example is not a definite Markdown file reference.
        if (target && /^\s*(?:(?:"[^"]*"|'[^']*'|\([^)]*\))\s*)?\)/.test(rest.slice(consumed))) links.push({ target, line: index + 1 });
      } else {
        const target = definitions.get(labelKey(match[2] || match[1]));
        if (target) links.push({ target, line: index + 1 });
      }
    }
  });
  return links;
}

function checkAuthoringQuality(skillRoot) {
  const result = { schema_version: 1, errors: [], warnings: [], measurements: [] };
  const finding = (severity, code, relative, line, message) => result[severity].push({ code, path: slash(relative), line, message });
  let root;
  try {
    root = fs.realpathSync(path.resolve(skillRoot));
    if (!fs.statSync(root).isDirectory()) throw new Error('Expected a directory');
  } catch (error) {
    finding('errors', 'UNREADABLE_INPUT', '.', 1, `Cannot read skill root: ${error.code || error.message}.`);
    return result;
  }
  const external = (relative, line, target) => finding('warnings', 'EXTERNAL_DEPENDENCY', relative, line, `Outside-package dependency: ${target}; its contents were not checked.`);
  function safeTarget(target, relative, line) {
    if (!within(root, target)) { external(relative, line, slash(target)); return null; }
    // Resolve one existing component at a time; never read through an escaping link.
    let current = root;
    const components = path.relative(root, target).split(path.sep).filter(Boolean);
    for (const [index, component] of components.entries()) {
      current = path.join(current, component);
      try {
        if (fs.lstatSync(current).isSymbolicLink()) {
          const destination = path.resolve(path.dirname(current), fs.readlinkSync(current));
          if (!within(root, destination)) { external(relative, line, slash(destination)); return null; }
          current = fs.realpathSync(current);
          if (!within(root, current)) { external(relative, line, slash(current)); return null; }
        }
      } catch (error) {
        if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return path.join(current, ...components.slice(index + 1));
        finding('errors', 'UNREADABLE_INPUT', relative, line, `Cannot inspect referenced path: ${error.code || error.message}.`);
        return null;
      }
    }
    return current;
  }
  function checkReference(raw, relative, line, fromManifest = false) {
    if (!raw || raw.startsWith('#') || raw.includes('{{')) return;
    let target = raw.replace(/\\([() ])/g, '$1');
    if (/^[a-z][a-z\d+.-]*:/i.test(target) && !/^[a-z]:[\\/]/i.test(target)) return;
    target = target.split(/[?#]/, 1)[0];
    try { target = decodeURIComponent(target); } catch { return; }
    if (!target) return;
    if (path.win32.isAbsolute(target) || path.posix.isAbsolute(target)) { external(relative, line, target); return; }
    target = slash(target);
    const resolved = path.resolve(fromManifest ? root : path.dirname(path.join(root, relative)), target);
    const safe = safeTarget(resolved, relative, line);
    if (!safe) return;
    try {
      const stat = fs.statSync(safe);
      if (fromManifest && !stat.isFile()) finding('errors', 'BROKEN_REFERENCE', relative, line, `Prompt reference is not a file: ${raw}.`);
    } catch (error) {
      finding('errors', ['ENOENT', 'ENOTDIR'].includes(error.code) ? 'BROKEN_REFERENCE' : 'UNREADABLE_INPUT', relative, line,
        `Cannot read referenced target ${raw}: ${error.code || error.message}.`);
    }
  }
  function read(relative) {
    const safe = safeTarget(path.join(root, relative), relative, 1);
    if (!safe) return null;
    try { return fs.readFileSync(safe, 'utf8'); }
    catch (error) { finding('errors', 'UNREADABLE_INPUT', relative, 1, `Cannot read checker input: ${error.code || error.message}.`); return null; }
  }
  const files = [];
  const seen = new Set();
  function walk(directory, relative = '') {
    const safe = safeTarget(directory, relative || '.', 1);
    if (!safe || seen.has(safe)) return;
    seen.add(safe);
    let entries;
    try { entries = fs.readdirSync(safe, { withFileTypes: true }); }
    catch (error) { finding('errors', 'UNREADABLE_INPUT', relative || '.', 1, `Cannot list checker inputs: ${error.code || error.message}.`); return; }
    for (const entry of entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const child = path.join(directory, entry.name);
      const rel = slash(path.join(relative, entry.name));
      const target = safeTarget(child, rel, 1);
      if (!target) continue;
      let stat;
      try { stat = fs.statSync(target); }
      catch (error) { finding('errors', 'UNREADABLE_INPUT', rel, 1, `Cannot inspect checker input: ${error.code || error.message}.`); continue; }
      if (stat.isDirectory() && (relative || SUPPORT_DIRS.has(entry.name))) walk(child, rel);
      else if (stat.isFile() && /\.md$/i.test(entry.name)) files.push(rel);
    }
  }
  walk(root);
  if (!files.includes('SKILL.md')) read('SKILL.md');
  for (const relative of files.sort()) {
    const text = read(relative);
    if (text === null) continue;
    const lines = linesOf(text);
    const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
    result.measurements.push({ path: relative, lines: text ? lines.length : 0, body_lines: body ? linesOf(body).length : 0, whitespace_words: wordCount(text) });
    const prose = proseLines(text);
    const links = markdownLinks(prose);
    for (const link of links) checkReference(link.target, relative, link.line);
    if (relative === 'SKILL.md') {
      if (linesOf(body).length > 500) finding('warnings', 'LARGE_SKILL_BODY', relative, 1, 'SKILL.md body exceeds the 500-line authoring advisory; this is not a runtime limit.');
    } else if (!relative.startsWith('states/') && lines.length > 100) {
      const headings = prose.flatMap(line => { const m = line.match(/^\s{0,3}#{1,6}\s+(.+?)(?:\s+#+)?$/); return m ? [m[1]] : []; });
      const anchors = new Set(headings.map(slug));
      const navigation = new Set(links.filter(link => /^\s*(?:[-*+] |\d+[.)] )/.test(prose[link.line - 1]) && link.target.startsWith('#') && anchors.has(link.target.slice(1))).map(link => link.target));
      const contentsHeading = headings.some(heading => /\b(?:table\s+of\s+contents|contents|navigation)\b/i.test(heading));
      if (!(navigation.size >= 2 || (contentsHeading && navigation.size >= 1))) finding('warnings', 'MISSING_CONTENTS', relative, 1, 'Supporting document exceeds 100 lines without working contents/navigation links.');
    }
  }
  const manifest = fs.existsSync(path.join(root, 'skill.yaml')) ? 'skill.yaml' : 'skill.yml';
  const manifestText = read(manifest);
  if (manifestText !== null) {
    // Lexical scalar references only, intentionally not a YAML parser.
    let blockIndent = null;
    linesOf(manifestText).forEach((line, index) => {
      if (!line.trim() || line.trimStart().startsWith('#')) return;
      const indent = line.match(/^\s*/)[0].length;
      if (blockIndent !== null && indent > blockIndent) return;
      blockIndent = null;
      if (/^[^#]*:\s*[|>][+-]?\d?\s*(?:#.*)?$/.test(line)) blockIndent = indent;
      const match = line.match(/^\s*prompt_template:\s*(.*?)\s*$/);
      if (!match) return;
      const scalar = match[1];
      let reference;
      if (/^[|>&*!{\[]/.test(scalar) || !scalar) {
        finding('warnings', 'DYNAMIC_PROMPT_REFERENCE', manifest, index + 1, 'Non-literal prompt reference requires runtime manifest validation.');
        return;
      }
      if (scalar.startsWith('"')) { try { reference = JSON.parse(scalar.replace(/\s+#.*$/, '')); } catch { /* Runtime validates YAML escapes. */ } }
      else if (scalar.startsWith("'")) { const quoted = scalar.match(/^'((?:[^']|'')*)'(?:\s+#.*)?$/); if (quoted) reference = quoted[1].replace(/''/g, "'"); }
      else reference = scalar.replace(/\s+#.*$/, '').trim();
      if (typeof reference === 'string') checkReference(reference, manifest, index + 1, true);
      else finding('warnings', 'DYNAMIC_PROMPT_REFERENCE', manifest, index + 1, 'Unresolved scalar syntax requires runtime manifest validation.');
    });
  }
  for (const severity of ['errors', 'warnings']) {
    result[severity] = result[severity].filter((item, index, all) => all.findIndex(other => JSON.stringify(other) === JSON.stringify(item)) === index);
    result[severity].sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line || a.code.localeCompare(b.code));
  }
  return result;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) console.log('Usage: node authoring-quality.cjs <skill-root> [--json]');
  else if (args.filter(arg => arg !== '--json').length !== 1 || args.some(arg => arg.startsWith('--') && arg !== '--json')) {
    console.error('Usage: node authoring-quality.cjs <skill-root> [--json]');
    process.exitCode = 2;
  } else {
    const result = checkAuthoringQuality(args.find(arg => arg !== '--json'));
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.errors.length ? 1 : 0;
  }
}

module.exports = { checkAuthoringQuality };
