# EISENHOWER_PRIORITIZATION State

## Goal
Triage the SMART requirements into the 4 quadrants of the Eisenhower Prioritization Matrix to establish the essential MVP scope and eliminate scope bloat.

## Context Variables Read
- `context.product_name`
- `context.smart_requirements`

## Tools
- `ask_question`
- `view_file`
- `write_to_file`

## Instructions
1. Evaluate each requirement across two orthogonal axes:
   - **Importance**: Degree of impact on core user value, strategic goals, and business viability.
   - **Urgency**: Criticality to the immediate feedback loop, architectural foundation, or unblocking downstream slices.
2. Sort requirements into the **4 Eisenhower Quadrants**:
   - **Quadrant 1: Urgent & Important ("Do Now / Core MVP")**:
     - The non-negotiable critical path and walking skeleton.
     - Without these, the product or enhancement cannot function or be validated.
     - Mapped to: `eisenhower_matrix.q1_do_now`
   - **Quadrant 2: Important, but Not Urgent ("Schedule / Quality & Depth")**:
     - Long-term strategic differentiators, hardening, error handling, performance tuning, and secondary flows.
     - Scheduled for follow-on vertical slices post-MVP.
     - Mapped to: `eisenhower_matrix.q2_schedule`
   - **Quadrant 3: Urgent, but Less Important ("Delegate / Automate / Ops")**:
     - Tactical friction-reducers, developer tooling, scaffolding, setup scripts, or low-complexity operational tasks.
     - Can be delegated to subagents, junior developers, or third-party tools.
     - Mapped to: `eisenhower_matrix.q3_delegate`
   - **Quadrant 4: Neither Urgent nor Important ("Defer / Reject / Cut")**:
     - Nice-to-haves, premature optimizations, gold-plating, or requests that dilute the core value proposition.
     - Formally logged in the **Cut Log** with an explicit justification for rejection/deferral.
     - Mapped to: `eisenhower_matrix.q4_defer_reject`
3. Update context:
   - `eisenhower_matrix`: Object containing `q1_do_now`, `q2_schedule`, `q3_delegate`, `q4_defer_reject` arrays with requirement references and triage rationales.

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Every SMART requirement is assigned to exactly one Eisenhower quadrant.
- [ ] Quadrant 1 contains only the minimal, necessary core to form a walking skeleton / MVP (strictly guarded against bloat).
- [ ] Every item in Quadrant 4 has a recorded justification explaining why it was deferred or rejected.
- [ ] Triage decisions are bound to `context.eisenhower_matrix`.

## Stop Criteria
Prioritization complete. Emit `PRIORITIZATION_COMPLETE`. If scope re-evaluation is needed, emit `REVISE_SCOPE`.

## Signals
- `PRIORITIZATION_COMPLETE`
- `REVISE_SCOPE`
