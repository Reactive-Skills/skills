# REVIEW

Pause for a human publication decision.

## Review criteria
- Accuracy against source truth
- Usefulness for the named audience
- Diagram clarity and traceability
- Missing or contradictory claims

## Atomic checklist
- [ ] Reviewer sees the draft and diagram inventory.
- [ ] Decision is one of approve, revise, or reject.
- [ ] Revision feedback is actionable.
- [ ] Rejection reason is recorded.

## Signal
Emit `USER_APPROVED` with `approved: true`, `USER_REQUEST_REVISIONS` with `revisions_requested: true`, or `USER_REJECTED` with `rejected: true`.
