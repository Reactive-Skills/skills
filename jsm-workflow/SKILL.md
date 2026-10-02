---
name: jsm-workflow
description: Reactive SDLC coordinator that guides a change from request intake through scope, design, context, build, verification, tests, debug, review, documentation, and sync.
type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "jsm-workflow"`.
> - AXI: run `reactive-skills-axi bootloader jsm-workflow --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader jsm-workflow --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
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
After the decision and ADR are updated when applicable, an accepted DoD change uses the amendment gate before implementation resumes.
Use this instead of forcing the current phase to patch around a changed decision.

## DoD and Approval Contract

The workflow drafts one DoD after scope, design, and context discovery, then waits for one approval before implementation.
The DoD names the outcome, deliverables and locations, setup and use, observable checks with evidence methods, assumptions, gotchas, exclusions, approved decisions, and planned external actions.
Scope and architecture recommendations appear in the same approval card.
After approval, exact checks run deterministically and Jev judges semantic criteria at a 0.85 probability pass threshold.
The runtime scores a Jev probability `p` as confidence `|2p - 1|`, so the judgment declares `min_confidence: 0.70`, which is exactly `p >= 0.85`.
The workflow repairs failed criteria and reruns affected checks.
The workflow requests approval again only for a focused DoD diff after an accepted outcome or load-bearing decision changes.
The workflow reaches COMPLETE only after every DoD criterion passes with recorded evidence.
Unmet work ends in BLOCKED.

## Operating Contract

Every state prompt follows prompt quality rules from the prompt standards.
Each prompt states grounded context, objective, deliverables, constraints, uncertainty handling, and the final task.
Each state includes an atomic gate so the agent can objectively decide whether to emit the next signal.
Each phase writes a structured record into context before emitting a success, deferred, or blocked signal.
The projection contract in `skill.yaml` uses those records to produce run artifacts under `.docs/jsm-workflow/<run_id>/`.

## Projected Artifacts

- dod.md: approved final output, setup, acceptance checks, evidence methods, and boundaries.

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
