# VERIFYING State

## Objective and inputs

Determine whether the approved operation achieved its observable outcomes.
Consume `context.plan`, approval and operation evidence, the target/source/manager paths, checker results, and runtime state.
Use the approved absolute `context.target_skill_dir` within `context.authoring_source`.
Keep the same manager run UUID, absolute manager path, and selected transport.
Use preflight or the manifest for manager metadata; do not create an inspection job.
Run target behavior checks by absolute target path in an isolated test workspace.
Do not install prerequisites, alter providers, or widen the approved task manifest to complete a check.

## Verify artifacts and structure

For CREATE or UPDATE, run `node "{{context.manager_skill_dir}}/scripts/authoring-quality.cjs" "{{context.target_skill_dir}}" --json` and the selected runtime's `validate "{{context.target_skill_dir}}"`.
Definite checker or structural errors fail verification; navigation and size warnings remain advisory.
For CREATE, verify the requested artifacts exist.
For UPDATE, compare actual content with the approved change and confirm protected files remain unchanged.
For DELETE, verify the exact approved target is absent without replaying deletion.

Check each manifest prompt path, referenced state file, and justified parent placeholder; identify orphans and unexplained empty state directories.
Resolve initial states and every transition target recursively, including dotted targets under `substates` and `initial_substate`.
Compare the diagram with hierarchy, guards, signals, and inherited parent handlers.
Validate the structure before attributing unexpected transitions to runtime defects.
Check declared context roots and documented payload properties separately.

Verify exactly one complete canonical bootloader pointer, rendered for the target name from the manager template and under 50 lines.
Shared bootloader logic remains runtime-owned.
Any bypass prompt must permit the selected runtime transport.
Verify declared middleware only where applicable: module presence, supported hook signatures, declared invariant context keys, and valid sanitizer patterns.
Report unavailable checks explicitly.

## Verify guards and transition behavior

Read every guard and inspect its JavaScript syntax, deterministic behavior, Boolean semantics, and context or payload references.
Static inspection and schema validation do not prove runtime guard enforcement.
For each guard that can be safely exercised, use isolated target runs to attempt both a violating and a satisfying signal payload.
Confirm the actual before/after state and ledger evidence: violation must remain blocked, satisfaction must reach the declared target.
For strict Boolean conditions, cover relevant missing or non-Boolean inputs.
Never exercise destructive or external effects without authorization.

Test inappropriate signals and attempted state skipping where relevant.
A declared parent handler may accept a signal absent from the active child's transitions; that is valid event bubbling.
Review transitions into irreversible actions for explicit authorization and guard protection.
An unconditional operation-result signal is not itself a success gate; this manager's successful verification remains guarded by `payload.exit_code == 0`.

Assess which emit inputs can influence guard decisions and which files the executor can modify.
Do not claim context or manifest immutability without observed runtime evidence.
Supported `contextUpdates` and manifest reloads across CLI processes are not proof of an enforced security boundary.
Report a demonstrably bypassed intended guard as a failure, and distinguish untested threat assumptions from verified guarantees.

Produce `guard_circumvention_report` with `total_guards`, `guards_tested`, `guards_passed`, `guards_failed`, `unguarded_critical_transitions`, and per-guard `details`.
Count a guard as tested only when both violating and satisfying cases were exercised.
Details identify signal, expression, payloads, observed blocking/passage, and evidence.
Report zero guards or incomplete execution honestly; never invent injections, approvals, or model coverage.

## Verify output claims

Runtime projections resolve against the runtime workspace, separately from the task authoring source.
After reaching PROJECTING and before the final report, enumerate actual `.docs/skill-manager/` files.
Correlate the retained UUID and resolved job name with `jobs/<resolved-job-name-or-UUID>/`.
Read snapshot and inventory contents to verify target skill, operation, and observed state.
Unqualified paths are optional active-job mirrors; a missing mirror does not mean the run produced no outputs.
Report only paths and contents actually verified, with incomplete coverage explicit.
Projection timestamps describe rendered data; use ledger events for exact transition or completion times.
The runtime owns projections; do not fabricate or manually repair them.

## Measurements and exit

Record raw source whitespace words separately from rendered words and host-measured tokens.
A state-specific budget without supporting evaluation evidence remains provisional, never a hard acceptance gate.
Preserve each state's objective, consumed context, allowed actions, observable exit, and signals.
Record actual tested executor models and harnesses independently of semantic capability tiers.

If all required checks pass, emit `VERIFIED_OK` with top-level `exit_code: 0` and the verification evidence.
If a required check fails or cannot be completed, emit `VERIFIED_FAIL` with `exit_code: 1`, failed checks, and coverage limits.
Preserve the existing transitions to PROJECTING on verified success and ROLLING_BACK on failure.
Do not weaken the guard, invent a new transition, or introduce a repair loop.
