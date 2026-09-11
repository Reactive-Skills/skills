# ADR 0001 — Reactive Skill Schema v1 ? v2.0.0 Migration

## Status
Accepted

## Context

v1 reactive skills (schema_version: "reactive/v1") are static markdown-driven HSMs where the LLM reads the full SKILL.md upfront and guesses state transitions. v2.0.0 introduces a proper event-driven architecture with SQLite event store, MCP server integration, and Just-In-Time prompt loading.

We need a MIGRATE_REACTIVE operation in skill-manager to upgrade existing reactive skills from v1 to v2.0.0.

## Decision

The MIGRATE_REACTIVE operation will:

1. Backup entire skill directory to skills/.backup/<skill_name>/<timestamp>/
2. Inspect v1 skill.yaml and compute delta to v2.0.0 schema
3. Rewrite skill.yaml with schema_version: "2.0.0" and version: "2.0.0"
4. Reorganize states/ to match v2 conventions (split combined state sections)
5. Initialize SQLite event store for the skill
6. Add MCP server configuration
7. On failure, restore from .backup/ (not just delete v2 artifacts)

The migrator does NOT run a new Socratic discovery interview. It performs a structural transform only.

## Consequences

- v1 skills can be upgraded to v2.0.0 programmatically
- Rollback uses full directory restore, not selective deletion
- The reactive_migrate MCP tool delegates to this operation
