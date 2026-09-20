# REVIEW

Pause for a human release decision.

## Review criteria
- Accuracy and source linkage of every entry
- Breaking change visibility and migration notes
- Scope completeness and formatting
- Review cycle impact and customer messaging

## Atomic checklist
- [ ] Reviewer sees the draft notes.
- [ ] Decision is approve, revise, or reject.
- [ ] Revision feedback is actionable.
- [ ] Rejection reason is recorded.

## Signal
Emit `USER_APPROVED` with `approved: true`, `USER_REQUEST_REVISIONS` with `revisions_requested: true`, or `USER_REJECTED` with `rejected: true`.
