# State: EXECUTING

## Goal
Execute the test suite against each synthesized mutant, record the outcome, and guarantee source file restoration.

## Instructions
1. For each candidate mutant:
   - Perform atomic in-place swap on target file.
   - Execute test command with configured timeout (`timeout_sec`).
   - Immediately restore pristine original file using defer/trap.
   - Categorize outcome:
     - `KILLED`: Test suite exited with non-zero code (expected healthy behavior).
     - `SURVIVED`: Test suite exited with 0 (indicates test gap).
     - `TIMED_OUT`: Test suite exceeded timeout ceiling (e.g. infinite loop).
     - `COMPILE_ERROR`: Code failed to compile/build with mutant applied.
2. Aggregate totals:
   - `killed_mutants`
   - `survived_mutants`
   - `timed_out_mutants`
   - `compile_error_mutants`
3. Emit signal `EXECUTION_COMPLETED` with aggregated results payload.

## Anti-Shortcut Checklist
- [ ] Were all original source files restored with 100% fidelity?
- [ ] Were mutant outcomes recorded with exact file:line citations?
