---
name: research-design-planner
description: Bootloader - Verify reactive runtime
type: reactive
---

# research-design-planner - INIT

Verify access to the reactive runtime.

## Instructions
1. Check reactive capabilities through MCP when available.
2. Otherwise check `reactive-skills-axi capabilities --json`, then the zero-install AXI path.
3. Select one compatible runtime for this run and persist that selection.
4. If the runtime supports state and judgment transitions, emit `RUNTIME_READY`.
5. If no compatible runtime works, emit `SETUP_REQUIRED`.

## Atomic gate
- [ ] Confirm runtime compatibility before routing.
- [ ] Do not preload unrelated skill prompts.
