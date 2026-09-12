# Technical Stack & Architectural Decisions

## 1. Engine Core
- **Language**: Go 1.22+ (pure Go, zero CGo dependencies).
- **Distribution**: Single static binary executable across Windows, Linux, and macOS.
- **Parsing Strategy**: Pure Go universal token/syntax mutation engine with language-aware lexers/token scanners:
  - Supports Go, TypeScript/JavaScript, Python, Rust.
  - Operator mutation targets:
    - Conditional boundaries (`<` -> `<=`, `>` -> `>=`)
    - Equality comparisons (`==` -> `!=`, `===` -> `!==`)
    - Arithmetic operations (`+` -> `-`, `*` -> `/`)
    - Logical operators (`&&` -> `||`, `and` -> `or`)
    - Return value flips (`true` -> `false`, `nil` -> `err`, `0` -> `1`)
- **Execution Sandbox**: In-place atomic file swap with strict defer rollback. Original file backup (`.orig`) guaranteed to restore even on test aborts, panics, or Ctrl+C signals.

## 2. Test Runner & Scoping
- **Runner Auto-Detection**:
  - Node/TS: `package.json` -> `vitest run`, `npm test`, `jest`
  - Go: `go.mod` -> `go test ./...`
  - Python: `pytest.ini` / `pyproject.toml` -> `pytest`
  - Rust: `Cargo.toml` -> `cargo test`
  - Custom: `.mutation.yaml` configuration file for explicit test commands and timeouts.
- **Scoping Modes**:
  - Full suite mutation.
  - Differential git-diff mutation: scans `git diff` (HEAD / uncommitted) to strictly constrain mutations to modified lines.

## 3. Reactive Skill Package
- **Skill Name**: `mutation-tester`
- **Specification**: Reactive Skills HSM Manifest (`skill.yaml` v2.2.0)
- **Tool Integration**: Uses `reactive-skills-axi` CLI / MCP server.
- **Scaffolding Engine**: Created and managed using `skill-manager`.
- **States**:
  1. `READY` (parameter intake)
  2. `INSPECTING` (workspace detection & git diff mapping)
  3. `BASELINING` (verify unmutated test suite passes)
  4. `MUTATING` (token/syntax mutation candidate discovery)
  5. `EXECUTING` (in-place swap, test run, rollback, score logging)
  6. `PROJECTING` (deliverable scorecards & survival breakdown)
  7. `REPORTING` (review surviving mutants & provide recommendations)
  8. `SUCCESS` / `ERROR`
