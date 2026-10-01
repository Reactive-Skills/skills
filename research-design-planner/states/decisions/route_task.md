---
name: research-design-planner
description: Route to the smallest useful research design path
type: reactive
---

# Route task

Choose one route: `explore_or_clarify_goal`, `choose_research_approach`, `work_on_proposal_section`, `plan_quantitative_methods`, `plan_qualitative_methods`, `plan_mixed_methods`, `review_existing_plan`, or `other`.
If the user named the task, preserve it and submit it as an explicit choice.
If the user is unsure and asks for help choosing a next step, recommend one route from the user's goal and available context.
For a recommendation, emit `RECOMMENDATION_SUBMITTED`.
For an explicit choice, emit `USER_CHOICE_SUBMITTED`.
## Context Variables Set

Signals include top-level `decision_kind: "route_task"` and `choice`, plus `contextUpdates: {decision_kind, selected_choice}`.
For `review_existing_plan`, also set `review_mode: true`.
If the goal is too unclear to choose responsibly, emit `NEED_CLARIFICATION`.

## Atomic gate
- [ ] Use one declared route.
- [ ] Keep an explicit user choice unchanged.
- [ ] Leave uncertainty to clarification.
