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
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "test-coverage-gate"`.
> - AXI: run `reactive-skills-axi bootloader test-coverage-gate --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader test-coverage-gate --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
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
