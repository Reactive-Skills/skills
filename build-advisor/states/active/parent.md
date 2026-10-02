# Shared advisory context

Handle parent signals from any descendant without discarding the event history.
Use ROUTE_CHANGED with contextUpdates.route and a reason to choose develop, challenge, or advise.
Use SITUATION_CHANGED with basis_version incremented by exactly one and a reason when evidence, customer, scope, or constraints change.
Use CANCEL only after the user cancels, with a recorded reason.
FRAME clears the pending recommendation, decision, and action.
Reuse evidence and current-basis artifacts; identify older artifacts as stale.
Pause by retaining the active leaf and run alias.
Never invent evidence or treat planned work as completed.

## Atomic checklist

- [ ] Route or situation changes reflect the user's request or actual new information.
- [ ] Stale results are not presented as current.
- [ ] Cancellation is explicit.

Emit: ROUTE_CHANGED, SITUATION_CHANGED, or CANCEL only when applicable.
