# CONFIG_SCAN

## Goal
Scan staged files for insecure configurations, hardcoded IPs, and debug mode in production.

## Inputs
- `context.staged_files` — array of file paths

## Instructions
1. Use `grep_search` to find:
   - `debug\s*[:=]\s*true` (debug mode enabled)
   - `localhost|127\.0\.0\.1|0\.0\.0\.0` in config files (hardcoded IPs)
   - `http://` (non-HTTPS URLs in production code)
   - `eval\(` (arbitrary code execution)
   - `dangerouslySetInnerHTML` (XSS risk in React)
   - `ssl\s*:\s*false` or `verify\s*:\s*false` (TLS disabled)
2. Review `.yaml`/`.json` config files for insecure values.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] grep_search with at least 6 insecure-pattern checks
- [ ] Config files reviewed separately
- [ ] False positives filtered (test files, comments, localhost for dev)
- [ ] Findings recorded in `insecure_configs`

## Output
Set context: `insecure_configs` = [{file, line, issue, recommendation}].

Emit `CONFIG_SCANNED` with payload:
```json
{"exit_code": 0, "insecure_configs": [...]}
```

## Signal
Emit: `CONFIG_SCANNED` (guard: `event.payload.exit_code === 0`)
