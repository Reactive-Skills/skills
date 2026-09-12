# Vertical Slice Plan (Event Modeling & DCB)

## 1. System Topology & Client Surfaces
- **Client Surfaces:** CLI (Go binary / AXI),Reactive Skill (MCP + AXI)
- **Repository Architecture:** single_package

## 2. Event Modeling Vertical Slices
### [Translation] Scaffold Reactive Skill Package (Priority: P0/MVP, Engine: tdd_direct)
- **Description:** Use skill-manager CREATE workflow to scaffold mutation-tester reactive skill with skill.yaml v2.2.0, isolated state prompts, templates, and guards.
- **UI Surface / Route:** CLI: reactive-skills-axi
- **Decider / Command:** ScaffoldSkillDecider
- **Projection / Read Model:** .docs/skill-manager/mutation-tester-snapshot.md
- **Status:** ✅ Complete
### [State Change] Universal Token &amp; Syntax Mutator (Priority: P0/MVP, Engine: tdd_direct)
- **Description:** Implement pure-Go scanner &amp; AST mutator targeting equality, relational boundary, arithmetic, boolean logic, and return value mutations.
- **UI Surface / Route:** CLI: mutate --list-mutants
- **Decider / Command:** SynthesizeMutantsDecider
- **Projection / Read Model:** MutantCandidateCatalog
- **Status:** ✅ Complete
### [State Change] Target Detector &amp; Git-Diff Scoper (Priority: P0/MVP, Engine: tdd_direct)
- **Description:** Auto-detect project runner config (Go, Node, Python, Rust) and parse git diff to constrain mutations strictly to modified lines.
- **UI Surface / Route:** CLI: mutate --diff
- **Decider / Command:** FilterMutantsByDiffDecider
- **Projection / Read Model:** ScopedMutationPlan
- **Status:** ✅ Complete
### [State Change] Atomic Execution Runner &amp; Sandbox (Priority: P0/MVP, Engine: tdd_direct)
- **Description:** Execute mutants in-place with guaranteed defer rollback, configurable timeout, exit code tracking, and classification (KILLED, SURVIVED, TIMED_OUT, COMPILE_ERROR).
- **UI Surface / Route:** CLI: mutate run
- **Decider / Command:** RecordMutantOutcomeDecider
- **Projection / Read Model:** MutantOutcomeStream
- **Status:** ✅ Complete
### [State View] Scorecard Calculation &amp; Deliverables (Priority: P1, Engine: tdd_direct)
- **Description:** Compute mutation score percentage, summarize surviving mutant diffs, and generate markdown/json reports for agent and human review.
- **UI Surface / Route:** CLI: mutate report
- **Decider / Command:** ComputeScorecardDecider
- **Projection / Read Model:** .docs/mutation-scorecard.md
- **Status:** ✅ Complete
### [Automation] Reactive Skill Statechart Wireup &amp; End-to-End Test (Priority: P1, Engine: tdd_direct)
- **Description:** Wire the Go binary execution into the reactive skill state transitions and verify end-to-end execution.
- **UI Surface / Route:** Reactive Bus: reactive-skills-axi
- **Decider / Command:** AdvanceSkillStateDecider
- **Projection / Read Model:** ExecutionLog &amp; EventStore
- **Status:** ✅ Complete
