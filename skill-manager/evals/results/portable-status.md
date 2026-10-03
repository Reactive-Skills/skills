# Portable candidate comparison

Status: COMPLETE_FAILED; candidate adoption blocked by a critical verification-report failure.
The approved PLAN-003 candidate is frozen as skill-manager 1.2.0.
Its digest is 1ace3297db3eccd5db920e5d22ed880a93bc6231cdd0038eba888697d456a7ba.
The exact runtime, model, task specification, fixtures, approval script, and three-worker CLI recipe match baseline-help-safe.
The reviewed baseline contains 24 trials: 19 PASS and five extra-manager-job failures.
All shared baseline task assertions passed.

The candidate packages the Node-only authoring checker, adds registered-source paths and read-only preflight, and instructs one manager invocation with its returned UUID retained afterward.
Local verification passed 52 offline tests, standalone and registry integration checks, actual runtime preflight/validation, release parity, catalogue freshness, and diff checks.
The schema, 22 states, 38 transitions, bootloader pointer, and Mermaid topology remain unchanged.
Two existing README links to the outside-package LICENSE remain advisory; CONTEXT.md has working navigation.
See [preflight evidence](evidence/portable-preflight.json).

Every trial uses a fresh isolated workspace.
Raw trial files await independent command, artifact, approval, host-metadata, and runtime review before result records are written.
Coverage completion does not establish improvement; the baseline-help-safe to portable comparison must pass before PLAN-004 adoption work.
Supplemental desktop checks remain separate and NOT_RUN.

## Reviewed progress

All 24 trials independently reviewed: 23 PASS and one FAIL after correcting a reviewer error.
All twelve with-skill runs retain one manager job, resolving the five duplicate-job failures observed in the comparable baseline.
All six creation trials pass independent actual-runtime checks for nested entry, guard rejection and acceptance, approval, and parent cancellation from both children.
The first manager update falsely reported absent .docs projections after checking unqualified paths; actual outputs exist under .docs/skill-manager/jobs/eval-update-source-a/.
The original review and evidence remain preserved under results/evidence/review-history and the original evidence path; the authoritative result links the corrected second review.
The baseline projection-related final claims were rechecked and do not contain this false absence claim.
The matrix is complete with no runner errors.
[Comparison evidence](evidence/portable-comparison.json) records the single critical failure and blocks PLAN-004 and sync.
The documented narrow path correction proceeds as release 1.2.1 with a new portable-paths checkpoint and unchanged runtime, specification, model, and recipe.
The final creation trial corrected an initial nested-key mistake after actual validation, supporting the already planned PLAN-004 clarification.
Its final completion-time label used a projection timestamp; the review records that caveat and uses the ledger event for exact completion timing.
