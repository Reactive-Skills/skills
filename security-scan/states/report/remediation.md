# REMEDIATION

## Goal
Generate actionable remediation steps for each security finding.

## Inputs
- `context.findings` — classified findings from VIOLATION_SUMMARY
- `context.critical_findings` — critical severity findings

## Instructions
1. For each finding, produce a specific remediation action:
   - **Secret found**: "Move secret to environment variable or vault; rotate exposed key immediately"
   - **Hardcoded credential**: "Remove from source; use config service or env vars"
   - **Debug mode**: "Set debug=false for production deployment"
   - **Hardcoded IP**: "Replace with configurable environment variable"
2. Assign priority: critical → immediate, high → before next deploy, medium → tech debt, low → backlog
3. Write remediation checklist to `.docs/security-scan/remediation-checklist.md` (deliverable).

## Atomic Checklist / Anti-Shortcut Gate
- [ ] Each finding has a non-empty remediation string
- [ ] Priority assigned to each recommendation
- [ ] Critical findings have "immediate" priority
- [ ] `write_to_file` used for remediation checklist

## Output
Set context: `remediation_steps` = [{finding_id, action, priority}].

Emit `REMEDIATION_GENERATED` with payload:
```json
{"exit_code": 0, "remediation_count": <number>}
```

## Signal
Emit: `REMEDIATION_GENERATED` (guard: `event.payload.exit_code === 0`) → GATE
