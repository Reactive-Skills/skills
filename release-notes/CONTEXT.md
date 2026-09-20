# Release Notes - Domain Context

## Ubiquitous Language

| Term | Definition |
|---|---|
| Release scope | The commit range, tags, or branch refs defining the release boundary |
| Changelog entry | A single categorized, source-linked change description |
| Release notes | The composed human-readable release summary |
| Classification | Assignment of a commit to a changelog category (feature, fix, breaking, etc.) |
| Disposition gate | Human decision to approve, revise, or reject release notes |

## Domain Boundaries

In scope: scope intake, commit and artifact collection, changelog classification, composition, validation, review, and projection.

Out of scope: publishing artifacts, tagging releases, changing product behavior, or fabricating commits without source trace.

## Statechart Invariants

1. Intake requires a repository, release version, and non-empty scope refs.
2. Collection must produce at least one commit before classification.
3. Classification must produce at least one entry before composition.
4. Composition must produce non-empty release notes before validation.
5. Validation must pass before review.
6. Only explicit approval reaches `SUCCESS`; explicit rejection reaches `BLOCKED`.

## Schema

This skill uses schema version `2.0.0`. Release evidence and decisions are event-sourced for reproducible projections.
