# VIOLATION_SUMMARY

## Goal
Summarize all security findings by severity and category across all scan phases.

## Inputs
- `context.secrets_found` — from SECRETS_SCAN
- `context.credentials_found` — from CREDENTIALS_SCAN
- `context.insecure_configs` — from CONFIG_SCAN
- `context.critical_findings` — critical-severity findings (if any)

## Instructions
1. Aggregate all findings into `context.findings` (unified list with severity field).
2. Classify each finding: critical, high, medium, low.
3. Group by category: Secrets, Credentials, Config Issues.
4. If any critical findings exist, set `context.critical_findings` and prepare for BLOCKED.
5. Otherwise, proceed to remediation generation.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] All findings aggregated from 3 scan categories
- [ ] Each finding has a severity label
- [ ] Critical findings isolated in `critical_findings`
- [ ] At least 1 finding per category if the category produced results

## Output
Set context: `findings` = [{category, severity, file, line, description}].

Emit `SUMMARY_GENERATED` with payload:
```json
{"exit_code": 0, "findings_count": <number>, "critical_count": <number>}
```

## Signal
Emit: `SUMMARY_GENERATED` (guard: `event.payload.exit_code === 0`)
