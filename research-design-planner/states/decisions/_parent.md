---
name: research-design-planner
description: Decision routing and exact dispatch
type: reactive
---

# Decision router

Present only the active decision state's declared choices.
For a user choice, emit `USER_CHOICE_SUBMITTED`; for a requested recommendation, emit `RECOMMENDATION_SUBMITTED`.
Both payloads need `decision_kind`, `choice`, and `contextUpdates` containing `decision_kind` and `selected_choice`.
Also update the relevant method field: `selected_approach`, `quantitative_design`, `qualitative_strategy`, or `mixed_methods_design`.
Recommendation transitions use categorical judgments with a 0.7 minimum confidence.

## DISPATCH

If the preceding recommendation reports `fallbackTriggered: true` or a judgment error, emit `GO_CLARIFY` with `contextUpdates: {judgment_fallback: true}`.
Otherwise route by exact values.

- `route_task`: explore to `GO_FOUNDATIONS`, approach to `GO_APPROACH`, proposal to `GO_PROPOSAL`, quantitative to `GO_QUANTITATIVE`, qualitative to `GO_QUALITATIVE`, mixed to `GO_MIXED_METHODS`, review to `GO_REVIEW`.
- `research_approach`: quantitative to `GO_QUANTITATIVE`, qualitative to `GO_QUALITATIVE`, mixed to `GO_MIXED_METHODS`.
- `quantitative_design`: survey to `GO_SURVEY`, experiment to `GO_EXPERIMENT`.
- `qualitative_strategy`: any declared strategy to `GO_QUAL_STRATEGY`.
- `mixed_methods_design`: any declared design to `GO_MIXED_DESIGN`.
- `other` routes to `GO_CLARIFY`; an invalid kind and choice pair routes to `NEED_CLARIFICATION`.

Do not invent categories or generate proposal text here.

## Atomic gate
- [ ] Preserve explicit choices.
- [ ] Route only declared pairs.
- [ ] Keep identifying participant details out of judgments.
