# INSPECTING_REACTIVE State

## Goal
Compare the source v1 reactive skill with the v2.0.0 schema to compute the migration delta.

## Logic
- Read existing skill.yaml (v1)
- Read v2.0.0 schema reference (from reactive-skill-creator or docs)
- Compute diff:
  - New required fields in v2 (version, event_store config, mcp config)
  - States that need splitting (combined phases -> separate state files)
  - Guards that need rewriting (JS -> Zod schema)
  - Templates that need new projection syntax
- Set migration_plan with the computed transforms

## Context Variables Set
- migration_plan: {new_fields, modified_states, new_files, removed_fields}
- source_version: "reactive/v1"
- target_version: "2.0.0"

## Signal
Emit: INSPECTED
