# State: PROJECTING

## Goal
Calculate mutation score metrics and materialize deliverable projections.

## Instructions
1. Compute the mutation score:
   `score = (killed_mutants + timed_out_mutants) / (total_mutants - compile_error_mutants) * 100`
2. Materialize deliverable files:
   - `.docs/mutation-scorecard.md`: Human-readable summary table and breakdown of surviving mutants.
   - `.docs/mutation-report.json`: Machine-readable JSON summary for CI/CD gates.
3. Emit signal `PROJECTIONS_WRITTEN`.

## Anti-Shortcut Checklist
- [ ] Is mutation score computed mathematically correctly without dividing by zero?
- [ ] Are surviving mutants listed with specific diffs and file locations for ease of remediation?
