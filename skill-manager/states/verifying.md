# VERIFYING State

## Objective and inputs

Determine whether the approved operation achieved its observable outcomes.
Consume `context.plan`, approval and operation evidence, the target/source/manager paths, checker results, and runtime state.
Use the approved absolute `{{context.target_skill_dir}}` within `{{context.authoring_source}}`.
Keep the same manager run UUID, absolute manager path, and selected transport.
Use preflight or the manifest for manager metadata; do not create an inspection job.
Run target behavior checks by absolute target path in an isolated test workspace.
Do not install prerequisites, alter providers, or widen the approved task manifest to complete a check.

## Verify artifacts and structure

Recheck approval for the exact changed paths and operations, and canonical source containment including links.
Unapproved or outside-source writes fail verification, even when content checks pass.
For CREATE or UPDATE, run the bundled `node "{{context.manager_skill_dir}}/scripts/authoring-quality.cjs" "{{context.target_skill_dir}}" --json`.
For passive UPDATE, also run the supported standard frontmatter command recorded in `context.plan.frontmatter_check`.
For passive UPDATE, require valid YAML frontmatter with the preserved nonempty name and description; compare actual content with the approved change and the capture at `{{context.plan.pre_update_capture_dir}}`.
For passive UPDATE, confirm no `skill.yaml`, `skill.yml`, reactive bootloader or unapproved scaffolding was added, passive identity remains intact, and protected content and unplanned files match the capture, excluding the manager-owned runtime paths `.reactive/` and `.docs/skill-manager/`.
For standard CREATE, also run the supported standard frontmatter command recorded in `context.plan.frontmatter_check`; require valid YAML frontmatter with `name` equal to `skill_name` and a nonempty description.
For standard CREATE, confirm no `skill.yaml`, `skill.yml`, reactive bootloader or unapproved scaffolding was written and the target holds only approved paths, excluding the manager-owned runtime paths `.reactive/` and `.docs/skill-manager/`.
For CREATE, observed `target_type` must equal `plan.target_type`; a mismatch fails verification.
Do not call runtime validate on passive targets: it requires a reactive manifest.
For reactive CREATE/UPDATE, retain the selected runtime's `validate "{{context.target_skill_dir}}"` and all reactive structure, bootloader and guard checks.
Re-observe actual target type; a present or malformed manifest must never select the passive branch.
An unavailable required checker or failed comparison is a verification failure.
Definite checker or structural errors fail verification; navigation and size warnings remain advisory.
For CREATE, verify the requested artifacts exist.
For UPDATE, compare approved paths with the approved change and every other target path with the capture at `{{context.plan.pre_update_capture_dir}}`, excluding the manager-owned runtime paths `.reactive/` and `.docs/skill-manager/`; any other difference fails verification.
For DELETE, verify the exact approved target is absent without replaying deletion.

For reactive targets only, check each manifest prompt path, referenced state file, and justified parent placeholder; identify orphans and unexplained empty state directories.
Resolve initial states and every transition target recursively, including dotted targets under `substates` and `initial_substate`.
Compare the diagram with hierarchy, guards, signals, and inherited parent handlers.
Validate the structure before attributing unexpected transitions to runtime defects.
Check declared context roots and documented payload properties separately.

For reactive targets only, verify exactly one complete canonical bootloader pointer, rendered for the target name from the manager template and under 50 lines.
Shared bootloader logic remains runtime-owned.
Any bypass prompt must permit the selected runtime transport.
Verify declared middleware only where applicable: module presence, supported hook signatures, declared invariant context keys, and valid sanitizer patterns.
Report unavailable checks explicitly.

## Verify guards and transition behavior

For passive UPDATE, guard/runtime tests are not applicable; record that fact, the actual frontmatter/reference command results, identity/content comparisons and source/approval evidence.
For standard CREATE, guard/runtime tests are likewise not applicable; record that fact, the actual frontmatter/reference command results, approved-path comparison and source/approval evidence.
Do not invent guards, states, a manifest or bootloader to make verification fit.

For reactive targets, read every guard and inspect its JavaScript syntax, deterministic behavior, Boolean semantics, and context or payload references.
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

Persist observed `contextUpdates.target_type` and per-check receipts with command, result, comparison evidence and coverage limits.
Signals record host-supplied results; the runtime does not execute or authenticate those checks or human approval.
If all required checks pass, emit `VERIFIED_OK` with top-level `exit_code: 0` and the verification evidence.
If a required check fails or cannot be completed, emit `VERIFIED_FAIL` with `exit_code: 1`, failed checks, and coverage limits.
Preserve the existing transitions to PROJECTING on verified success and ROLLING_BACK on failure.
Do not weaken the guard, invent a new transition, or introduce a repair loop.
