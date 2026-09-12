# Domain Model & Event Modeling (CQRS)

## 1. Domain Event Timeline (Entity-Qualifier-Verb)
- `mutation-session-initialized`
- `target-codebase-detected`
- `runner-config-resolved`
- `baseline-suite-passed`
- `baseline-suite-failed`
- `source-file-parsed`
- `mutant-candidate-synthesized`
- `differential-filter-applied`
- `mutant-execution-scheduled`
- `mutant-execution-completed`
- `mutant-kill-confirmed`
- `mutant-survival-detected`
- `mutant-timeout-exceeded`
- `mutant-build-errored`
- `scorecard-metrics-computed`
- `mutation-report-projected`

## 2. Write-Side Pure Deciders (Zero I/O)
- **Signature:** `decide(state: State, command: Command): DomainEvent[]`
- **Invariant Guarantee:** Deciders never perform network, file, or database I/O. All state mutations are expressed strictly as returned events.

## 3. Read-Side Materialized Projections
- **Signature:** `evolve(view: ViewState, event: DomainEvent): ViewState`
- **Storage Sink:** Skill-scoped SQLite tables (`.reactive/skills/<skill>/events.db`) or in-memory models queried directly by client screens.
