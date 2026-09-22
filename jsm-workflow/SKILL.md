---
name: jsm-workflow
description: Reactive SDLC coordinator that guides a change from request intake through scope, design, context, build, verification, tests, debug, review, documentation, and sync.
type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> **REACTIVE SKILL: STRICT RUNTIME EXECUTION**
> This skill is an event-driven state machine. Manual execution is forbidden.
>
> **LOCAL-FIRST RUNTIME SELECTION**
> Select one compatible runtime during INIT, then reuse it for the full run.
> - To start a new task, use selected runtime `invoke jsm-workflow [--payload JSON]`.
> - To resume an active task, use selected runtime `state jsm-workflow`.
> - For named or parallel work, keep the same `--job <alias>` flag on every command.
> - The runtime resolves aliases to immutable UUID-backed `run_id` values.
> - To advance state, use selected runtime `emit jsm-workflow <signal>`.
>
> **SELECTED RUNTIME COMMANDS**
> Use selected MCP or AXI path for every state and signal command.
> First check `reactive_capabilities` when this MCP tool is available.
> Otherwise check `reactive-skills-axi capabilities --json`, then use direct AXI.
> Otherwise use `npx -y @reactive-skills/axi capabilities --json`, then use zero-install AXI.
> MCP uses `reactive_state` and `reactive_emit_signal`.
> Direct AXI uses `reactive-skills-axi state|emit jsm-workflow`.
> Zero-install AXI uses `npx -y @reactive-skills/axi state|emit jsm-workflow`.
> Emit `RUNTIME_READY` with `transport`, `launcher`, `runtime_version`, `axi_version`, `compatible`, and `capabilities`.
> Persist the selected runtime in `payload.contextUpdates` so later states reuse it.
> AXI remains the runtime interface. `npx` is only its zero-install launcher.
> Do not repeat version or capability checks after INIT.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run selected runtime `reset jsm-workflow` or `invoke jsm-workflow`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# jsm-workflow

This skill coordinates a complete software delivery lifecycle, implementing the **Engineering Workflow** designed by [JS Mastery](https://jsmastery.com/skills) ([GitHub](https://github.com/jsmastery-pro/skills)) as an event-driven Reactive Skill state machine.
It operates as a standalone reactive orchestrator across intake, scope, architecture, context audit, build, verification, tests, debug, review, documentation, and sync.

## Lifecycle

1. Intake: establish the request, repo state, and desired outcome.
2. Scope: turn the request into ordered work with acceptance seeds.
3. Architect: settle load bearing decisions before implementation.
4. Audit: ensure durable project context exists before build work.
5. Develop: implement from the agreed scope, decisions, and context.
6. Verify: run the real product or service and prove behavior.
7. Test: write or update tests for durable behavior.
8. Debug: reproduce, localize, fix, and verify failures.
9. Review: review the diff with fresh attention before merge.
10. Document: write human facing change prose from the record.
11. Sync: update durable context, scope, and decision status from repo evidence.

## Bubbled Events

`DECISION_REOPENED` is a lifecycle level event.
Any active lifecycle phase may emit it when evidence or user direction changes a load bearing decision.
The event bubbles to the `ACTIVE` parent, which routes to `ACTIVE.ARCHITECT`.
After the decision and ADR are updated when applicable, the lifecycle moves forward through context and build again.
Use this instead of forcing the current phase to patch around a changed decision.

## Operating Contract

Every state prompt follows prompt quality rules from the prompt standards.
Each prompt states grounded context, objective, deliverables, constraints, uncertainty handling, and the final task.
Each state includes an atomic gate so the agent can objectively decide whether to emit the next signal.
Each phase writes a structured record into context before emitting a success, deferred, or blocked signal.
The projection contract in `skill.yaml` uses those records to produce run artifacts under `.docs/jsm-workflow/<run_id>/`.

## Projected Artifacts

- `intake.md`: request, target area, desired outcome, constraints, assumptions, blockers.
- `lifecycle.md`: scope, decision, context, build, document, and sync summary.
- `adr.md`: architecture decision record summary when the change makes or changes a load bearing decision.
- `verification.md`: behavior checks, acceptance results, failures, deferred checks.
- `review.md`: reviewed diff, findings, missing tests, residual risk.
- `handoff.md`: final result, changed artifacts, checks, blockers, next action.

## Source Policy

Use only the SDLC model captured in `CONTEXT.md`.
Do not import extra lifecycle phases from external agent skills.
Do not call another skill as a child dependency.
The result must stand alone.
