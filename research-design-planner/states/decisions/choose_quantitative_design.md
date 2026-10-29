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
## Recommendation evidence

The remote judgment receives only `research_purpose`, `research_questions`, `hypotheses`, `design_notes`, `missing_information`.
Record this evidence before submitting a recommendation; the event payload is excluded.
Record core fields `research_questions` before submitting. Runtime 0.20.0 refuses the signal before a model call only when a required path is absent; a present `null`, empty string, or empty array, including the manifest's `null` and `[]` defaults, still reaches the model.
Keep design notes limited to non-identifying decision evidence (feasibility, access, assignment, phenomenon, sequence, or integration as applicable).
Keep unknowns explicit. If evidence is insufficient, use `NEED_CLARIFICATION` rather than inventing a recommendation.

## Context Variables Set

Signals include top-level `decision_kind: "quantitative_design"` and `choice`, plus `contextUpdates: {decision_kind, selected_choice, quantitative_design}`.

## Atomic gate
- [ ] Distinguish association from causal claims.
- [ ] Do not promise causal inference without a suitable design.
- [ ] Clarify if the design depends on unknown access or assignment.
