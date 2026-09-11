# READY State

## Goal
Wait for user or event to provide skill_name and operation.

## Inputs
- `context.skill_name` — identifier of skill to manage (required)
- `context.operation` — CREATE | UPDATE | DELETE | MIGRATE_LEGACY | MIGRATE_REACTIVE (required)
- `context.skill_config` — optional YAML manifest for CREATE/UPDATE/MIGRATE_REACTIVE
- `context.migrate_mode` — optional: AUTO_INFER or GRILL_ON_AMBIGUITY (for MIGRATE_LEGACY)
- `context.source_version` — optional: defaults to "reactive/v1" (for MIGRATE_REACTIVE)
- `context.target_version` — optional: defaults to "2.0.0" (for MIGRATE_REACTIVE)

## Tools
- read (to inspect existing skill if needed)
- glob (to check directory structure)

## Context
The skill_manager skill is itself a reactive skill. It manages the lifecycle of skills in the ByteQuilt skills ecosystem. It can be invoked by a user requesting skill management or by the MCP server via reactive_migrate.

## Stop Criteria
When `context.skill_name` is bound and non-empty and `context.operation` is one of the valid operations, emit `USER_INVOKED`.

## Signal
Emit: `USER_INVOKED`
