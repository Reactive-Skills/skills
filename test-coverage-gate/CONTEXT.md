# Test Coverage Gate - Domain Context

## Ubiquitous Language

| Term | Definition |
|---|---|
| Baseline | Test-suite execution against unmodified source code |
| Coverage metric | Percentage of line, statement, branch, or function elements exercised |
| Threshold | Minimum accepted value for a coverage metric |
| Coverage gap | A file, function, or branch below the configured threshold |
| Quality gate | Decision point that permits or blocks release |
| Exception | Explicit, reviewed acceptance of a threshold miss |

## Domain Boundaries

In scope: command validation, baseline execution, coverage collection, metric parsing, threshold comparison, gap analysis, review, and projection.

Out of scope: rewriting tests, changing production behavior, hiding failures, or treating coverage percentage as proof of correctness.

## Statechart Invariants

1. Test and coverage commands must be configured before baseline execution.
2. A non-zero baseline exit code terminates in `ERROR`.
3. Coverage measurement requires a report and parsed metrics.
4. Gap analysis precedes the human gate.
5. Only explicit approval reaches `SUCCESS`; explicit rejection reaches `BLOCKED`.
6. Every transition has an explicit guard and every state prompt is referenced.

## Schema

This skill uses schema version `2.0.0`. Coverage reports and decisions are event-sourced for reproducible projections.
