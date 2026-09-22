---
name: release-notes
description: >-
  Automated changelog and release note generator that scopes changes, classifies entries, composes draft notes, validates formatting, and gates human approval.
metadata:
  author: Reactive-Skills
  version: "1.0.0"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> **REACTIVE SKILL: STRICT RUNTIME EXECUTION**
> This skill is an event-driven state machine. Manual execution is forbidden.
>
> **LOCAL-FIRST RUNTIME SELECTION**
> Select one compatible runtime during INIT, then reuse it for the full run.
> - To start a new task, use selected runtime `invoke release-notes [--payload JSON]`.
> - To resume an active task, use selected runtime `state release-notes`.
> - For named or parallel work, keep the same `--job <alias>` flag on every command.
> - The runtime resolves aliases to immutable UUID-backed `run_id` values.
> - To advance state, use selected runtime `emit release-notes <signal>`.
>
> **SELECTED RUNTIME COMMANDS**
> Use selected MCP or AXI path for every state and signal command.
> First check `reactive_capabilities` when this MCP tool is available.
> Otherwise check `reactive-skills-axi capabilities --json`, then use direct AXI.
> Otherwise use `npx -y @reactive-skills/axi capabilities --json`, then use zero-install AXI.
> MCP uses `reactive_state` and `reactive_emit_signal`.
> Direct AXI uses `reactive-skills-axi state|emit release-notes`.
> Zero-install AXI uses `npx -y @reactive-skills/axi state|emit release-notes`.
> Emit `RUNTIME_READY` with `transport`, `launcher`, `runtime_version`, `axi_version`, `compatible`, and `capabilities`.
> Persist the selected runtime in `payload.contextUpdates` so later states reuse it.
> AXI remains the runtime interface. `npx` is only its zero-install launcher.
> Do not repeat version or capability checks after INIT.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run selected runtime `reset release-notes` or `invoke release-notes`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# Release Notes

`release-notes` generates auditable release notes from source-scoped change evidence. It scopes the release, collects commits and artifacts, classifies changes into changelog categories, composes draft release notes, validates formatting and links, and pauses at a human approval gate.

## Workflow

`INTAKE -> COLLECT -> CLASSIFY -> COMPOSE -> VALIDATE -> REVIEW -> SUCCESS`

Failures terminate in `ERROR`; a rejected release terminates in `BLOCKED`; revision requests return to `COMPOSE`.

## Usage

```bash
npx -y @reactive-skills/axi invoke release-notes --payload '{"repository":".","release_version":"1.2.0","scope_refs":["main","v1.1.0"]}'
```

## Outputs

Projections are written under `.docs/release-notes/`: release notes and a state snapshot.

## Guard Discipline

Every transition has an explicit JavaScript guard. Terminal-state guard assertions live in `guards/terminal_guard_assertions.test.js`.
