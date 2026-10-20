# State: PROJECTING

## Goal
Calculate mutation score metrics and materialize deliverable projections.

## Instructions
1. Compute the mutation score:
   `score = (killed_mutants + timed_out_mutants) / (total_mutants - compile_error_mutants) * 100`
2. Emit signal `PROJECTIONS_WRITTEN` with `mutation_score` in `payload.contextUpdates`.
   The runtime renders `.docs/mutation-scorecard.md` and `.docs/mutation-report.json` from context, so do not write them by hand.

## Anti-Shortcut Checklist
- [ ] Is mutation score computed mathematically correctly without dividing by zero?
- [ ] Are surviving mutants listed with specific diffs and file locations for ease of remediation?
