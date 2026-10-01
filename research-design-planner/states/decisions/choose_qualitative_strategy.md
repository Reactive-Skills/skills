---
name: research-design-planner
description: Choose or recommend a qualitative strategy
type: reactive
---

# Choose qualitative strategy

Choose among `narrative`, `phenomenology`, `ethnography`, `case_study`, `grounded_theory`, and `other`.
Use narrative inquiry for stories or individual experience over time.
Use phenomenology for the meaning of a shared lived experience.
Use ethnography for a cultural group and its practices in context.
Use a case study for an in-depth bounded case using rich evidence.
Use grounded theory when the goal is to develop an explanation or theory from data.
These are starting distinctions and may need discipline-specific refinement.
Preserve an explicit user choice.
For a recommendation, emit `RECOMMENDATION_SUBMITTED`; otherwise emit `USER_CHOICE_SUBMITTED`.
## Context Variables Set

Signals include top-level `decision_kind: "qualitative_strategy"` and `choice`, plus `contextUpdates: {decision_kind, selected_choice, qualitative_strategy}`.

## Atomic gate
- [ ] Match the strategy to the phenomenon and intended understanding.
- [ ] Do not infer access to a group or site.
- [ ] Clarify when more than one strategy fits.
