---
name: systems-diagnosis
description: Confirm system boundary and outcome
type: reactive
---

# DEFINE_BOUNDARY

Set the system boundary, time horizon, relevant actors, and desired outcome with the user.

Compare the stated goal with the behavior and incentives visible in the evidence.

Store system_boundary, time_horizon, desired_outcome, and key_actors in contextUpdates.

Ask the user to confirm the scope before mapping causes.

## Anti-Shortcut Gate

- Do not expand the boundary without explaining why it matters.
- Do not treat stated intent as proof of system purpose.
- Do not continue while the boundary or desired outcome is unclear.

Emit BOUNDARY_CONFIRMED when all required values are present and confirmed.

Emit SCOPE_REVISED when the user changes the boundary or outcome.

## Signals

- BOUNDARY_CONFIRMED
- SCOPE_REVISED
