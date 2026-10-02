# Test consequential uncertainty

Use the current-basis assessment and evidence.
Identify unknowns that could materially change the decision.
Define bounded tests with question, method, measure, deadline, status, and evidence_refs.
Status is planned or observed.
Observed tests require references to actual observed entries in context.evidence.
Never turn an unexecuted experiment into a passed or failed result.
If no test is warranted, record an explicit no_test_reason.
Save context.uncertainty_plan with basis_version, tests, and no_test_reason.

## Atomic checklist

- [ ] Tests target consequential unknowns.
- [ ] Every test has a measure and checkpoint.
- [ ] Observed results are backed by observed evidence.
- [ ] Empty tests have a justified explanation.
- [ ] Record uses context.basis_version.

Emit: TESTS_DEFINED with uncertainty_plan in payload.contextUpdates.
