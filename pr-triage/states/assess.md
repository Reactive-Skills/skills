# ASSESS

Assess readiness against policy.

## Actions
1. Check required statuses and review approvals.
2. Detect unresolved conversations, risky files, and policy exceptions.
3. Mark each PR ready, needs rework, or blocked.
4. Record evidence without changing the PR.

Each assessment must include a `status` of `ready`, `needs_rework`, or `blocked`, plus an `evidence` field.

## Atomic checklist
- [ ] Required checks are evaluated.
- [ ] Review requirements are evaluated.
- [ ] Risk signals are explicit.
- [ ] Assessments are non-empty.

## Signal
Emit `ASSESSMENT_COMPLETE` with a non-empty `assessments` array containing the required fields, or `ASSESSMENT_FAILED` when assessment data is incomplete.
