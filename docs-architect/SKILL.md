---
name: docs-architect
description: >-
  Documentation architecture workflow that discovers source truth, designs information architecture, authors living documentation, embeds diagrams, validates links, and gates publication.
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
> - To start a new task, use selected runtime `invoke docs-architect [--payload JSON]`.
> - To resume an active task, use selected runtime `state docs-architect`.
> - For named or parallel work, keep the same `--job <alias>` flag on every command.
> - The runtime resolves aliases to immutable UUID-backed `run_id` values.
> - To advance state, use selected runtime `emit docs-architect <signal>`.
>
> **SELECTED RUNTIME COMMANDS**
> Use selected MCP or AXI path for every state and signal command.
> First check `reactive_capabilities` when this MCP tool is available.
> Otherwise check `reactive-skills-axi capabilities --json`, then use direct AXI.
> Otherwise use `npx -y @reactive-skills/axi capabilities --json`, then use zero-install AXI.
> MCP uses `reactive_state` and `reactive_emit_signal`.
> Direct AXI uses `reactive-skills-axi state|emit docs-architect`.
> Zero-install AXI uses `npx -y @reactive-skills/axi state|emit docs-architect`.
> Emit `RUNTIME_READY` with `transport`, `launcher`, `runtime_version`, `axi_version`, `compatible`, and `capabilities`.
> Persist the selected runtime in `payload.contextUpdates` so later states reuse it.
> AXI remains the runtime interface. `npx` is only its zero-install launcher.
> Do not repeat version or capability checks after INIT.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run selected runtime `reset docs-architect` or `invoke docs-architect`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# Docs Architect

`docs-architect` turns repository truth into maintainable documentation architecture. It inventories source material, extracts facts, designs an audience-oriented information architecture, authors source-linked content, embeds diagrams, validates the result, and pauses at a publication gate.

## Workflow

`INTAKE -> DISCOVER -> EXTRACT -> DESIGN -> AUTHOR -> DIAGRAM -> VALIDATE -> REVIEW -> SUCCESS`

Failure paths terminate in `ERROR`; a rejected publication terminates in `BLOCKED`. Revision requests return to `AUTHOR` so source traceability and diagrams are regenerated.

## Usage

```bash
npx -y @reactive-skills/axi invoke docs-architect --payload '{"source_paths":["README.md","src"],"audience":"maintainers","outcomes":["onboard","operate"]}'
npx -y @reactive-skills/axi state docs-architect
npx -y @reactive-skills/axi emit docs-architect <SIGNAL>
```

## Outputs

Projections are written under `.docs/docs-architect/`: documentation architecture, diagram inventory, and a state snapshot.

## Guard Discipline

Every transition has an explicit JavaScript guard. Terminal-state guard assertions live in `guards/terminal_guard_assertions.test.js`.
