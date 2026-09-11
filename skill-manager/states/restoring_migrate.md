# RESTORING_MIGRATE State

## Goal
Restore the skill from the pre-migration backup.

## Logic
- For MIGRATE_LEGACY: delete the partial reactive structure, leave legacy intact
- For MIGRATE_REACTIVE: delete the v2.0.0 structure, restore from .backup/
- Use backup_path from BACKING_UP_MIGRATE
- Delete any partial artifacts first
- Copy backup back to original location

## Stop Criteria
Restore complete (success or failure). Emit RESTORED or RESTORE_FAILED.

## Signal
Emit: RESTORED (success) or RESTORE_FAILED (failure)