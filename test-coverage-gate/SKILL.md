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
> **DEFAULT EXECUTION: AXI CLI**
> AXI is the default runtime path, even when MCP tools are present.
> - To start a new task: Run `reactive-skills-axi invoke test-coverage-gate [--payload JSON]`
> - To resume an active task: Run `reactive-skills-axi state test-coverage-gate`
> - For named or parallel work: Keep the same `--job <job-id>` flag on every command.
> - To advance state: Run `reactive-skills-axi emit test-coverage-gate <signal>`
>
> **FALLBACK EXECUTION: MCP**
> Use `reactive_state` and `reactive_emit_signal` only when shell access to AXI is unavailable.
> Do not troubleshoot MCP before trying AXI.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run `reactive-skills-axi reset test-coverage-gate` or `reactive-skills-axi invoke test-coverage-gate`.
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
