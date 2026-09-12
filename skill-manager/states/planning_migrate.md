# PLANNING_MIGRATE State

## Goal
Generate a detailed migration plan for user approval.

## Logic
- For MIGRATE_LEGACY: list all files to create (skill.yaml, README.md, states/*.md, guards/.gitkeep, templates/*.hbs)
- For MIGRATE_REACTIVE: list all files to create/modify/delete based on inspection delta (including README.md if missing)
- Produce a human-readable plan showing:
  - Operation type
  - Files created
  - Files modified
  - Files deleted (if any)
  - Any manual steps required

## Context Variables Set
- migration_plan: structured plan object
- plan_summary: human-readable summary

## Signal
Emit: PLAN_READY