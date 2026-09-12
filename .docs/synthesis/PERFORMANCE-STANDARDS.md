# Performance Standards & Complexity Budgets

## Scope-Driven Budgets

All in-scope P0/P1 user-facing interactions are budgeted exhaustively, not limited to a top-3.

- **[Universal Token &amp; Syntax Mutator] AST parsing and mutation generation per source file**
  - P0 latency budget: `50ms`
  - P1 latency budget: `100ms`
  - Complexity ceiling: `O(N) tokens single-pass scan`
  - Rationale: Must parse and mutate files within milliseconds to avoid overhead
- **[Target Detector &amp; Git-Diff Scoper] Workspace test runner detection &amp; git diff mapping**
  - P0 latency budget: `100ms`
  - P1 latency budget: `200ms`
  - Complexity ceiling: `Single git diff invocation, O(D) lines`
  - Rationale: Quick resolution of modified lines keeps developer feedback instantaneous
- **[Atomic Execution Runner &amp; Sandbox] Atomic file swap, per-mutant test execution &amp; restore**
  - P0 latency budget: `5000ms`
  - P1 latency budget: `8000ms`
  - Complexity ceiling: `Hard timeout ceiling per mutant, O(1) swap/restore`
  - Rationale: Test execution time dominates; swap and restore must add &lt; 5ms
- **[Scorecard Calculation &amp; Deliverables] Scorecard aggregation and markdown/json projection**
  - P0 latency budget: `20ms`
  - P1 latency budget: `50ms`
  - Complexity ceiling: `O(M) mutant aggregation`
  - Rationale: In-memory summary generation is instantaneous

## Enforcement

Each slice's `CHECK:` command must verify actual latency against its assigned P0 budget. Any P0 interaction exceeding its budget triggers a return to `LEAF_EXECUTE` for remediation.
