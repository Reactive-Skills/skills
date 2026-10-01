---
name: systems-diagnosis
description: Verify reactive runtime access
type: reactive
---

# Systems Diagnosis INIT

Verify access to a compatible Reactive Skills runtime.

Use the runtime bootloader instructions to check capabilities, select AXI or MCP, and retain the same job identifier.

Emit RUNTIME_READY when runtime access works.

Emit SETUP_REQUIRED when no compatible runtime is available.

## Anti-Shortcut Gate

- Do not begin diagnosis before runtime access is confirmed.
- Do not infer compatibility from a command name alone.
- Preserve the selected runtime for this run.

## Signals

- RUNTIME_READY
- SETUP_REQUIRED
