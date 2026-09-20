# Architecture Decision Records (ADRs) & Technical Writing

Standards for documenting decisions, system boundaries, and developer documentation.

## 1. Architecture Decision Record (ADR) Standard
Every non-trivial architectural choice must be recorded as an immutable markdown file under `adr/` or `docs/adr/`:
- **Title**: `ADR-XXXX: <Short Imperative Statement>` (e.g., `ADR-0004: Use SQLite with WAL for Embedded Vector Storage`).
- **Status**: `PROPOSED | ACCEPTED | SUPERSEDED | DEPRECATED`.
- **Context**: The forces at play (technical requirements, performance constraints, business context).
- **Decision**: The chosen approach and why alternatives were rejected.
- **Consequences**: Both positive advantages and negative tradeoffs/burdens accepted.

## 2. Developer Documentation Style (Google Dev Style Guidelines)
- **Active Voice & Direct Imperatives**: "Call `connect()` before querying", not "The `connect()` method should be called".
- **Code Sample Completeness**: Provide runnable, copy-pasteable examples with realistic inputs rather than broken pseudocode.
- **Second-Read Optimization**: Use tables, bold lead-ins, and callouts to allow fast scanning.
