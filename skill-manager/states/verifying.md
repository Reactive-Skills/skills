# VERIFYING State

## Goal
Validate that the operation succeeded by checking filesystem state.

## Logic
- CREATE: verify skill.yaml exists at expected path
- UPDATE: verify modified files have new content
- DELETE: verify directory no longer exists

## Transition
- If verification passes ? emit VERIFIED_OK
- If verification fails ? emit VERIFIED_FAIL

## Signal
Emit: VERIFIED_OK (exit_code=0) or VERIFIED_FAIL (exit_code=1)
