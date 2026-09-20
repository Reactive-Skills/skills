# jsm-workflow Context

## Source Corpus

This skill is an event-driven Reactive Skill state machine implementation based on the **Engineering Workflow Skills** designed by [Adrian Hajdin / JS Mastery](https://jsmastery.com/skills) ([GitHub](https://github.com/jsmastery-pro/skills)).
The source corpus contains the nine workflow skills: `scope`, `architect`, `audit`, `develop`, `check`, `test`, `debug`, `document`, and `sync`.
The `verify` and `review` phases come from the two modes of the source `check` skill.

## Derived SDLC Model

The lifecycle starts at Intake to understand what work is requested and select the right route:
- Greenfield / new product slice: routes to `Scope` &rarr; `Architect` &rarr; `Audit` &rarr; `Develop`.
- Brownfield / existing codebase: routes to `Audit` first to seed `AGENTS.md`, then routes to `Scope`.
- Direct bug fix: routes straight to `Debug` without needing scope or specs.
- Direct pre-specced change: routes straight to `Develop`.

It turns requests into scoped work with acceptance seeds and configurable workflow tier (Prototype, Alpha, Beta, GA).
It settles load bearing design decisions before implementation.
If implementation owes an unrecorded decision, the developer may architect first or record an `Assumed` spec (`Status: Assumed`) that flags ratification debt without blocking completion.
It builds from the scope, design, and context rather than from invention.
It verifies behavior in the running product or service.
It writes tests for durable behavior that callers rely on.
It debugs failures by reproducing them, finding root causes, and handing regression tests to test.
It reviews the diff with fresh eyes on a different model before merge.
It documents the change from evidence.
It syncs durable context, scope status, and decision status from repo evidence.

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
The reopened decision must update the spec and ADR when applicable, then route forward through context and build again.

## Bubbled Event Semantics

`DECISION_REOPENED` is handled once by the `ACTIVE` compound parent and bubbles from any active child phase.
Its transition targets `ACTIVE.ARCHITECT`, where the decision and ADR are revised before context and build work resume.
When a phase emits it, preserve that phase record and add `reopened_from`, `reason`, and `downstream_work_to_rerun` to `decision_record`.

## Projection Records

Every phase should update one context record before it emits a transition signal.
Records are plain objects so templates can render deterministic artifacts.
Use `unknown`, `none`, or an empty array instead of omitting expected keys.
Do not put secrets, credentials, private tokens, or unrelated chat history into records.

## ADR Policy

ADRs are produced only for load bearing architecture decisions.
A decision is load bearing when changing it later would alter data shape, integration boundaries, security posture, deployment topology, persistence, public API, cross cutting conventions, or user visible workflow structure.
Small local implementation choices do not need ADRs.
When an ADR is warranted, write it under `docs/adr/` or `.workflow/adr/` unless the repo already has another ADR location.
The `decision_record` must include `adr_needed`, `adr_path`, `status`, `decision`, `consequences`, and `alternatives`.
