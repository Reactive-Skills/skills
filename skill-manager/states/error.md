# ERROR State

## Goal
Handle failure after retry and rollback exhausted.

## Error Output
- Log error details to .docs/skill-manager-errors.md
- Emit ERROR signal with full payload
- Include error in final summary projection

## Terminal State
This is a terminal state. No further transitions.

## Error Payload
Include:
- reason
- operation
- skill_name
- timestamp
- rollback_attempted
- rollback_succeeded
