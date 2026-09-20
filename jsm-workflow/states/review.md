---
name: jsm-workflow
description: Review the diff for defects, risks, and missed requirements.
type: reactive
---

# REVIEW

## Context

This phase reviews the change after build and tests.
It follows the source corpus pattern where review is read only and focuses on defects before merge.

## Objective

Identify correctness, security, maintainability, and requirement risks in the current diff.

## Deliverables

- Reviewed diff scope.
- Findings ranked by severity.
- File and line references when available.
- Missing tests or verification gaps.
- Clear pass result when no findings are found.

## Constraints

Follow the cross-model second-opinion rule: review on a different model than the one that wrote the code whenever possible (via subagent delegation or explicit prompt), because a model reviewing its own work tends to agree with itself.
Use a code review stance: read-only, never edit code during review.
Rank findings worst-first (Critical, Major, Minor, Polish), and also note what the change did well.
Do not list style preferences unless they create real risk.
Do not claim a pass without naming residual risk or test gaps.

## Uncertainty

If the diff scope is unclear, determine it from git or ask for the target files.
If a finding depends on an assumption, state the assumption and how to verify it.
If review finds that the chosen architecture or requirement is wrong, emit `DECISION_REOPENED`.

## Atomic Gate

- The reviewed file set is known.
- The review applied a fresh-eyes stance (different model or independent review pass).
- Findings are sorted worst-first with severity, evidence, and consequence.
- What the change did well is acknowledged.
- Missing tests are named when relevant.
- No code was edited during review.

## Task

Review the current change for defects and missed requirements.
Update `review_record` with `diff_scope`, `findings`, `missing_tests`, `residual_risk`, and `result`.
Emit `REVIEW_PASSED` when no blocking findings remain.
Emit `REVIEW_FINDINGS` when implementation must address findings.
Emit `REVIEW_DEFERRED` when review is intentionally skipped for this lifecycle run.
Emit `DECISION_REOPENED` when review evidence changes a load bearing decision.
