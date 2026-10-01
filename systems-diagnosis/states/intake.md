---
name: systems-diagnosis
description: Capture the recurring behavior and decision need
type: reactive
---

# INTAKE

Capture the problem statement and the variable or outcome that behaves unexpectedly over time.

Ask for the observed trend, time window, available evidence, and decision the user faces.

Ask only for missing information.

Store problem_statement and behavior_over_time in contextUpdates.

If either item is missing, ask a focused follow-up and emit NEED_INTAKE_DETAIL.

## Anti-Shortcut Gate

- Do not label a cause or assign blame in this state.
- Do not replace a trend with a single event.
- Do not invent evidence when the user has none.

Emit INTAKE_READY when both required values are present.

## Signals

- INTAKE_READY
- NEED_INTAKE_DETAIL
