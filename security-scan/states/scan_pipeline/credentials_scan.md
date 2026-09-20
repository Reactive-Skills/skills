# CREDENTIALS_SCAN

## Goal
Scan staged files for hardcoded credentials — passwords, bearer tokens, and authentication keys embedded in source code.

## Inputs
- `context.staged_files` — array of file paths

## Instructions
1. Use `grep_search` to find:
   - `password\s*=\s*['"][^'"]{4,}['"]` (hardcoded passwords)
   - `api[_-]?key\s*=\s*['"][^'"]{8,}['"]` (hardcoded API keys)
   - `secret\s*=\s*['"][^'"]{8,}['"]` (hardcoded secrets)
   - `authorization:\s*['"]Bearer\s+` (inline bearer tokens)
2. Check `.env` files for any `=` assignments with non-empty values.
3. Flag credentials in config files, connection strings, and test fixtures.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] grep_search with at least 4 credential patterns
- [ ] .env files checked for hardcoded values
- [ ] False positives filtered (test values, placeholders)
- [ ] Findings recorded in `credentials_found`

## Output
Set context: `credentials_found` = [{file, line, type, snippet}].

Emit `CREDENTIALS_SCANNED` with payload:
```json
{"exit_code": 0, "credentials_found": [...]}
```

## Signal
Emit: `CREDENTIALS_SCANNED` (guard: `event.payload.exit_code === 0`)
