# Mission: Build a technology-agnostic mutation tester reactive skill powered by a high-performance Go CLI engine with built-in AST mutators and git-diff differential scoping.

## Real-World Goal
Build a technology-agnostic mutation tester reactive skill powered by a high-performance Go CLI engine with built-in AST mutators and git-diff differential scoping.

## Success Criteria (Observable)
- [x] Go-based high-performance mutation testing CLI engine
- [x] AST-level mutation operators for conditionals, equality, boundaries, arithmetic, and return values
- [x] Full test suite and diff-aware (git changed lines) targeted mutation testing
- [x] Language-agnostic runner configuration via auto-detection or config file
- [x] Full reactive skill package (skill.yaml v2.2.0, state prompts, projections) scaffolded via skill-manager
- [x] Deterministic scorecards and mutation audit report deliverables

## Out of Scope / Non-Goals
- Re-implementing full language compilers from scratch
- Cloud SaaS dependencies (must run self-contained and fast locally)
- Complex GUI dashboard (Phase 1 focus is CLI and Reactive Skill)
