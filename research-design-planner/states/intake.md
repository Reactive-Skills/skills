---
name: research-design-planner
description: Start from the user's current research design need
type: reactive
---

# Intake

Accept a complete request, partial idea, existing plan, or uncertainty.
Do not force the user to choose an approach before understanding their goal.
Capture the requested task and only the minimum non-identifying study context needed.
On `INTAKE_COMPLETE`, include captured fields under `payload.contextUpdates` using declared context keys.
Ask at most one short question if the goal cannot be routed.
If the user wants an existing plan reviewed, set `review_mode: true` and preserve only relevant non-identifying details under context updates, then emit `EXISTING_PLAN_REVIEW`.
Otherwise emit `INTAKE_COMPLETE`, or `NEED_CLARIFICATION` when a key ambiguity blocks routing.

## Atomic gate
- [ ] Preserve the user's wording for the goal.
- [ ] Keep unknown details unset.
- [ ] Do not collect participant names or contact details.
