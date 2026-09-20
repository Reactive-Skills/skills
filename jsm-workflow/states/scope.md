---
name: jsm-workflow
description: Convert the request into ordered work with acceptance seeds.
type: reactive
---

# SCOPE

## Context

This phase decides what work belongs in the current slice.
It follows the source corpus pattern where scope owns the ordered plan and acceptance seeds.

## Objective

Produce or update a coarse scope for the requested change.

## Deliverables

- Feature or task name.
- Intent in one or two sentences.
- Done when line with acceptance seeds.
- Ordered steps or milestones.
- Workflow tier when useful: Prototype, Alpha, Beta, or GA.
- Next lifecycle phase recommendation.

## Constraints

Follow the Asks vs Acts rule: never silently decide delivery approach or workflow tier for the user.
Present every choice as an options panel (using `ask_question` or interactive prompt), never a neutral menu: 2 to 4 concrete options with exactly one marked `(Recommended)` and a one-line rationale.
Ask the two core scope questions before finalizing:
1. Delivery approach: Tracer bullet (thin thread end-to-end first), MVP (smallest usable skateboard), UI-first prototype (facade first, wire later), or Vertical slice (one complete user journey).
2. Workflow tier: Prototype (build only), Alpha (adds verify), Beta (adds test suite), or GA (adds cross-model review and docs).
Keep scope about what to build, not how to implement it.
Do not select libraries, providers, schema details, or architecture here.
Use `docs/scope/` unless the repo already uses `.workflow/scope/`.
Edit existing scope surgically when one exists.

## Uncertainty

If the request could be one feature or a larger product plan, ask which level the user wants.
If the user asked only for planning, mark the work as scope only.

## Atomic Gate

- The user has confirmed the delivery approach and workflow tier via an interactive decision panel.
- The scope identifies one current slice or a clear scope only outcome.
- Acceptance seeds describe observable behavior.
- The next needed phase is explicit.
- The scope does not contain implementation decisions that belong in design.

## Task

Present the delivery approach and workflow tier choices to the user using `ask_question` (or interactive decision panels).
Write or update the scope document and record for this work.
Update `scope_record` with `summary`, `feature`, `intent`, `acceptance_seeds`, `delivery_approach`, `workflow_tier`, `scope_path`, and `next_phase`.
Emit `SCOPE_READY` when design or build work should continue.
Emit `SCOPE_ONLY` when the user only wanted scope planning.
Emit `SCOPE_BLOCKED` when scope needs a missing product decision.
