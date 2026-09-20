# BLOCKED

## Goal
Terminal state: Critical secrets or credentials found, commit blocked.

## Context
A critical-severity secret or credential was detected during `SECRETS_SCAN`, `CREDENTIALS_SCAN`, or `CONFIG_SCAN`, or the user explicitly rejected at `GATE`.

## Instructions
1. Review `context.critical_findings` for the specific violations.
2. Document critical findings in `.docs/security-scan/blocked-report.md`.
3. Provide immediate remediation steps (rotate keys, remove credentials).
4. Emit signal `SKILL_BLOCKED`.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] Critical findings identified and listed
- [ ] Affected files documented
- [ ] Immediate remediation steps provided
- [ ] Findings traceable to event log

## Block Reason
Commit blocked due to:
- High-entropy API keys or tokens in source
- Exposed private keys
- Hardcoded production credentials
- User explicit rejection at GATE

## Signal
None. Terminal state. Awaiting manual reset or remediation.
