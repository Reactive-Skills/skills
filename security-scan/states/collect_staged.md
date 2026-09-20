# COLLECT_STAGED

## Goal
Collect git-staged files that are pending commit for security scanning.

## Inputs
- No prior context needed — this is the initial state.

## Instructions
1. Run `git diff --cached --name-only` to list all staged files.
2. Filter to source files (`.js`, `.ts`, `.jsx`, `.tsx`, `.json`, `.yaml`, `.yml`, `.env`, `.config.*`).
3. Verify at least 1 staged file exists.
4. Set context: `staged_files` = array of file paths.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] `git diff --cached --name-only` executed via `run_command`
- [ ] At least 1 source file in `staged_files`
- [ ] Non-source files (images, binaries) excluded
- [ ] No hardcoded secrets in the file list itself

## Output
Emit `STAGED_FILES` with payload:
```json
{"staged_files": ["src/api/config.js", "src/utils/auth.ts"]}
```

## Signal
Emit: `STAGED_FILES` (guard: `staged_files.length > 0`)
