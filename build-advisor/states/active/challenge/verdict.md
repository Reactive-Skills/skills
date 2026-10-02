# Recommend a disposition

Use current-basis context.assessment and uncertainty_plan with available evidence.
Recommend proceed, revise, investigate, defer, or stop.
Explain the decisive findings and what would change the recommendation.
Separate a product that needs redesign from an idea that should be abandoned.
Planned tests support an investigation recommendation, not a claim of validated demand.
A positive recommendation may remain conditional.
Save context.recommendation with basis_version, route, direction, rationale, and limitations.
Set route to context.route.

## Atomic checklist

- [ ] Recommendation follows the inspected material.
- [ ] Unresolved tests remain unresolved.
- [ ] Material uncertainty and counterarguments are disclosed.
- [ ] Record uses context.basis_version.

Emit: VERDICT_READY with recommendation in payload.contextUpdates.
