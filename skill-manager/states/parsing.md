# PARSING State

## Goal
Resolve and validate the operation type from context.

## Logic
Validate that `context.operation` is one of the five supported operations:
- `CREATE` — scaffold a new reactive skill from scratch
- `UPDATE` — modify an existing reactive skill's states, guards, or templates
- `DELETE` — remove a reactive skill entirely
- `MIGRATE_LEGACY` — convert a legacy SKILL.md skill to reactive format
- `MIGRATE_REACTIVE` — upgrade a reactive skill from v1 to v2.0.0

If `context.operation` is CREATE or UPDATE:
- Validate that `context.skill_name` is a valid skill identifier (lowercase, numbers, hyphens only)
- Optionally validate `context.skill_config` is valid YAML if provided

If `context.operation` is MIGRATE_LEGACY:
- Set `migrate_mode` to `AUTO_INFER` if not provided
- Validate `migrate_mode` is one of AUTO_INFER or GRILL_ON_AMBIGUITY

If `context.operation` is MIGRATE_REACTIVE:
- Set `source_version` to "reactive/v1" if not provided
- Set `target_version` to "2.0.0" if not provided

If `context.operation` is invalid or missing:
- Emit ERROR with payload `{ reason: 'INVALID_OPERATION', operation: context.operation }`

## Context Variables Set
- `operation_type`: the validated operation string
- `migrate_mode`: AUTO_INFER or GRILL_ON_AMBIGUITY (for MIGRATE_LEGACY)
- `source_version`: "reactive/v1" (for MIGRATE_REACTIVE)
- `target_version`: "2.0.0" (for MIGRATE_REACTIVE)

## Stop Criteria
Valid operation confirmed. Emit `PARSED`.

## Signal
Emit: `PARSED` (on success) or `ERROR` (on invalid operation)
