# PR Triage - Domain Context

## Ubiquitous Language

| Term | Definition |
|---|---|
| Pull request batch | The set of PR identifiers selected for one triage run |
| Triage policy | Explicit rules for size, checks, reviewers, ownership, and risk |
| Classification | Deterministic assignment of risk, size, ownership, and reviewer |
| Readiness assessment | Evidence-based evaluation against the triage policy |
| Routing plan | Ordered recommendations for review, rework, merge, or blocking |
| Disposition gate | Human decision to approve, rework, or block the triage result |

## Domain Boundaries

In scope: metadata collection, classification, policy assessment, routing, review, and projection.

Out of scope: merging code, bypassing required checks, changing review policy during a run, or treating a recommendation as an approved merge.

## Statechart Invariants

1. Intake requires a repository, non-empty PR batch, and triage policy.
2. Collection must produce at least one item before classification.
3. Classification and assessment must produce non-empty result arrays.
4. Routing must produce at least one recommendation before review.
5. Only explicit approval reaches `SUCCESS`; explicit rejection reaches `BLOCKED`.
6. Every transition has an explicit guard and every state prompt is referenced.

## Schema

This skill uses schema version `2.0.0`. Triage evidence and decisions are event-sourced for reproducible projections.
