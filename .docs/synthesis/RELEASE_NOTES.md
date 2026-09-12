# Release Notes: mutation-tester v1.0.0

**Release Date**: September 12, 2026  
**Artifact**: `mutation-tester` Reactive Skill & `mutate` CLI Engine  
**Binary Distribution**: `skills/mutation-tester/bin/mutate.exe`  

---

## What is `mutation-tester`?

`mutation-tester` is a production-grade, technology-agnostic mutation testing suite and autonomous reactive skill designed for AI agents and high-velocity engineering teams. It evaluates the true defensive quality of your test suite by injecting intentional, syntactically subtle defects (mutants) into your codebase and verifying whether your tests fail as a result.

If your tests pass despite the mutation, the mutant **survives** — pinpointing blind spots in your test assertions and missing edge-case coverage.

---

## Key Highlights

### 1. High-Performance, Zero-Dependency Core Engine
- Written in pure Go with zero CGo bindings.
- Compiles down to an ultra-lightweight static binary (`mutate.exe`).
- Executes AST syntax scanning and token replacement in sub-millisecond durations.

### 2. Universal AST & Syntax Mutators
Supports core language tokens across Go, TypeScript, JavaScript, Python, Rust, C/C++, and more:
- **Boundary checks**: Swaps `<` for `<=`, `>` for `>=`.
- **Equality**: Inverts `==` to `!=` and vice-versa.
- **Arithmetic**: Flips `+` to `-` and `*` to `/`.
- **Boolean operations**: Inverts `&&` to `||`.
- **Return flags**: Flips boolean returns (`return true` to `return false`).
- Comment and string literal skipping ensures generated mutants remain syntactically valid code.

### 3. Differential Git-Diff Scoping
Full-suite mutation testing can be prohibitively slow on massive repositories. With the `--diff` flag, `mutation-tester` restricts mutation candidate injection exclusively to lines touched in `git diff HEAD`, turning hours of test runs into sub-minute checks tailored directly for Pull Requests.

### 4. Zero-Leakage Sandbox Execution
- Modifies code in-place to ensure native build and test runners execute against real file paths.
- Automatically preserves an atomic backup (`.mutation_orig`).
- Guarantees complete restoration of original files via deferred recovery routines, even if tests crash, timeout, or panic.
- Enforces strict process timeouts to cleanly kill mutants that cause infinite loops.

### 5. Multi-Ecosystem Test Runner Auto-Detection
Detects project root indicators automatically:
- **Go**: `go.mod` -> `go test ./...`
- **Node / TypeScript**: `package.json` -> `npm test` (supports yarn/pnpm)
- **Python**: `pyproject.toml` / `requirements.txt` / `pytest.ini` -> `pytest`
- **Rust**: `Cargo.toml` -> `cargo test`
- Custom harnesses can be specified via `--runner "your-custom-command"`.

### 6. Reactive Skill Architecture (v2.2.0)
Packaged as an event-driven Reactive Skill (`skill.yaml` v2.2.0) featuring 9 isolated state prompts and Handlebars projection templates (`mutation_scorecard.md.hbs`, `mutation_report.json.hbs`) for seamless orchestration via `reactive-skills-axi`.

---

## Quick Start

### Direct CLI
```bash
# Preview AST mutants
./mutation-tester/bin/mutate.exe --dir . --list

# Run differential mutation testing on modified lines
./mutation-tester/bin/mutate.exe --dir . --diff

# Generate Markdown & JSON reports
./mutation-tester/bin/mutate.exe --dir . --diff --out-md scorecard.md --out-json scorecard.json
```

### Reactive Skill Invocation
```bash
reactive-skills-axi invoke mutation-tester
```
