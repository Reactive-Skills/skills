# CONFIGURE

Validate the coverage workflow before running tests.

## Actions
1. Resolve `target_dir` to an absolute path.
2. Confirm the test and coverage commands are available in the environment.
3. Select the expected report format and output path.
4. Record configuration and exit code.

## Atomic checklist
- [ ] Target resolves successfully.
- [ ] Commands are discoverable.
- [ ] Report format is explicit.
- [ ] Configuration exit code is recorded.

## Signal
Emit `CONFIGURATION_READY` with `exit_code: 0`, or `CONFIGURATION_FAILED` with a non-zero exit code.
