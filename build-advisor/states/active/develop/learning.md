# Plan learning and delivery

Use current-basis context.problem, story, and experience.
Define bounded experiments and milestones aligned with actual time, money, and team constraints.
Include an owner, measure, deadline or checkpoint, and stop condition for each experiment.
Record whether results are planned or observed.
Define launch criteria across the experience, including support.
Describe what the next generation should learn; do not assume three releases guarantee success or profitability.
Save context.learning_plan with basis_version, experiments, milestones, launch_criteria, and next_generation.
Save context.recommendation with basis_version, route, direction, rationale, and limitations.
Direction is proceed, revise, investigate, defer, or stop.

## Atomic checklist

- [ ] Milestones and launch criteria are actionable.
- [ ] Plan respects constraints and distinguishes learning from delivery.
- [ ] Recommendation cites the available evidence and uncertainty.
- [ ] Both records use context.basis_version.

Emit: DEVELOPMENT_READY with learning_plan and recommendation in payload.contextUpdates.

Emit: ROUTE_CHANGED, SITUATION_CHANGED, CANCEL, REVISE_PROBLEM using the shared event contract in CONTEXT.md.
