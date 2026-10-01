---
name: research-design-planner
description: Bypass detected - Agent operated outside signal contract
type: reactive
---

# research-design-planner - BYPASS_DETECTED

The runtime detected work outside the signal contract.

## Recovery
1. Run `reactive-skills-axi reset research-design-planner`.
2. Run `reactive-skills-axi invoke research-design-planner` to start a fresh job.
3. Use `reactive-skills-axi state research-design-planner --job <job-id>` only when resuming a known job.

## Prevention
- Use AXI `state` to load the current prompt.
- Use AXI `emit` after each completed state task.
- Keep the same job ID on every command in a named run.

## Atomic gate
- [ ] Do not continue from a bypassed state.
- [ ] Do not alter persisted run history manually.
