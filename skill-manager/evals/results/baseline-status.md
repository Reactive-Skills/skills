# Baseline collection status

Status: DIAGNOSTIC_BASELINE_SAVED; superseded for comparison by the approved baseline-help-safe collection.
The user approved Codex CLI as the primary executor with gpt-6.1-sol, xhigh reasoning, Windows PowerShell.
Selected desktop edge cases supplement the CLI matrix.
CLI isolation preflight passed with a synthetic home registry and an outside-write denial.
Failed setup probes are not behavioral trial outcomes.
The first no-skill update trial completed with the exact approved append and unchanged comparison files.
Its host metadata confirms gpt-6.1-sol, xhigh, Codex CLI 0.159.3.
All 21 launched trials completed and received independent review: 15 PASS and 6 FAIL.
The three unlaunched no-skill repetition-3 trials are explicitly NOT_RUN: update-source, prerequisite-failure, and reference-navigation.
No trial executor remains active.
Primary coverage is incomplete, and critical failures prevent adoption claims.
The three supplemental desktop checks remain NOT_RUN.
The runner initially rejected the valid optional parent prompt states/work.md in create-hsm/no-skill/1.
A failing regression test reproduced that harness bug and passed after the approval filter was corrected.
The original stopped .trial.json is preserved; the same executor session continues in .continued.trial.json with unchanged task, fixture, and frozen bundle.
No failed behavioral result was replaced.
Token accounting uses the final cumulative CLI usage, cross-checked against session metadata, to avoid counting resumed phases twice.
PLAN-003 and PLAN-004 remain gated on complete, understood baseline evidence.

## Reviewed outcomes

| Scenario | No-skill PASS / FAIL / NOT_RUN | With-skill PASS / FAIL / NOT_RUN |
|---|---|---|
| create-hsm | 1 / 2 / 0 | 1 / 2 / 0 |
| update-source | 2 / 0 / 1 | 3 / 0 / 0 |
| prerequisite-failure | 2 / 0 / 1 | 3 / 0 / 0 |
| reference-navigation | 2 / 0 / 1 | 1 / 2 / 0 |

Four with-skill trials failed the single-manager-job assertion: create-hsm repetitions 1 and 3, and reference-navigation repetitions 1 and 2.
The third with-skill create-hsm trial also failed runtime topology validation.
Two no-skill creation trials failed the source-approval assertion because help created transient files before approval.
These overlapping assertions produce six failed trials overall.

## Observed failures

The first with-skill create-hsm and reference-navigation trials violated the one-manager-job assertion.
AXI inspect created an unnamed manager job before the named trial job.
An isolated command-level reproduction confirms that inspect initializes a run, while preflight creates none.
See [the reproduction](evidence/inspect-side-effect.json).
The nested skill's independent guard acceptance/rejection and parent cancellation tests passed despite the manager-job failure.

The reference-navigation trial also stopped honestly at EXECUTING because its sibling registry validator was absent from the standalone manager bundle.
The requested prompt edit, source boundaries, approval chronology, and attachment handling passed.
PLAN-003 already covers replacing that external validator dependency with packaged checks and runtime validation.
Keep both failed records; do not relabel them as successful trials.
Candidate startup guidance should use the absolute manager path, preflight, and a single named invocation without inspect-based discovery.
This is a documented use of the existing preflight interface, not a runtime implementation change.

The create-hsm/no-skill/2 and create-hsm/no-skill/3 trials exposed a separate approval-boundary failure.
Calling init --help created nine files before approval, then the executor removed them.
The action trace therefore fails source-approval even though the ending hash comparison contains only approved files.
An isolated reproduction confirmed the CLI behavior; see [creation-help evidence](evidence/init-help-side-effect.json).
The user approved PLAN-005's narrow creation-help fix and fresh comparable baseline on that fixed runtime.
No further old-runtime trials will launch; all launched trials finished and retained their evidence.
Portable and guidance adoption remain blocked.

The third with-skill create-hsm trial authored WORK's child states with the wrong manifest keys: states and initial_state instead of substates and initial_substate.
Independent runtime validation rejects its WORK.COLLECT target and identifies both nested prompts as orphaned.
The trial's final response blamed the runtime; the independent evidence identifies an authored-manifest error.
Retain that failed topology assertion and clarify the existing nested-state authoring contract in the approved guidance work.
Do not fix the frozen baseline artifact or expand this into a runtime schema change.

The pre-change manager release was 1.0.1 with bundle SHA-256 1a02f828c73616ffcfe4f9e24312067e51ec1dbd555c73ea04161343447a6e67.
The frozen 1.1.0 baseline bundle has SHA-256 be9b7704b15d1085df92fbcf0e67142414ede266774b7df40ca52d9a04992f06.
All completed trials used that exact bundle and the same recorded runtime build.
Synthetic records created by unit tests are not evaluation results.
