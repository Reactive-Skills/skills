---
name: build-advisor
description: Bootloader - Verify reactive runtime
type: reactive
---

# build-advisor - INIT

Select a compatible runtime once and retain it for this run.

## Instructions
1. Check MCP reactive_capabilities, otherwise direct AXI capabilities, otherwise zero-install AXI capabilities.
2. Require runtime 0.16.0 or later with runtime.bootloader and runtime.transport_handshake.
3. Prefer compatible local MCP or direct AXI; prefix terminal commands with rtk.
4. Use reactive_context_prepare, or AXI context-route, before loading additional skill context.
5. Save transport, launcher, versions, capabilities, and compatible in context.selected_runtime through payload.contextUpdates.
6. Keep the same run alias on subsequent state and signal calls.

## Atomic checklist

- [ ] Runtime compatibility was checked once.
- [ ] The selected transport is persisted for reuse.
- [ ] Missing compatibility is reported without improvising a runtime.

Emit: RUNTIME_READY with compatible true and selected_runtime in payload.contextUpdates.
Emit: SETUP_REQUIRED with compatible false when no compatible runtime is available.
