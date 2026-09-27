---
name: mutation-tester
description: Technology-agnostic mutation testing reactive skill powered by high-performance Go CLI engine. Auto-detects test runners, performs AST/token mutations, and scopes via git diff.
metadata:
  author: Reactive-Skills
  version: "1.0.0"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "mutation-tester"`.
> - AXI: run `reactive-skills-axi bootloader mutation-tester --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader mutation-tester --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
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
