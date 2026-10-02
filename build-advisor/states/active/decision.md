# Review the decision

Present context.recommendation, alternatives, supporting evidence, and limitations.
Ask the user to choose or revise the direction.
Reuse an existing explicit approval only when it covers this same recommendation and basis.
Never invent human approval or infer it from silence.
Record context.decision with basis_version, direction, rationale, and owner.
The user may select a different direction; record that rationale honestly.
Set payload.approved to true and approval_source to the actual user response or session reference.
If the user requests rework, capture feedback and return to framing.

## Atomic checklist

- [ ] Recommendation matches context.route and context.basis_version.
- [ ] Decision comes from explicit human input.
- [ ] Owner and rationale are recorded.
- [ ] Requested rework is respected.

Emit: DECISION_ACCEPTED with decision in payload.contextUpdates, approved, and approval_source.
Emit: DECISION_REVISED with feedback when rework is requested.

Emit: ROUTE_CHANGED, SITUATION_CHANGED, CANCEL using the shared event contract in CONTEXT.md.
