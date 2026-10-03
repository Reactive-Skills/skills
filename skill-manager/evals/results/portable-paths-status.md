# Portable output-path correction

Status: COMPLETE_FAILED; all 24 trials independently reviewed, adoption blocked.
Release: 1.2.1.
Digest: d42859aaef8b289affbcf0c68cdec5fb24c7a844e757acd573ebc2442df56dfc.

The preserved [portable checkpoint](portable-status.md) finished with 23 PASS and one critical false projection-absence claim.
This candidate distinguishes job archives from optional active-job mirrors, requires actual path and content verification, and separates projection timestamps from ledger transition times.
The runtime, specification, fixtures, approval script, model, harness, and three-worker recipe remain identical to baseline-help-safe.
All 52 offline tests and local structure, compatibility, release, catalogue, and diff checks pass.
[Scope evidence](evidence/portable-paths-scope.json) confirms unchanged topology, schema, guards, transitions, runtime declarations, and canonical bootloader.
[Preflight evidence](evidence/portable-paths-preflight.json) records the frozen bundle and runtime identities.

All trials received independent artifact, full-command, approval, runtime, and host metadata review.
The runner completed with zero orchestration errors.
[Comparison evidence](evidence/portable-paths-comparison.json) records complete coverage and a failed acceptance comparison against baseline-help-safe.
[Final checks](evidence/portable-paths-final-checks.json) retain catalogue, release parity, diff, and frozen-source identity verification.
PLAN-004 and source-aware sync require a passing comparison; supplemental Desktop checks remain separate and NOT_RUN.

## Reviewed results

Twenty-four of 24 trials reviewed: twenty-two PASS and two critical FAIL.
All eighteen update, reference-navigation, and missing-prerequisite trials pass.
All twelve manager trials retain one runtime job.
Five of the six created artifacts pass independent native topology checks.
The no-skill arm has eleven passes versus twelve in baseline-help-safe, so the comparison also reports a control-arm success regression.
This observation does not establish that the manager candidate caused behavior in an arm that never loaded it.

The third no-skill creation control also generated nine authored skill files under `.reactive/skills/eval-report` before its source-A manifest was approved.
Its final source-A artifact and native topology checks pass, but the observed task-write violation remains FAIL and is preserved in [scaffold evidence](evidence/portable-paths-codex-cli-current-create-hsm-no-skill-3.preapproval-scaffold.json).
The runtime-artifact allowance does not authorize additional authored skill source outside the approved source-A manifest.

The first manager-assisted creation failed native HSM validation after following the existing unsupported nested-key guidance.
The original result remains FAIL; a separate diagnostic copy with only the two supported child-field names passes actual runtime checks.
[PLAN-006](../../../plans/006-correct-nested-key-guidance-before-rewrite.md) proposes moving the already-approved clarification ahead of the broader rewrite; sequencing approval is pending.
The third manager creation initially used the same unsupported nested fields, corrected them within its approved manifest after validation, and passed the final native proof.
No candidate skill source was changed during this matrix; the authored source still matches the frozen digest above.
No broader guidance rewrite, distribution sync, commit, push, publication, or runtime installation was performed.
