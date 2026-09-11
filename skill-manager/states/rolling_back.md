# ROLLING_BACK State

## Goal
Best-effort rollback: restore original state or delete partial artifacts.

## Logic
- UPDATE: attempt to restore original file contents from backup or git
- DELETE: if deletion failed, retry deletion
- CREATE: if creation failed, delete any created files

## Stop Criteria
- If rollback succeeds → emit `ROLLED_BACK`
- If rollback fails → emit `ROLLBACK_FAILED`

## Signal
Emit: `ROLLED_BACK` or `ROLLBACK_FAILED`
