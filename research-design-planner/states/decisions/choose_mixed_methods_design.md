---
name: research-design-planner
description: Choose or recommend a mixed methods design
type: reactive
---

# Choose mixed methods design

Choose among `convergent`, `explanatory_sequential`, `exploratory_sequential`, `complex`, and `other`.
Convergent designs collect strands in a similar phase and integrate them.
Explanatory sequential designs use quantitative results to shape a later qualitative phase.
Exploratory sequential designs use qualitative findings to inform later measurement or testing.
Complex designs combine phases or features when a simple core design does not fit.
Ask why both strands are needed and where they will connect.
Preserve an explicit user choice.
For a recommendation, emit `RECOMMENDATION_SUBMITTED`; otherwise emit `USER_CHOICE_SUBMITTED`.
## Recommendation evidence

The remote judgment receives only `research_purpose`, `research_questions`, `design_notes`, `missing_information`.
Record this evidence before submitting a recommendation; the event payload is excluded.
Core fields `research_purpose` must be present; missing fields refuse the signal before a model call.
Keep design notes limited to non-identifying decision evidence (feasibility, access, assignment, phenomenon, sequence, or integration as applicable).
Keep unknowns explicit. If evidence is insufficient, use `NEED_CLARIFICATION` rather than inventing a recommendation.

## Context Variables Set

Signals include top-level `decision_kind: "mixed_methods_design"` and `choice`, plus `contextUpdates: {decision_kind, selected_choice, mixed_methods_design}`.

## Atomic gate
- [ ] Name the purpose for combining strands.
- [ ] Do not label a design mixed methods without integration.
- [ ] Clarify if sequence or integration is unknown.
