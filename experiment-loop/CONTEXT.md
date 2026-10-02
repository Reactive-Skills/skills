# Experiment loop context

Schema: 2.1.0.
Package: 1.0.0, experimental channel, Alpha maturity.
Runtime: 0.16.0 or newer with bootloader, transport handshake, and accepted_update_replay capability.
The globally installed 0.16.0 package lacks the replay repair and has a parent-dispatch defect.
Use the verified local source build until a repaired runtime is distributed.

## Domain boundary

An experiment answers a bounded question with observable outcomes and a credible evaluation procedure.
An improvement loop can compare prompt reliability, code performance, or workflow behavior under declared conditions.
Literature synthesis, causal inference, qualitative interpretation, and delayed business outcomes require an appropriate research design and evidence method.
This workflow does not turn every question into an objective score or establish universal research capability.
The research-design-planner can help specify those methods before execution.
Neither it nor prompt-builder is required at runtime.

## Language

The baseline is the preserved original artifact.
A proposal is a reversible candidate intervention within the approved file surface.
The incumbent is the best retained selection result, initially the baseline.
Development cases support diagnosis and construction.
Selection cases support exploratory comparison and repeated candidate choice.
Confirmation cases support one separate comparison after selection ends.
Observed describes an executed measurement with retrievable evidence.
Predicted, simulated, and model-interpreted evidence must keep their labels.
Model judgments may evaluate observed outputs when the fixed calibrated rubric is the declared measurement method.

## Context protocol

Declare records in context_schema and default_context; submit changes inside payload.contextUpdates only.
The legacy context_keys array is deliberately empty because runtime 0.16.0 premerges matching top-level inputs before evaluating guards.
Top-level protected record inputs and unexpected update keys are rejected.
Per-signal wrappers bind the expected signal so a supplied payload cannot select a different guard.
The runtime owns ledger persistence and projections.
Its run identifier and the named job retain identity across reopening; use distinct job names for distinct experiments.

All records are JSON values.
Use file references or durable artifact identifiers for evidence, not credentials or raw private transcripts.
Guard validation checks declared records, not the truth of their contents.
Runtime ledger writes and tools that edit the database directly are outside the supported workflow.

## Contract

| Field | Meaning |
| --- | --- |
| id, revision, goal | Stable experiment identity, positive revision number, intended decision and outcome |
| hypothesis | Explicit testable proposition linking the candidate intervention to the intended outcome |
| metric | name, direction min or max, nonnegative minimum_improvement, comparison paired-margin |
| development_cases, selection_cases, confirmation_cases | Nonempty, globally distinct case identifiers |
| editable_paths, protected_paths | Exact workspace-relative candidate files and protected surfaces; use normalized forward slashes |
| evaluator | id, version, digest, command, environment_id, evidence_method, good_refs, bad_refs, isolation, isolation_ref |
| min_repeats | At least two repeated aggregate measurements per artifact over the same full case partition |
| crucial_criteria | Unique criterion identifiers which must all pass |
| budget | max_trials, max_seconds, max_cost, trial_seconds, trial_cost, confirmation_seconds, confirmation_cost |
| promotion_policy, stop_policy | Authorized promotion and stopping behavior, including external permissions |

The paired-margin policy requires every paired difference to favor the candidate and the mean to meet the practical margin.
Mixed directions or insufficient improvement are inconclusive.
Uniform deterioration or a crucial failure is worse.
Nonmatching sample keys or arithmetic overflow are invalid.
This conservative screening rule is not a statistical significance test.
Record any appropriate uncertainty analysis in evidence and limitations; other comparison algorithms require a reviewed skill update.
Repeat counts, thresholds, and evaluator design must fit the task rather than suggest a universal sample-size rule.

The evaluation host must enforce timeouts, cost limits, evaluator immutability, file isolation, and confirmation access controls when required.
State guards cannot stop a running process or prove file contents stayed fixed.
If isolation is unavailable, evaluator.isolation is reviewed_limitations and isolation_ref points to the reviewed limitation.
Otherwise isolation is enforced and isolation_ref points to the actual host control evidence.
Never treat a declaration as a security boundary.

## Records

Approval contains contract_id, revision, approved: true, owner, and source identifying actual user authorization.
Calibration contains contract_id, revision, kind: observed, good_passed: true, bad_failed: true, and evidence_refs.
Progress contains nonnegative cumulative trials, seconds, and cost.
Include calibration, baseline, diagnosis, construction, trial, and confirmation costs when applicable.
Reserve trial and confirmation allowances before each proposed run.
After execution record actual consumption, including overruns; subsequent work must fit the remaining budget.
Contract revision preserves spending and invalidates approval, calibration, baseline, incumbent, proposal, trial, and confirmation.

A measurement contains contract_id, revision, kind: observed, status: measured, artifact_id, evaluator_id, evaluator_version, evaluator_digest, environment_id, case_ids, evidence_refs, samples, and criteria.
Samples contain unique paired key values and finite numeric value measurements.
Each key identifies one repeated aggregate over the full recorded partition using the same aggregation method.
Criteria contain the exact crucial identifiers as id and boolean passed values.
The raw per-case outputs and aggregation procedure belong in evidence_refs.
A failed or invalid trial instead records its matching contract and artifact, status, reason, and evidence_refs.

Proposal contains contract_id, revision, unique id, hypothesis, changed_paths, artifact_ref, and reversible: true.
Assessment contains diagnosis and evidence_refs before proposing, or outcome at the retention decision.
History appends candidate_id, outcome, and evidence_refs without rewriting prior attempts.
Incumbent contains id and the exact retained measurement.
Confirmation contains contract_id, revision, candidate_id, separately measured baseline and candidate records, and outcome.
SEARCH_FINISHED appends the reserved identifiers to consumed_confirmation_cases, which is never reset by contract revision.
A revision must use confirmation identifiers outside that consumed set.
Contract changes during a pending trial or confirmation require interruption reconciliation first.
Stop contains kind and reason.
Report contains summary, incumbent_id, cleanup_complete, evidence_refs, limitations, and claimed_improvement.
Final reporting updates actual cumulative progress, including cleanup and interrupted work.
Only improved confirmation can support claimed_improvement: true.

## Recovery invariants

Pause contains reason, resume_phase, pending_trial, pending_confirmation, and reconciled: false.
The guard derives the valid recovery phase from the actual interrupted leaf.
Resume records reconciled: true and evidence_refs while preserving that phase and pending flags.
An interrupted trial consumes one trial after reconciliation before returning to diagnosis.
Reconcile its external actions and evidence; record their disposition in recovery evidence rather than silently repeating them.
Interrupted confirmation returns to finalization, even if measurement completion is uncertain.
Do not reuse those cases as untouched evidence.
Create genuinely new confirmation cases under a revised approved contract for another confirmatory cycle.
Cancellation and dependency failure bubble from active leaves or the paused state into cleanup and reporting.

## Audit and projections

Use the existing runtime event ledger for transition metadata and evidence lineage.
Runtime 0.16.0 has no supported manifest middleware field; this package adds no parallel persistence or custom middleware.
Snapshots and inventory are runtime-generated on transitions; reports are generated on accepted report signals.
Outputs use .docs/experiment-loop/<job>/ and runtime job archives.
Never manually author those projections.
The synthetic acceptance fixtures establish transition behavior and recovery, not effectiveness on real tasks.
