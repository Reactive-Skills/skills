---
name: research-design-planner
description: Choose or recommend a research approach
type: reactive
---

# Choose approach

Choose among `quantitative`, `qualitative`, `mixed_methods`, and `other`.
Use the research problem, purpose, questions, intended audience, worldview if stated, and feasible evidence needs.
Quantitative work fits questions about measured variables, patterns, relationships, or effects.
Qualitative work fits questions about meaning, experience, process, culture, or context.
Mixed methods fits a purpose that needs planned integration of both forms of evidence.
These are fit considerations, not rules that force a single answer.
Preserve an explicit user selection.
If the user asks for a recommendation, emit `RECOMMENDATION_SUBMITTED`; otherwise emit `USER_CHOICE_SUBMITTED`.
## Context Variables Set

Signals include top-level `decision_kind: "research_approach"` and `choice`, plus `contextUpdates: {decision_kind, selected_choice, selected_approach}`.

## Atomic gate
- [ ] Compare the choice with the stated problem and purpose.
- [ ] Do not infer a worldview.
- [ ] Use `other` or clarification when fit is unclear.
