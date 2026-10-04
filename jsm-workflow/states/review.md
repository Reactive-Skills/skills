---
name: jsm-workflow
description: Review the diff for defects, risks, and missed requirements.
type: reactive
---

# REVIEW

## Objective

Find correctness, security, maintainability, and requirement risks in the diff.

## Deliverables

- Reviewed file scope and findings ranked Critical, Major, Minor, Polish.
- Evidence, consequences, missing checks, and residual risk.

## Constraints

Run the review in a fresh subagent or session that has not seen the build work; use another model when available.
Give the reviewer only the diff, `dod_record`, and `decision_record`, never the builder transcript.
Report meaningful strengths, but omit style preferences without real risk.
Do not claim pass without noting relevant gaps.

## Uncertainty

Derive unclear scope from git or identify missing targets.
If architecture or requirements are wrong, emit `DECISION_REOPENED`.
If the user or evidence changes the approved outcome without reopening a decision, emit `DOD_CHANGE_REQUESTED` with the full `dod_record` plus `pending_diff`, `revision_reason`, and `downstream_work_to_rerun`.

## Atomic Gate

- Changed files were reviewed without editing them.
- `review_record.reviewer` names the fresh-context reviewer.
- Findings are evidence based and worst first.
- Missing checks and residual risk are stated.

## Task

Update `review_record` with scope, findings, missing tests, risk, result, and `reviewer`.
Set `reviewer` to `{ isolation: "fresh_context", agent: "<reviewer name or model>" }`; `REVIEW_PASSED` is refused without it.
Carry the full `review_record` in this signal's `contextUpdates`; a review stored by an earlier pass does not count.
Emit `REVIEW_PASSED`, `REVIEW_FINDINGS`, `REVIEW_DEFERRED`, `DECISION_REOPENED`, or `DOD_CHANGE_REQUESTED`.
