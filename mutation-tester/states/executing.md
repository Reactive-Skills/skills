# State: EXECUTING

## Goal
Execute the test suite against each synthesized mutant, record the outcome, and guarantee source file restoration.

## Instructions
1. From this skill's `engine/` directory, run `go run ./cmd/mutate -dir <absolute target_dir> -timeout <timeout_sec> -out-json <absolute target_dir>/.docs/mutation-report.json -out-md <absolute target_dir>/.docs/mutation-scorecard.md`, adding `-runner "<runner_cmd>"` when `runner_cmd` is set and `-diff <diff_ref>` when `diff_ref` is set.
   The engine swaps each mutant in, runs the tests, restores the original file, and writes the counts to that JSON report.
   It categorizes each outcome as:
     - `KILLED`: Test suite exited with non-zero code (expected healthy behavior).
     - `SURVIVED`: Test suite exited with 0 (indicates test gap).
     - `TIMED_OUT`: Test suite exceeded timeout ceiling (e.g. infinite loop).
     - `COMPILE_ERROR`: Code failed to compile/build with mutant applied.
2. Read these totals from the JSON report:
   - `killed_mutants`
   - `survived_mutants`
   - `timed_out_mutants`
   - `compile_error_mutants`
3. Emit signal `EXECUTION_COMPLETED` with the totals in `payload.contextUpdates`.
4. If the engine exits non-zero, emit `EXECUTION_FAILED` with its error output.

## Anti-Shortcut Checklist
- [ ] Were all original source files restored with 100% fidelity?
- [ ] Were mutant outcomes recorded with exact file:line citations?
