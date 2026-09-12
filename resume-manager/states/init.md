# INIT State

## Goal
Verify that the host agent harness is connected to the reactive runtime environment.

## Instructions
1. Check execution environment:
   - Primary (AXI CLI mode): Shell access to execute `npx -y @reactive-skills/axi state resume-manager` (or `reactive-skills-axi state resume-manager`) and `npx -y @reactive-skills/axi emit resume-manager <signal>`.
   - Alternative (MCP mode): The `reactive_state` tool is in the active tool list and `allowed_tools` is not `none`.
2. If runtime is accessible via either path, emit signal `RUNTIME_READY`.
3. If neither path is accessible, emit signal `SETUP_REQUIRED`.

## Atomic Checklist
- [ ] Runtime execution capability confirmed.
- [ ] No bypass attempted.
- [ ] Signal emitted cleanly.

## Signal
Emit: `RUNTIME_READY` or `SETUP_REQUIRED`
