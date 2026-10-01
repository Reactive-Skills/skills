---
name: systems-diagnosis
description: Recover from runtime failure or signal bypass
type: reactive
---

# BYPASS_DETECTED

Stop the run when runtime access is unavailable or work leaves the declared signal path.

If runtime access failed, verify or configure AXI using the environment's setup instructions before starting a new run.

If an undeclared signal or skipped state caused the failure, reset the skill and invoke a fresh job.

Do not continue diagnosis in this run.

## Anti-Shortcut Gate

- Identify whether the cause is runtime setup or signal bypass.
- Do not claim recovery until a new run has a valid state.
- Do not use an unrelated MCP-only recovery path.

This is a terminal recovery state.
