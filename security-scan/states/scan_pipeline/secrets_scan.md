# SECRETS_SCAN

## Goal
Scan staged files for API keys, tokens, and private keys using regex patterns and high-entropy string detection.

## Inputs
- `context.staged_files` — array of file paths from COLLECT_STAGED

## Instructions
1. For each file in `staged_files`, use `grep_search` to find:
   - `AKIA[0-9A-Z]{16}` (AWS access key pattern)
   - `ghp_[A-Za-z0-9]{36}` (GitHub token)
   - `sk-[a-zA-Z0-9]{20,}` (OpenAI API key)
   - `-----BEGIN [A-Z ]*PRIVATE KEY-----` blocks
   - Generic `Bearer\s+[A-Za-z0-9._-]+` patterns
2. For each match, compute Shannon entropy. Entropy > 3.5 = high confidence secret.
3. If any secrets found with high entropy, set `severity: 'critical'` and bubble `CRITICAL_SECRET_FOUND`.
4. Record findings in `context.secrets_found`.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] grep_search used with at least 5 regex patterns
- [ ] Shannon entropy computed for each match
- [ ] High-entropy secrets flagged as critical
- [ ] All findings recorded in `secrets_found`

## Output
Set context: `secrets_found` = [{file, line, type, severity, entropy}].

Emit `SECRETS_SCANNED` with payload:
```json
{"exit_code": 0, "secrets_found": [...]}
```

Bubble `CRITICAL_SECRET_FOUND` with `{"severity": "critical"}` if high-entropy secret detected.

## Signal
Emit: `SECRETS_SCANNED` (guard: `event.payload.exit_code === 0`)
