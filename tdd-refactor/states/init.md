---
name: tdd-refactor
description: Bootloader - Verify reactive runtime
type: reactive
---

# tdd-refactor - INIT

Verify agent harness has access to reactive runtime.

## Instructions
1. Check execution environment:
   - Primary (AXI CLI mode): Shell access is available to run `reactive-skills-axi state tdd-refactor` and `reactive-skills-axi emit tdd-refactor <signal>`.
   - Alternative (MCP mode): The `reactive_state` tool is in your tools list and `allowed_tools` is not `none`.
2. If the reactive runtime is available via either AXI CLI or MCP, emit signal `RUNTIME_READY` (via `reactive-skills-axi emit tdd-refactor RUNTIME_READY` or `reactive_emit_signal`).
3. If neither mode is available, emit signal `SETUP_REQUIRED`.
