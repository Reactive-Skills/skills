# GATE

## Goal
Human review gate — present scan results and allow pass, remediation request, or block.

## Inputs
- `context.findings` — all classified findings
- `context.critical_findings` — critical severity findings
- `.docs/security-scan/findings.md` — full findings report
- `.docs/security-scan/remediation-checklist.md` — remediation checklist

## Instructions
1. Review the findings report and remediation checklist.
2. Present results to user with three options:
   - **Pass** — no critical issues, commit may proceed
   - **Request Remediation** — send back to SCAN_PIPELINE to re-scan after fixes
   - **Block Commit** — critical issues found, halt the pipeline

## Atomic Checklist / Anti-Shortcut Gate
- [ ] Findings report reviewed
- [ ] Remediation checklist reviewed
- [ ] User explicitly chose one of three options
- [ ] No assumptions about user intent

## Output / Signal
- **Pass**: emit `USER_APPROVED` `{"approved": true}` → COMPLETED
- **Request Remediation**: emit `REQUEST_REMEDIATION` `{"remediation_requested": true}` → SCAN_PIPELINE
- **Block Commit**: emit `USER_REJECTED` `{"rejected": true}` → BLOCKED

This is the sole HITL checkpoint. All other transitions are deterministic.
