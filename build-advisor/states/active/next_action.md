# Define the next action

Use the current-basis decision.
Assign an owner and a concrete next_step.
Define a review_trigger based on an event, checkpoint, or measure.
Save context.action with basis_version, type, owner, next_step, and review_trigger.
Type is experiment, review, handoff, or stop.
For experiment or review, present the plan and wait for real results.
For handoff or stop, deliver the decision record and action clearly before marking handoff_delivered true.
An implementation handoff may target product-manager or another existing skill when relevant.
Handoff completion means the plan was delivered; it does not mean implementation or experiments ran.
Do not automatically launch another agent or perform external actions.

## Atomic checklist

- [ ] Action serves the approved decision.
- [ ] Owner and review trigger are explicit.
- [ ] Planned work is distinguished from completed work.
- [ ] Record uses context.basis_version.

Emit: ACTION_PLANNED or HANDOFF_READY with action in payload.contextUpdates.
HANDOFF_READY additionally requires handoff_delivered true.

Emit: ROUTE_CHANGED, SITUATION_CHANGED, CANCEL using the shared event contract in CONTEXT.md.
