# State: BASELINING

## Goal
Execute the test suite against the unmutated codebase to guarantee clean baseline behavior.

## Instructions
1. Execute the configured `runner_cmd` in `target_dir` with zero mutations applied.
2. If tests pass with `exit_code == 0`:
   - Set `baseline_passed: true`
   - Emit signal `BASELINE_PASSED` with payload `{"exit_code": 0}`
3. If tests fail with `exit_code != 0`:
   - Set `baseline_passed: false`
   - Emit signal `BASELINE_FAILED` with payload `{"exit_code": exit_code}`

## Anti-Shortcut Checklist
- [ ] Did baseline tests run completely without premature abortion?
- [ ] Were all pre-existing tests verified passing before introducing synthetic bugs?
