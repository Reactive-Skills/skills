---
name: mutation-tester
description: Technology-agnostic mutation testing reactive skill powered by high-performance Go CLI engine. Auto-detects test runners, performs AST/token mutations, and scopes via git diff.
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
> - To start a new task, use selected runtime `invoke mutation-tester [--payload JSON]`.
> - To resume an active task, use selected runtime `state mutation-tester`.
> - For named or parallel work, keep the same `--job <alias>` flag on every command.
> - The runtime resolves aliases to immutable UUID-backed `run_id` values.
> - To advance state, use selected runtime `emit mutation-tester <signal>`.
>
> **SELECTED RUNTIME COMMANDS**
> Use selected MCP or AXI path for every state and signal command.
> First check `reactive_capabilities` when this MCP tool is available.
> Otherwise check `reactive-skills-axi capabilities --json`, then use direct AXI.
> Otherwise use `npx -y @reactive-skills/axi capabilities --json`, then use zero-install AXI.
> MCP uses `reactive_state` and `reactive_emit_signal`.
> Direct AXI uses `reactive-skills-axi state|emit mutation-tester`.
> Zero-install AXI uses `npx -y @reactive-skills/axi state|emit mutation-tester`.
> Emit `RUNTIME_READY` with `transport`, `launcher`, `runtime_version`, `axi_version`, `compatible`, and `capabilities`.
> Persist the selected runtime in `payload.contextUpdates` so later states reuse it.
> AXI remains the runtime interface. `npx` is only its zero-install launcher.
> Do not repeat version or capability checks after INIT.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run selected runtime `reset mutation-tester` or `invoke mutation-tester`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
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
