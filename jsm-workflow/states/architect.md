---
name: jsm-workflow
description: Settle load bearing design decisions before implementation.
type: reactive
---

# ARCHITECT

## Context

This phase prevents the build from inventing important choices.
It follows the source corpus pattern where design owns specs and develop implements them.
It may run early before implementation or later when verification, tests, review, documentation, sync, or user direction reopens a decision.

## Objective

Record the decisions needed to build the current slice.

## Deliverables

- Decision topic.
- Requirements derived from scope.
- Options considered when there is a real choice.
- Recommended decision with reason.
- Named source for every value the build must produce, compute, store, or display.
- Build plan ordered for the chosen slice approach.
- Spec file under `docs/specs/` or `.workflow/specs/`.
- ADR under `docs/adr/` or `.workflow/adr/` when the decision is load bearing.
- Supersession or update note when this changes an earlier decision.
- `reopened_from`, `reason`, and `downstream_work_to_rerun` when entered by bubbled `DECISION_REOPENED`.

## Constraints

Follow the Asks vs Acts rule: never silently make a load bearing decision for the user.
Grill down to the core decisions: sort each dimension into INFER (derive from code/prompt), ASK (what only the user knows), and RECOMMEND (technical choices with a recommended pick, one-line why, and runner-up).
Use `ask_question` (or interactive decision panels) to walk through key architectural choices (data model/state representation, libraries/tools, key logic).
Present the draft spec summary to the user and obtain explicit confirmation before advancing.
Do not write implementation code.
Do not update durable project context here unless the spec itself owns the detail.
Do not create an ADR for a local implementation choice.

## Uncertainty

If a required value has no named source, mark it as a design gap.
If the user wants to defer a decision, record what cannot be built safely yet.

## Atomic Gate

- Core architectural decisions were routed through the user with concrete options and a recommendation.
- The user has confirmed the proposed spec.
- Every acceptance seed maps to a design requirement or an explicit non requirement.
- Every required value has a named source.
- The build plan can be followed without guessing a provider, data model, UI direction, or integration.
- The spec status and path are clear.
- ADR need is explicitly yes or no.
- When ADR need is yes, ADR path, status, decision, alternatives, and consequences are recorded.
- Reopened decisions identify what changed and which downstream work must rerun.

## Task

Interview the user on open architectural decisions using `ask_question` (or interactive decision panels).
Draft the governing build spec in `docs/specs/NNNN-<slug>.md` (status: Proposed) with numbered acceptance criteria.
Present the spec summary to the user for confirmation.
Create or update an ADR only when the decision is load bearing.
Update `decision_record` with `summary`, `spec_path`, `adr_needed`, `adr_path`, `status`, `decision`, `alternatives`, `consequences`, and `value_sources`.
Emit `SPEC_READY` when the user confirms the spec and the design is build ready.
Emit `DECISION_DEFERRED` when the user chooses not to settle a required decision now.
Emit `DESIGN_FLAW_CONFIRMED` when this phase proves the current scope must change first.
