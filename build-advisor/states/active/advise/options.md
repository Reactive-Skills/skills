# Compare options

Use the current-basis diagnosis, situation, constraints, and evidence.
Develop at least two plausible choices.
Include waiting or continuing the current approach when relevant.
Explain each choice's consequences for customers, people, cost, time, and reversibility.
Identify unsupported expectations instead of inventing financial or personnel outcomes.
Consider a bounded experiment when important uncertainty is resolvable.
Save context.options with basis_version and choices.
Each choice has choice and consequences; include additional evidence and tradeoff details where useful.

## Atomic checklist

- [ ] At least two feasible choices are compared.
- [ ] Consequences respect the known constraints.
- [ ] Relevant human and organizational effects are included.
- [ ] Record uses context.basis_version.

Emit: OPTIONS_READY with options in payload.contextUpdates.

Emit: ROUTE_CHANGED, SITUATION_CHANGED, CANCEL, REVISE_DIAGNOSIS using the shared event contract in CONTEXT.md.
