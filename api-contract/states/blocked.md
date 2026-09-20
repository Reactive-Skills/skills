# BLOCKED

## Goal
Terminal state: Critical issues found, workflow halted.

## Context
This state was reached because a critical-severity finding was detected during `VALIDATION_PIPELINE` or `DRIFT_ANALYSIS`. The bubble-up transition `SECURITY_CRITICAL_FOUND` or `CRITICAL_DRIFT` fired with guard `event.payload.severity === 'critical'`.

## Instructions
1. Review `context.drift_findings` for any entries with `severity: 'critical'`.
2. Document the critical findings in `.docs/api-contract/blocked-report.md` with:
   - List of critical findings
   - Affected endpoints
   - Immediate remediation steps
3. Emit signal `SKILL_BLOCKED` with a summary.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] Critical findings identified and listed
- [ ] Affected endpoints documented
- [ ] Remediation steps provided
- [ ] Findings traceable to event log

## Output
No further state transition. Workflow ends here until user manually restarts.

## Signal
This is a terminal state. No signal to emit. The skill awaits manual reset via `npx -y @reactive-skills/axi reset api-contract`.
