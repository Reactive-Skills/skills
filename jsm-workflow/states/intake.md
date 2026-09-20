---
name: jsm-workflow
description: Capture the work request, repo state, and completion target.
type: reactive
---

# INTAKE

## Context

This phase starts one software change.
The change can be a new product slice, a feature, an enhancement, a bug fix, a verification pass, or a documentation only task.

## Objective

Turn the user request into a bounded work record that later phases can use.

## Deliverables

- Work request summary.
- Target repo or project area.
- Desired outcome.
- Known constraints.
- Missing facts that block planning.
- Initial lifecycle route.

## Constraints

Ask only for facts required to plan the work safely.
Do not infer business rules, user intent, or acceptance criteria when they are absent.
Do not choose tools, providers, or architecture in this phase.
Do not write code in this phase.

## Uncertainty

If the target, expected outcome, or current project state is unclear, ask the user to clarify before proceeding.
Do not silently assume missing requirements, business rules, or user preferences.

## Atomic Gate

- The requested change is named.
- The project area or repo root is known.
- The desired outcome is testable or the missing fact is identified.
- The route type is determined: standard feature planning, bug fix, brownfield context audit, or direct build.

## Task

Create the work request record in the current run context.
Update `work_request` with `summary`, `target`, `outcome`, `constraints`, `assumptions`, `route_type`, and `blockers`.
Set `run_id` if it is missing.
Use `.docs/jsm-workflow` for `artifact_base` unless the user provides another artifact base.
Emit `WORK_REQUEST_READY` when planning a greenfield project or standard new feature slice.
Emit `BUG_FIX_REQUESTED` when fixing a bug, defect, failure, or broken behavior (goes straight to debug, no scope or spec needed).
Emit `AUDIT_REQUESTED` when entering an existing codebase without established context or when asked to audit first.
Emit `DIRECT_BUILD_REQUESTED` when a governing spec already exists or the work is a small targeted change ready for build.
Emit `INTAKE_BLOCKED` when one required fact is missing and cannot be inferred safely.
