# Changelog

All notable changes to the `mutation-tester` skill and engine will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-12

### Added
- **Core Mutation Engine (`mutate.exe`)**:
  - High-performance, zero-CGo static binary engine written in pure Go.
  - Sub-millisecond AST and token syntax scanning across multi-language source trees.
- **Universal Syntax Mutator Operators**:
  - **Relational Boundaries**: `<` <-> `<=`, `>` <-> `>=`.
  - **Equality Inversion**: `==` <-> `!=`.
  - **Arithmetic Operators**: `+` <-> `-`, `*` <-> `/`.
  - **Boolean Logic**: `&&` <-> `||`.
  - **Return Values**: `return true` <-> `return false`.
  - Automated string literal and comment isolation to prevent syntactically invalid mutations.
- **Intelligent Test Runner Auto-Detection**:
  - Out-of-the-box detection for Go (`go test ./...`), Node/TypeScript (`npm test`), Python (`pytest`), and Rust (`cargo test`).
  - `--runner` flag allowing arbitrary test harness command overrides.
- **Differential Git-Diff Scoping**:
  - Unified diff parser with cross-platform slash normalization.
  - `--diff` flag to focus mutant generation strictly on modified lines from working tree or staged changes.
- **Fail-Safe Sandbox Execution**:
  - Atomic in-place file replacement with `.mutation_orig` preservation.
  - Strict `defer` rollback handlers guaranteeing source code integrity upon panic, test failure, or SIGINT.
  - Context-governed execution timeouts (default 5s) to eliminate infinite loops caused by boundary mutations.
  - Mutant classification into `KILLED`, `SURVIVED`, `TIMED_OUT`, and `COMPILE_ERROR`.
- **Reporting & Scorecards**:
  - Real-time mutation score percentage calculations: `Killed / (Killed + Survived)`.
  - Markdown scorecard projection (`mutation_scorecard.md.hbs`) detailing survivor line numbers and mutation diffs.
  - Machine-readable JSON output (`mutation_report.json.hbs`) for agentic introspection and CI pipelines.
- **Standard Reactive Skill (`mutation-tester`)**:
  - Full compliance with `skill.yaml` v2.2.0 schema.
  - 9 isolated state prompts (`ready`, `inspecting`, `baselining`, `mutating`, `executing`, `projecting`, `reporting`, `success`, `error`).
  - Integration with `reactive-skills-axi` event bus and state transitions.
