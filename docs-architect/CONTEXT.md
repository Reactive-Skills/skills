# Docs Architect - Domain Context

## Ubiquitous Language

| Term | Definition |
|---|---|
| Source truth | Repository files that establish behavior, interfaces, decisions, or operating constraints |
| Fact | A source-linked statement suitable for documentation |
| Information architecture | The hierarchy, navigation, and ownership model for documentation |
| Diagram inventory | The set of diagrams, their source relationships, and validation status |
| Traceability | A verifiable link from each important documentation claim to source material |
| Publication gate | The human review checkpoint before documentation is released |

## Domain Boundaries

In scope: repository discovery, fact extraction, information architecture, drafting, diagram generation, validation, review, and projection.

Out of scope: changing product behavior, replacing source code, publishing to external hosts, or silently inventing facts when sources are absent.

## Statechart Invariants

1. Intake requires at least one source path, an audience, and an outcome list.
2. Extraction must produce at least one sourced fact before design begins.
3. Diagram generation requires a non-empty diagram inventory.
4. Validation must exit successfully before review.
5. Approval is the only path to `SUCCESS`; rejection is the only path to `BLOCKED`.
6. Every state prompt is referenced by `skill.yaml`, and every transition has an explicit guard.

## Schema

This skill uses schema version `2.0.0`. Context is event-sourced and projections are derived from declared templates.
