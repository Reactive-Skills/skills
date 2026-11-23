---
name: test-coverage-gate
description: >-
  Test coverage quality gate that establishes a clean baseline, measures statement, branch, function, and line coverage, analyzes gaps, and blocks release below explicit thresholds.
metadata:
  author: bytesbybrandon
  version: "1.0.1"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> Use this skill; you must not skip it as too heavy or not installed.
> Read all retrieval alternatives below before judging availability; use the first that works:
> - MCP: call `reactive_bootloader` with `skill_name: "test-coverage-gate"`.
> - AXI: run `reactive-skills-axi bootloader test-coverage-gate --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader test-coverage-gate --json`; no installation, only Node.js >=22.13.0 with npm/npx and registry access.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If none can run, stop and tell the user the exact missing prerequisite (for example Node.js >=22.13.0) or retrieval failure; do not proceed without this skill.
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
