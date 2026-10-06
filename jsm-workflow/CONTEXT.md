# jsm-workflow Context

## Source Corpus

This skill is an event-driven Reactive Skill state machine implementation based on the **Engineering Workflow Skills** designed by [Adrian Hajdin / JS Mastery](https://jsmastery.com/skills) ([GitHub](https://github.com/jsmastery-pro/skills)).
The source corpus contains the nine workflow skills: `scope`, `architect`, `audit`, `develop`, `check`, `test`, `debug`, `document`, and `sync`.
The `verify` and `review` phases come from the two modes of the source `check` skill.

## Derived SDLC Model

The lifecycle starts at Intake to understand what work is requested and select the right route.
Greenfield work routes through `Scope` &rarr; `Architect` &rarr; `Audit` before the DoD approval gate.
Brownfield work may run `Audit` first to seed `AGENTS.md`, then route to `Scope`.
Bug fixes and direct pre-specced changes get a DoD approval before diagnosis or implementation.
Scope-only and audit-only runs also receive a DoD approval before the work is reported complete.

It turns requests into scoped work with acceptance seeds and configurable workflow tier (Prototype, Alpha, Beta, GA).
It settles load bearing design decisions before implementation.
If implementation owes an unrecorded decision, the developer may architect first or record an `Assumed` spec (`Status: Assumed`) that flags ratification debt without blocking completion.
It builds from the scope, design, and context rather than from invention.
It verifies behavior in the running product or service.
It writes tests for durable behavior that callers rely on.
It debugs failures by reproducing them, finding root causes, and handing regression tests to test, with three repair attempts per failure before the run blocks.
It reviews the diff in a fresh context that never saw the build work, on a different model when available, before merge.
It documents the change from evidence.
It syncs durable context, scope status, and decision status from repo evidence.

Each implementation route converges on one DoD approval before changes begin.
The concise approval card records outcome, deliverables and locations, setup and use, itemized criteria with observable results and evidence methods, boundaries, assumptions, gotchas, approved decisions, and planned external actions.
Scope, workflow tier, architecture, UI direction, and optional documentation recommendations appear in that same approval card.
After approval, exact checks run deterministically and Jev judges semantic criteria at a 0.85 probability pass threshold.
`skill.yaml` declares `min_probability: 0.85` on that judgment, which needs runtime 0.19.0 or later with the `judgment.probability_thresholds` and `judgment.context_paths` capabilities.
The judgment sets `context_paths: []` and `include_payload: true`, so Jev sees only the submitted `active_check` from the signal payload and none of the run context; older runtimes refuse the skill rather than sending the whole run.
Each semantic check includes a focused question tied to one criterion ID; a failed judgment records unsupported assertions and routes those items to repair and re-verification.
Both approval gates refuse a DoD that lacks an outcome or has a criterion without a unique ID, question, expected result, check type, or evidence method.
The lifecycle reaches COMPLETE only when all approved criteria pass with evidence.
Unmet work ends in BLOCKED.

## Phase Map

| Phase | Source evidence | Purpose |
| --- | --- | --- |
| Intake | Shared ask versus act rules | Establish the task and missing facts before work begins. |
| Scope | `scope` | Decide what to build, order it, and seed acceptance criteria. |
| Architect | `architect` | Resolve decisions that would otherwise be guessed during implementation. |
| Audit | `audit` | Create or update durable agent context before the build relies on it. |
| Develop | `develop` | Build the feature, UI, backend, service, or data slice from a governing decision. |
| Verify | `check verify` | Exercise the real app or service against acceptance criteria. |
| Test | `test` | Add automated tests for the behavior that should stay true. |
| Debug | `debug` | Reproduce, localize, hypothesize, fix, and verify failures. |
| Review | `check review` | Review the change with fresh attention before merge. |
| Document | `document` | Write PR text, release notes, changelog entries, or postmortems from evidence. |
| Sync | `sync` | Reconcile durable context and lifecycle artifacts after the change. |

## Prompt Standards

Each state prompt must be grounded in a real task.
Each prompt must state concrete deliverables.
Each prompt must include only constraints that change the result.
Each prompt must require explicit assumptions when facts are missing.
Each prompt must place the concrete task at the end.
Each prompt must avoid fake stakes, exaggerated personas, and boilerplate reasoning cues.

## Signals

Use success signals only after the atomic gate in the current state passes.
Use deferred signals when the work is valid but intentionally not needed for this change.
Use blocked signals when required inputs or authority are missing.
Use loopback signals when evidence shows the lifecycle must revisit an earlier phase.
Use `DECISION_REOPENED` from any phase under the `ACTIVE` parent when evidence or user direction changes a load bearing decision.
The reopened decision must update the spec and ADR when applicable.
If it changes an approved outcome or load-bearing decision, request approval for a focused DoD diff before implementation resumes.
Use `DOD_CHECK_SUBMITTED` only for one atomic semantic check; Jev is the default adapter and a failed, sub-threshold, or unavailable judgment routes to repair.
The decision adapter is declared separately from the DoD criteria so another compatible decider can replace it without changing acceptance items.
Exact DoD checks remain executable commands or guards and never go through Jev.

## Bubbled Event Semantics

`DECISION_REOPENED` is handled once by the `ACTIVE` compound parent and bubbles from any active child phase.
Its transition targets `ACTIVE.ARCHITECT`, where the decision and ADR are revised before context and build work resume.
When a phase emits it, preserve that phase record and add `reopened_from`, `reason`, and `downstream_work_to_rerun` to `decision_record`.
`DOD_CHANGE_REQUESTED` is handled once by the `ACTIVE` compound parent, bubbles from any active child phase to `ACTIVE.DOD_AMENDMENT`, and carries the proposed diff, reason, and downstream work to rerun.
Emit it with the full `dod_record` plus `pending_diff`, `revision_reason`, and `downstream_work_to_rerun`, because `contextUpdates` replaces each top level record.

## Projection Records

Every phase should update one context record before it emits a transition signal.
Records are plain objects so templates can render deterministic artifacts.
Use `unknown`, `none`, or an empty array instead of omitting expected keys.
Do not put secrets, credentials, private tokens, or unrelated chat history into records.

`dod_record` contains `version`, `status`, `highlights`, `outcome`, `deliverables`, `setup_steps`, `criteria`, `assumptions`, `gotchas`, `exclusions`, `decisions`, and `external_actions`.
Each DoD criterion has a unique `id`, one atomic `question`, `expected_result`, `check_type`, `evidence_method`, optional exact `command`, `status`, and evidence.
`dod_audit_record` contains per-item results, Jev probability, exact command results, failed item IDs, passed and failed counts, and evidence location.
The exact completion guard independently requires every criterion to be marked passed with evidence.
Guards read the stored context before a signal's `contextUpdates` merge, so the completion guard checks the `dod_record` carried by `DOD_AUDIT_PASSED`, or the stored record when the signal omits it.
The DoD check judgment reads the active check only from the signal, because the stored record still holds the previous check.

## ADR Policy

ADRs are produced only for load bearing architecture decisions.
A decision is load bearing when changing it later would alter data shape, integration boundaries, security posture, deployment topology, persistence, public API, cross cutting conventions, or user visible workflow structure.
Small local implementation choices do not need ADRs.
When an ADR is warranted, write it under `docs/adr/` or `.workflow/adr/` unless the repo already has another ADR location.
The `decision_record` must include `adr_needed`, `adr_path`, `status`, `decision`, `consequences`, and `alternatives`.
