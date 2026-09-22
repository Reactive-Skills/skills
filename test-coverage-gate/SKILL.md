---
name: test-coverage-gate
description: >-
  Test coverage quality gate that establishes a clean baseline, measures statement, branch, function, and line coverage, analyzes gaps, and blocks release below explicit thresholds.
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
> - To start a new task, use selected runtime `invoke test-coverage-gate [--payload JSON]`.
> - To resume an active task, use selected runtime `state test-coverage-gate`.
> - For named or parallel work, keep the same `--job <alias>` flag on every command.
> - The runtime resolves aliases to immutable UUID-backed `run_id` values.
> - To advance state, use selected runtime `emit test-coverage-gate <signal>`.
>
> **SELECTED RUNTIME COMMANDS**
> Use selected MCP or AXI path for every state and signal command.
> First check `reactive_capabilities` when this MCP tool is available.
> Otherwise check `reactive-skills-axi capabilities --json`, then use direct AXI.
> Otherwise use `npx -y @reactive-skills/axi capabilities --json`, then use zero-install AXI.
> MCP uses `reactive_state` and `reactive_emit_signal`.
> Direct AXI uses `reactive-skills-axi state|emit test-coverage-gate`.
> Zero-install AXI uses `npx -y @reactive-skills/axi state|emit test-coverage-gate`.
> Emit `RUNTIME_READY` with `transport`, `launcher`, `runtime_version`, `axi_version`, `compatible`, and `capabilities`.
> Persist the selected runtime in `payload.contextUpdates` so later states reuse it.
> AXI remains the runtime interface. `npx` is only its zero-install launcher.
> Do not repeat version or capability checks after INIT.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run selected runtime `reset test-coverage-gate` or `invoke test-coverage-gate`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# Test Coverage Gate

`test-coverage-gate` enforces measurable test coverage before release. It validates the test and coverage commands, requires a clean baseline, collects a machine-readable report, compares line, statement, branch, and function metrics with explicit thresholds, and pauses for a human release decision.

## Workflow

`INTAKE -> CONFIGURE -> BASELINE -> MEASURE -> ANALYZE -> GATE -> SUCCESS`

Failures terminate in `ERROR`; a blocked release terminates in `BLOCKED`; remediation returns to `MEASURE`.

## Usage

```bash
npx -y @reactive-skills/axi invoke test-coverage-gate --payload '{"target_dir":".","test_command":"npm test","coverage_command":"npm run coverage","thresholds":{"lines":80,"statements":80,"branches":70,"functions":80}}'
```

## Outputs

Projections are written under `.docs/test-coverage-gate/`: coverage report and state snapshot.

## Guard Discipline

Every transition has an explicit JavaScript guard. Terminal-state guard assertions live in `guards/terminal_guard_assertions.test.js`.
