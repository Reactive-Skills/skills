# MEASURE

Collect and parse coverage data.

## Actions
1. Execute `coverage_command` after the clean baseline.
2. Locate the machine-readable report.
3. Parse line, statement, branch, and function totals and covered counts.
4. Store the report path and normalized metrics.

## Atomic checklist
- [ ] Coverage command completed.
- [ ] Report exists and parses.
- [ ] All four metric families are present.
- [ ] Report path and metrics are recorded.

## Signal
Emit `COVERAGE_MEASURED` with `coverage_report` and `coverage_metrics`, or `MEASUREMENT_FAILED` when either is absent.
