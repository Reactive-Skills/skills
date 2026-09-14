# INIT State

## Goal
Verify that the execution harness has access to the `@reactive-skills/axi` reactive runtime or MCP server.

## Instructions
1. Check execution environment:
   - Primary (AXI CLI mode): Shell access is available to run `npx -y @reactive-skills/axi state product-manager` (or `reactive-skills-axi state product-manager`) and `npx -y @reactive-skills/axi emit product-manager <signal>`.
   - Alternative (MCP mode): The `reactive_state` and `reactive_emit_signal` tools are present in your active tool list.
2. If the reactive runtime is available via either AXI CLI or MCP:
   - Emit signal: `RUNTIME_READY`
3. If neither mode is available:
   - Emit signal: `SETUP_REQUIRED`

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Confirmed existence of either CLI tool (`reactive-skills-axi` / `npx @reactive-skills/axi`) or MCP tools (`reactive_state` / `reactive_emit_signal`).
- [ ] Verified that state machine bus is responsive.
- [ ] Did not guess transitions or attempt manual execution outside the runtime.

## Stop Criteria
Emit `RUNTIME_READY` if runtime is operational, otherwise emit `SETUP_REQUIRED`.

## Signals
- `RUNTIME_READY`
- `SETUP_REQUIRED`
