# ERROR

## Goal
Terminal state: Unrecoverable error occurred during execution.

## Context
This state was reached because the spec failed validation (`OPENAPI_CHECK_FAILED`, `TYPE_MISMATCH_FOUND`, or `EXAMPLE_MISMATCH_FOUND`), `REPORT` generation failed (bubble-up transition `REPORT_ERROR`), or another unexpected failure occurred.

## Instructions
1. Review the event log at `.reactive/skills/api-contract/events.jsonl` for the last transition before the error.
2. Identify the root cause from `context.drift_findings` and the error or mismatch list in the event payload.
3. Document the error in `.docs/api-contract/error-report.md` with:
   - Error description
   - Last successful state
   - Attempted recovery actions
4. Determine if the skill can be reset and restarted from `DISCOVER_APIS`.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] Error root cause identified from event log
- [ ] Last successful state confirmed
- [ ] Recovery actions documented
- [ ] No silent continuation — this is terminal

## Output
No further state transition. Workflow ends here.

## Signal
This is a terminal state. No signal to emit. The skill awaits manual reset via `npx -y @reactive-skills/axi reset api-contract`.
