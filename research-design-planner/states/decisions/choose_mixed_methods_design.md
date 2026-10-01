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
## Context Variables Set

Signals include top-level `decision_kind: "mixed_methods_design"` and `choice`, plus `contextUpdates: {decision_kind, selected_choice, mixed_methods_design}`.

## Atomic gate
- [ ] Name the purpose for combining strands.
- [ ] Do not label a design mixed methods without integration.
- [ ] Clarify if sequence or integration is unknown.
