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
## Recommendation evidence

The remote judgment receives only `research_problem`, `research_purpose`, `research_questions`, `hypotheses`, `intended_audience`, `worldview`, `design_notes`, `missing_information`.
Record this evidence before submitting a recommendation; the event payload is excluded.
Record core fields `research_problem`, `research_purpose` before submitting. Runtime 0.20.0 refuses the signal before a model call only when a required path is absent; a present `null`, empty string, or empty array, including the manifest's `null` and `[]` defaults, still reaches the model.
Keep design notes limited to non-identifying decision evidence (feasibility, access, assignment, phenomenon, sequence, or integration as applicable).
Keep unknowns explicit. If evidence is insufficient, use `NEED_CLARIFICATION` rather than inventing a recommendation.

## Context Variables Set

Signals include top-level `decision_kind: "research_approach"` and `choice`, plus `contextUpdates: {decision_kind, selected_choice, selected_approach}`.

## Atomic gate
- [ ] Compare the choice with the stated problem and purpose.
- [ ] Do not infer a worldview.
- [ ] Use `other` or clarification when fit is unclear.
