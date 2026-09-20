# ERROR

## Goal
Terminal state: Unrecoverable error occurred during execution.

## Context
This state was reached because an unrecoverable error occurred during `REPORT` generation (bubble-up `REPORT_ERROR`) or another unexpected failure.

## Instructions
1. Review the event log at `.reactive/skills/security-scan/events.jsonl` for the last transition.
2. Identify the root cause from context and error messages.
3. Document the error in `.docs/security-scan/error-report.md` with:
   - Error description
   - Last successful state
   - Recovery steps attempted
4. Determine if the skill can be reset and restarted from `COLLECT_STAGED`.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] Error root cause identified from event log
- [ ] Last successful state confirmed
- [ ] Recovery actions documented
- [ ] No silent continuation — this is terminal

## Signal
None. Terminal state. Awaiting manual reset via:
```bash
npx -y @reactive-skills/axi reset security-scan
```
