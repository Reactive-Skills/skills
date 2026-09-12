# 🧬 mutation-tester

> Technology-agnostic mutation testing reactive skill powered by a high-performance Go CLI engine. Auto-detects test runners, performs AST and token mutations, and scopes fault injection via `git diff`.

[![Schema Version](https://img.shields.io/badge/schema-v2.2.0-blue.svg)](skill.yaml)
[![Skill Version](https://img.shields.io/badge/version-v1.0.0-green.svg)](skill.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Why Mutation Testing?](#-why-mutation-testing)
- [Key Features](#-key-features)
- [Architecture & State Machine](#-architecture--state-machine)
- [Installation](#-installation)
- [Execution & Usage](#-execution--usage)
  - [CLI Mode (Shell)](#cli-mode-shell)
  - [MCP Mode](#mcp-mode)
- [Context & Configuration](#-context--configuration)
- [Deliverables](#-deliverables)
- [Directory Layout](#-directory-layout)
- [License](#-license)

---

## 🔍 Overview

`mutation-tester` is a production-grade **Reactive Skill** that evaluates test suite efficacy by synthetically injecting AST and token defects ("mutants") into source code and measuring whether test suites detect and kill them.

Unlike code coverage (which only measures what code was executed), mutation testing measures whether your tests actually assert expected behavior and catch real regressions.

---

## 💡 Why Mutation Testing?

Traditional line and branch coverage metrics can be misleading: a test suite can achieve 100% test coverage without a single assertion.

Mutation testing introduces deliberate synthetic bugs into source code:
- **Killed Mutant**: The test suite failed when the bug was introduced. Your test caught the regression!
- **Survived Mutant**: The test suite passed despite the bug. This exposes an assertion gap or missing test case.
- **Mutation Score**: $\frac{\text{Killed Mutants}}{\text{Total Mutants} - \text{Compile Errors}} \times 100\%$

---

## ⚡ Key Features

- **Multi-Ecosystem Detection**: Auto-detects runners for:
  - **Go**: `go test ./...`
  - **Node.js / TypeScript**: `npm test`, `vitest run`, `npx jest`
  - **Python**: `pytest`
  - **Rust**: `cargo test`
  - **.NET**: `dotnet test`
  - **Java**: `mvn test`
  - Custom runner commands supported via `runner_cmd` context key.
- **Differential Scoping (`--diff`)**: Restricts mutant generation strictly to lines modified in `git diff` (HEAD, working tree, or PR branch) for sub-minute agent feedback loops.
- **AST-Level Mutation Operators**:
  - **Boundary condition flips**: `<` $\leftrightarrow$ `<=`, `>` $\leftrightarrow$ `>=`
  - **Equality replacements**: `==` $\leftrightarrow$ `!=`
  - **Arithmetic mutations**: `+` $\leftrightarrow$ `-`, `*` $\leftrightarrow$ `/`
  - **Boolean logic inversions**: `&&` $\leftrightarrow$ `||`
  - **Return value mutations**: `return true` $\leftrightarrow$ `return false`
- **Atomic In-Place Sandbox**: Injects mutations directly into source files backed by atomic `.mutation_orig` restore guards, guaranteeing zero dirty workspace state even on runner crashes or timeouts.
- **Human Review Gate**: Interactive reporting state (`REPORTING`) allowing developers or agents to accept the mutation score or loop back to remediate surviving mutants.

---

## 🔄 Architecture & State Machine

The skill is modeled as a Hierarchical State Machine (HSM) defined in [`skill.yaml`](skill.yaml). For visual state transitions, see [`STATECHART.md`](STATECHART.md).

```
   ┌─────────┐
   │  READY  │
   └────┬────┘
        │ START
        ▼
   ┌────────────┐
   │ INSPECTING │ ◄── Auto-detect runner & git-diff scope
   └────┬───────┘
        │ CONFIGURED
        ▼
   ┌────────────┐
   │ BASELINING │ ◄── Verify clean unmutated test suite pass
   └────┬───────┘
        │ BASELINE_PASSED
        ▼
   ┌────────────┐
   │  MUTATING  │ ◄── Generate AST/token mutation candidates
   └────┬───────┘
        │ MUTANTS_GENERATED
        ▼
   ┌────────────┐
   │ EXECUTING  │ ◄── In-place swap, execute test runner, record kill/survive
   └────┬───────┘
        │ EXECUTION_COMPLETED
        ▼
   ┌────────────┐
   │ PROJECTING │ ◄── Materialize markdown scorecard & JSON report
   └────┬───────┘
        │ PROJECTIONS_WRITTEN
        ▼
   ┌────────────┐     USER_REMEDIATE
   │ REPORTING  ├────────────────────┐
   └────┬───────┘                    │
        │ USER_ACCEPTED              │
        ▼                            ▼
   ┌─────────┐                 ┌────────────┐
   │ SUCCESS │                 │ BASELINING │
   └─────────┘                 └────────────┘
```

| State | Purpose | Next Transition |
| :--- | :--- | :--- |
| `READY` | Intake parameters (`target_dir`, `diff_ref`, `runner_cmd`, `timeout_sec`) | `START` $\rightarrow$ `INSPECTING` |
| `INSPECTING` | Auto-detect workspace runner and resolve git-diff line scoping | `CONFIGURED` $\rightarrow$ `BASELINING` |
| `BASELINING` | Run test suite against clean unmutated code to guarantee 100% baseline pass | `BASELINE_PASSED` $\rightarrow$ `MUTATING` |
| `MUTATING` | Parse target files, identify mutation points, and generate mutant candidates | `MUTANTS_GENERATED` $\rightarrow$ `EXECUTING` |
| `EXECUTING` | Concurrently evaluate mutants using atomic swap, runner timeout, and rollback | `EXECUTION_COMPLETED` $\rightarrow$ `PROJECTING` |
| `PROJECTING` | Calculate mutation scorecard metrics and generate deliverable projections | `PROJECTIONS_WRITTEN` $\rightarrow$ `REPORTING` |
| `REPORTING` | Present scorecard and surviving mutants review gate to human | `USER_ACCEPTED` $\rightarrow$ `SUCCESS`<br>`USER_REMEDIATE` $\rightarrow$ `BASELINING` |
| `SUCCESS` | Mutation testing complete with certified scorecard | `RESET` $\rightarrow$ `READY` |
| `ERROR` | Aborted run or failure with diagnostics | `RETRY` $\rightarrow$ `READY` |

---

## 📥 Installation

Install into your agent workspace using `skills.sh` (`npx skills`):

```bash
# Install mutation-tester
npx skills add Reactive-Skills/skills --skill mutation-tester
```

---

## 🚀 Execution & Usage

Reactive skills execute deterministically via **`@reactive-skills/axi`**.

### CLI Mode (Shell)

```bash
# 1. Inspect current instructions
npx -y @reactive-skills/axi state mutation-tester

# 2. Invoke skill with parameters
npx -y @reactive-skills/axi invoke mutation-tester --payload '{
  "target_dir": "src/",
  "diff_ref": "HEAD~1",
  "timeout_sec": 5
}'

# 3. Advance states by emitting signals
npx -y @reactive-skills/axi emit mutation-tester START
```

### MCP Mode

If your agent has the Reactive Skills MCP server enabled, you can interact directly via:
- `reactive_state`: Read current instructions and context.
- `reactive_emit_signal`: Emit transitions (`START`, `MUTANTS_GENERATED`, etc.).

---

## ⚙️ Context & Configuration

Configured in `skill.yaml`:

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `target_dir` | string | `"."` | Directory of source code to mutate |
| `runner_cmd` | string | `null` | Test command (auto-detected if null) |
| `diff_ref` | string | `null` | Git ref to scope mutations (`HEAD`, `origin/main`) |
| `timeout_sec` | number | `5` | Test execution timeout per mutant |
| `report_path` | string | `".docs/mutation-scorecard.md"` | Path for markdown scorecard |

---

## 📦 Deliverables

On successful execution, the skill projects two standardized deliverables:

1. **`.docs/mutation-scorecard.md`**: Human-readable scorecard with mutation score, killed/survived breakdown, and line-level diffs of surviving mutants.
2. **`.docs/mutation-report.json`**: Machine-readable JSON summary for CI/CD gates and automated remediation loops.

---

## 📂 Directory Layout

```
mutation-tester/
├── README.md               # Human-facing documentation (this file)
├── SKILL.md                # Agent entrypoint with universal reactive bootloader
├── skill.yaml              # HSM statechart manifest (schema_version: 2.2.0)
├── STATECHART.md           # Mermaid diagram of states and transitions
├── CONTEXT.md              # Domain glossary and mutation testing concepts
├── CHANGELOG.md            # Release history
├── engine/                 # Pure-Go mutation engine source code
│   ├── cmd/                # mutate CLI entrypoint
│   └── pkg/                # AST parsers, mutators, and runner executors
├── examples/               # Example projects (e.g. calculator)
├── guards/                 # Deterministic transition guards
├── states/                 # Isolated state prompt templates (*.md)
│   ├── ready.md
│   ├── inspecting.md
│   ├── baselining.md
│   ├── mutating.md
│   ├── executing.md
│   ├── projecting.md
│   ├── reporting.md
│   ├── success.md
│   └── error.md
└── templates/              # Deliverable projection templates (*.hbs)
    ├── mutation_scorecard.md.hbs
    └── mutation_report.json.hbs
```

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](../LICENSE) for details.
