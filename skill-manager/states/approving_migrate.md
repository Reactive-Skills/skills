# APPROVING_MIGRATE State

## Goal
Present the migration plan to the user for explicit approval.

## Presentation
Show:
- Operation type (MIGRATE_LEGACY or MIGRATE_REACTIVE)
- Skill name
- Migration plan (files created/modified/deleted)
- Target version
- Warning if rollback is complex

## User Action Required
Explicitly approve or reject.

## Stop Criteria
- USER_APPROVED → proceed to EXECUTING_MIGRATE
- USER_REJECTED → proceed to RESTORING_MIGRATE

## Signal
Emit: USER_APPROVED or USER_REJECTED