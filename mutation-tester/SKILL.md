---
name: mutation-tester
description: Technology-agnostic mutation testing reactive skill powered by high-performance Go CLI engine. Auto-detects test runners, performs AST/token mutations, and scopes via git diff.
metadata:
  author: Reactive-Skills
  version: "1.0.0"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> **REACTIVE SKILL — STRICT RUNTIME EXECUTION**
> This skill is an event-driven state machine. Manual execution is FORBIDDEN.
>
> **PRIMARY EXECUTION (AXI CLI — Shell):**
> 1. Run `npx -y @reactive-skills/axi state mutation-tester` (or `reactive-skills-axi state mutation-tester`) to read your current instructions.
> 2. Complete the tasks described in the state prompt.
> 3. Run `npx -y @reactive-skills/axi emit mutation-tester <signal>` (or `reactive-skills-axi emit mutation-tester <signal>`) to advance to the next state.
>
> **ALTERNATIVE (MCP Mode):**
> If the `reactive_state` MCP tool is present in your tool list, you may use `reactive_state` and `reactive_emit_signal`.
>
> **STRICT INVARIANT:**
> Do NOT manually author deliverables or guess next states. The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# Mutation Tester

Technology-agnostic mutation testing reactive skill that evaluates test suite efficacy by synthetically injecting AST mutations (operators, boundaries, conditions, returns) and measuring mutant kill rates.

## Core Capabilities
- **Multi-Language Detection**: Auto-detects test commands for Go (`go test`), Node/TS (`vitest`, `npm test`, `jest`), Python (`pytest`), and Rust (`cargo test`).
- **Differential Mutation Testing**: Scopes mutations strictly to lines modified in `git diff` (HEAD, working tree, or PR branch) for fast agent feedback loops.
- **Atomic In-Place Sandbox**: Modifies files in-place with guaranteed defer rollback, restoring source files to pristine state even on test crashes or timeouts.
- **Deterministic Deliverables**: Materializes markdown scorecard (`.docs/mutation-scorecard.md`) and structured JSON report (`.docs/mutation-report.json`).

## Workflow States
1. `READY`: Intake parameters (`target_dir`, `diff_ref`, `runner_cmd`, `timeout_sec`).
2. `INSPECTING`: Auto-detect test runner and resolve git-diff line ranges.
3. `BASELINING`: Run test suite against clean codebase to ensure zero pre-existing failures.
4. `MUTATING`: Parse target files, identify AST mutation points, and generate mutant candidates.
5. `EXECUTING`: Concurrently evaluate mutants using atomic swap, runner timeout, and rollback.
6. `PROJECTING`: Materialize mutation scorecards and survival statistics.
7. `REPORTING`: Human review gate for analyzing surviving mutants and remediation.
8. `SUCCESS` / `ERROR`: Terminal states.
