# Recommend a direction

Use current-basis context.diagnosis and options.
Recommend proceed, revise, investigate, defer, or stop.
Identify the preferred option and explain its tradeoffs.
Name the responsible owner and the communication needed for affected people.
Disclose where the recommendation relies on judgment rather than observed evidence.
Treat legal, compensation, investment, and employment specifics as contextual business questions; obtain current authoritative information when such specifics matter.
Save context.recommendation with basis_version, route, direction, rationale, and limitations.
Set route to context.route.

## Atomic checklist

- [ ] Recommendation connects to a compared option.
- [ ] Responsibilities and communication are explicit.
- [ ] Uncertainty and contextual limits are disclosed.
- [ ] Record uses context.basis_version.

Emit: ADVICE_READY with recommendation in payload.contextUpdates.
