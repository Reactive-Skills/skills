# BACKING_UP_MIGRATE State

## Goal
Create a full backup of the source skill before migration begins.

## Logic
- For MIGRATE_LEGACY: backup the entire legacy skill directory
- For MIGRATE_REACTIVE: backup the entire reactive skill directory
- Read from the approved absolute `context.target_skill_dir`.
- Resolve the backup destination as `<authoring_source>/.backup/<skill_name>/<timestamp>/` and record its absolute path.
- Verify source, target, and existing backup parent canonically remain inside the selected registered authoring source before copying.
- Reject distribution paths, traversal, and escaping links; preserve the same manager run identity.
- Use a general agent or shell command to copy the directory recursively

## Context Variables Set
- backup_path: full path to the backup directory created
- backup_timestamp: ISO timestamp of the backup

## Stop Criteria
Backup created successfully. Emit BACKED_UP.

## Signal
Emit: BACKED_UP