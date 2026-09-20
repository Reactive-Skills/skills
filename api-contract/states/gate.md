# GATE

## Goal
Human review gate — present the drift report and allow approval, revision request, or rejection.

## Inputs
- `context.drift_findings` — all classified findings
- `context.coverage_matrix` — spec endpoint coverage
- `.docs/api-contract/drift.md` — full drift report
- `.docs/api-contract/coverage.md` — coverage matrix

## Instructions
1. Review the drift report and coverage matrix.
2. Present findings to user with three options:
   - **Approve & Complete** — all findings acceptable
   - **Request Revisions** — re-evaluate findings (back to DRIFT_ANALYSIS)
   - **Reject (Block)** — halt the pipeline

## Atomic Checklist / Anti-Shortcut Gate
- [ ] Drift report reviewed (at least skimmed the content)
- [ ] Coverage matrix reviewed
- [ ] User explicitly chose one of three options
- [ ] No assumptions about user intent — choice was explicit

## Output / Signal
- **Approve**: emit `USER_APPROVED` `{"approved": true}` → COMPLETED
- **Revisions**: emit `USER_REQUEST_REVISIONS` `{"revisions_requested": true}` → DRIFT_ANALYSIS
- **Reject**: emit `USER_REJECTED` `{"rejected": true}` → BLOCKED

**Note**: This is the sole Human-in-the-Loop checkpoint. All other transitions are deterministic.
