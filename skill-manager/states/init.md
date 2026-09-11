---
name: skill-manager
description: Bootloader - Verify reactive runtime
type: reactive
---

# skill-manager - INIT

Verify agent harness has access to reactive runtime.

## Instructions
1. Check execution environment:
   - Primary (AXI CLI mode): Shell access is available to run `npx -y @reactive-skills/axi state skill-manager` (or `reactive-skills-axi state skill-manager`) and `npx -y @reactive-skills/axi emit skill-manager <signal>` (or `reactive-skills-axi emit skill-manager <signal>`).
   - Alternative (MCP mode): The `reactive_state` tool is in your tools list and `allowed_tools` is not `none`.
2. If the reactive runtime is available via either AXI CLI or MCP, emit signal `RUNTIME_READY` (via `npx -y @reactive-skills/axi emit skill-manager RUNTIME_READY`, `reactive-skills-axi emit skill-manager RUNTIME_READY`, or `reactive_emit_signal`).
3. If neither mode is available, emit signal `SETUP_REQUIRED`.
