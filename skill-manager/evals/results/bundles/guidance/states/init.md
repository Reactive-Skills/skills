---
name: skill-manager
description: Bootloader - Verify reactive runtime
type: reactive
---

# skill-manager - INIT

Verify the selected runtime and absolute manager path before authoring.

## Instructions
1. Set `manager_skill_dir` to the absolute directory of the selected authored manager or explicitly supplied frozen bundle.
2. Use the selected transport's read-only preflight: AXI `preflight "<manager_skill_dir>" --json`, or the advertised MCP compatibility operation.
Require runtime 0.16.0 or newer and `runtime.bootloader`, `runtime.preflight`, and `runtime.transport_handshake`.
3. Keep the selected transport, launcher, and returned run UUID for this entire run.
Startup invokes the manager once before any state query; this INIT prompt belongs to that existing invocation.
Never inspect the manager or invoke it again for metadata: inspection and state queries before invocation can create extra jobs.
Use direct manifest reads or preflight for metadata; use the absolute manager path and the existing UUID for subsequent state and emit calls.
4. Read registered authoring sources with AXI `sync --show-config` or the environment's source registry.
Honor an explicitly selected registered source; resolve genuine ambiguity before any task write.
Record `authoring_source` and `target_skill_dir` as absolute paths when the target is known.
Reject distribution/agent-local paths even when linked; verify canonical target containment in the selected source.
For CREATE, check the existing source/parent and planned path without requiring the new target to exist.
5. If preflight is compatible, emit `RUNTIME_READY` with the three paths and actual transport, launcher, version, compatibility, and capabilities.
If incompatible, report the exact missing requirement and stop before authoring or setup.
Emit `SETUP_REQUIRED` only when the selected runtime remains usable to record that outcome; setup needs explicit authorization.
