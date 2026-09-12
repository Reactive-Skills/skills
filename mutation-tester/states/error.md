# State: ERROR

## Goal
Handle failed mutation testing runs gracefully with diagnostic logs and cleanup.

## Failure Scenarios
- Baseline tests failed before mutations could be applied.
- Test runner execution command failed to launch or crashed.
- Target directory or git repository is invalid.

## Recovery
Review error output and emit signal `RETRY` to re-initialize parameters.
