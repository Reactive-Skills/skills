---
name: research-design-planner
description: Choose or recommend a quantitative design
type: reactive
---

# Choose quantitative design

Choose among `survey`, `experiment`, and `other`.
A survey can describe patterns or examine associations using measured variables.
An experiment plans a manipulation or intervention and a comparison to study effects.
Check whether the question is descriptive, relational, or causal before recommending.
Consider population, access, assignment, measures, timing, and feasibility.
Preserve an explicit user choice.
For a recommendation, emit `RECOMMENDATION_SUBMITTED`; for an explicit choice, emit `USER_CHOICE_SUBMITTED`.
## Context Variables Set

Signals include top-level `decision_kind: "quantitative_design"` and `choice`, plus `contextUpdates: {decision_kind, selected_choice, quantitative_design}`.

## Atomic gate
- [ ] Distinguish association from causal claims.
- [ ] Do not promise causal inference without a suitable design.
- [ ] Clarify if the design depends on unknown access or assignment.
