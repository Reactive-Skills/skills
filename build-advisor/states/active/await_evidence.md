# Wait for actual evidence

Present context.action and its review trigger.
Wait for user-provided or authorized observed results.
Do not schedule background monitoring unless requested.
Keep this run and active leaf available for resumption.
When results arrive, append observed evidence with new id, claim, kind, and source.
Retain prior evidence and increment basis_version by exactly one.
List newly observed entry IDs in payload.result_refs.
Do not reuse prior IDs as new results.
New results return to framing so the relevant route can reconsider its direction.

## Atomic checklist

- [ ] Results were actually observed.
- [ ] New evidence has distinct IDs and traceable sources.
- [ ] Revision increment reflects the new information.
- [ ] Silence is not progress or approval.

Emit: RESULTS_RECEIVED with evidence and basis_version in payload.contextUpdates and result_refs.
Parent signals ROUTE_CHANGED, SITUATION_CHANGED, and CANCEL remain available.
