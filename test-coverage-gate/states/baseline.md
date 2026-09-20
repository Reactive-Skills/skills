# BASELINE

Run the unmodified test suite and require a clean baseline.

## Actions
1. Execute `test_command` in `target_dir`.
2. Capture stdout, stderr, duration, and exit code.
3. Refuse to measure coverage if the baseline fails.
4. Preserve the baseline result for the audit trail.

## Atomic checklist
- [ ] Command ran in the intended directory.
- [ ] Exit code is captured.
- [ ] Failures are not ignored.
- [ ] Baseline result is recorded.

## Signal
Emit `BASELINE_PASSED` with `exit_code: 0`, or `BASELINE_FAILED` with a non-zero exit code.
