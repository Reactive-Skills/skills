# BACKING_UP_MIGRATE State

## Goal
Create a full backup of the source skill before migration begins.

## Logic
- For MIGRATE_LEGACY: backup the entire legacy skill directory
- For MIGRATE_REACTIVE: backup the entire reactive skill directory
- Backup destination: skills/.backup/<skill_name>/<timestamp>/
- Use a general agent or shell command to copy the directory recursively

## Context Variables Set
- backup_path: full path to the backup directory created
- backup_timestamp: ISO timestamp of the backup

## Stop Criteria
Backup created successfully. Emit BACKED_UP.

## Signal
Emit: BACKED_UP