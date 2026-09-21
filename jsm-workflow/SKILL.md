---
name: jsm-workflow
description: Reactive SDLC coordinator that guides a change from request intake through scope, design, context, build, verification, tests, debug, review, documentation, and sync.
type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> **REACTIVE SKILL: STRICT RUNTIME EXECUTION**
> This skill is an event-driven state machine. Manual execution is forbidden.
>
> **DEFAULT EXECUTION: AXI CLI**
> AXI is the default runtime path, even when MCP tools are present.
> - To start a new task: Run `reactive-skills-axi invoke jsm-workflow [--payload JSON]`
> - To resume an active task: Run `reactive-skills-axi state jsm-workflow`
> - For named or parallel work: Keep the same `--job <job-id>` flag on every command.
> - To advance state: Run `reactive-skills-axi emit jsm-workflow <signal>`
>
> **FALLBACK EXECUTION: MCP**
> Use `reactive_state` and `reactive_emit_signal` only when shell access to AXI is unavailable.
> Do not troubleshoot MCP before trying AXI.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run `reactive-skills-axi reset jsm-workflow` or `reactive-skills-axi invoke jsm-workflow`.
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
