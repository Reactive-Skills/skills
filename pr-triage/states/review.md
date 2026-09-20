# REVIEW

Pause for a human triage disposition.

## Review criteria
- Evidence is complete and source-linked
- Policy exceptions are explicit and justified
- High-risk PRs have appropriate reviewers
- Rework and blocking reasons are actionable

## Atomic checklist
- [ ] Reviewer sees the routing plan.
- [ ] Decision is approve, rework, or block.
- [ ] Rework feedback is actionable.
- [ ] Block reason is recorded.

## Signal
Emit `USER_APPROVED` with `approved: true`, `USER_REQUEST_REWORK` with `rework_requested: true`, or `USER_REJECTED` with `rejected: true`.
