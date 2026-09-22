---
name: tdd-refactor
description: Skill: tdd-refactor
type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> **REACTIVE SKILL: STRICT RUNTIME EXECUTION**
> This skill is an event-driven state machine. Manual execution is forbidden.
>
> **LOCAL-FIRST RUNTIME SELECTION**
> Select one compatible runtime during INIT, then reuse it for the full run.
> - To start a new task, use selected runtime `invoke tdd-refactor [--payload JSON]`.
> - To resume an active task, use selected runtime `state tdd-refactor`.
> - For named or parallel work, keep the same `--job <alias>` flag on every command.
> - The runtime resolves aliases to immutable UUID-backed `run_id` values.
> - To advance state, use selected runtime `emit tdd-refactor <signal>`.
>
> **SELECTED RUNTIME COMMANDS**
> Use selected MCP or AXI path for every state and signal command.
> First check `reactive_capabilities` when this MCP tool is available.
> Otherwise check `reactive-skills-axi capabilities --json`, then use direct AXI.
> Otherwise use `npx -y @reactive-skills/axi capabilities --json`, then use zero-install AXI.
> MCP uses `reactive_state` and `reactive_emit_signal`.
> Direct AXI uses `reactive-skills-axi state|emit tdd-refactor`.
> Zero-install AXI uses `npx -y @reactive-skills/axi state|emit tdd-refactor`.
> Emit `RUNTIME_READY` with `transport`, `launcher`, `runtime_version`, `axi_version`, `compatible`, and `capabilities`.
> Persist the selected runtime in `payload.contextUpdates` so later states reuse it.
> AXI remains the runtime interface. `npx` is only its zero-install launcher.
> Do not repeat version or capability checks after INIT.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run selected runtime `reset tdd-refactor` or `invoke tdd-refactor`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# tdd-refactor

Skill: tdd-refactor governed by `skill.yaml`.

