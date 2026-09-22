---
name: pr-triage
description: >-
  Pull request triage workflow that collects PR metadata, classifies risk and ownership, assesses readiness, routes work, and pauses at a human disposition gate.
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
> - To start a new task, use selected runtime `invoke pr-triage [--payload JSON]`.
> - To resume an active task, use selected runtime `state pr-triage`.
> - For named or parallel work, keep the same `--job <alias>` flag on every command.
> - The runtime resolves aliases to immutable UUID-backed `run_id` values.
> - To advance state, use selected runtime `emit pr-triage <signal>`.
>
> **SELECTED RUNTIME COMMANDS**
> Use selected MCP or AXI path for every state and signal command.
> First check `reactive_capabilities` when this MCP tool is available.
> Otherwise check `reactive-skills-axi capabilities --json`, then use direct AXI.
> Otherwise use `npx -y @reactive-skills/axi capabilities --json`, then use zero-install AXI.
> MCP uses `reactive_state` and `reactive_emit_signal`.
> Direct AXI uses `reactive-skills-axi state|emit pr-triage`.
> Zero-install AXI uses `npx -y @reactive-skills/axi state|emit pr-triage`.
> Emit `RUNTIME_READY` with `transport`, `launcher`, `runtime_version`, `axi_version`, `compatible`, and `capabilities`.
> Persist the selected runtime in `payload.contextUpdates` so later states reuse it.
> AXI remains the runtime interface. `npx` is only its zero-install launcher.
> Do not repeat version or capability checks after INIT.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run selected runtime `reset pr-triage` or `invoke pr-triage`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# PR Triage

`pr-triage` turns a pull request batch into an auditable triage plan. It collects metadata, checks, reviews, diffs, and ownership signals; classifies risk and size; assesses readiness against policy; routes each PR to an owner or reviewer; and pauses for human disposition.

## Workflow

`INTAKE -> COLLECT -> CLASSIFY -> ASSESS -> ROUTE -> REVIEW -> SUCCESS`

Failures terminate in `ERROR`; a blocked disposition terminates in `BLOCKED`; rework returns to `ASSESS`.

## Usage

```bash
npx -y @reactive-skills/axi invoke pr-triage --payload '{"repository":".","pull_requests":["12","14"],"triage_policy":{"max_size":"medium","required_checks":["test","lint"]}}'
```

## Outputs

Projections are written under `.docs/pr-triage/`: triage report and state snapshot.

## Guard Discipline

Every transition has an explicit JavaScript guard. Terminal-state guard assertions live in `guards/terminal_guard_assertions.test.js`.
