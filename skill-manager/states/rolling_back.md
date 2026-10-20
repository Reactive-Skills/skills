# ROLLING_BACK State

## Goal
Best-effort rollback: restore original state or delete partial artifacts.

## Logic
- First recheck that `context.target_skill_dir` canonically remains inside `context.authoring_source`.
- UPDATE: restore only the paths in the approved file plan (`context.plan`); never run a repository-wide restore.
- DELETE: do not replay deletion; emit `ROLLBACK_FAILED` listing the paths that remain.
- CREATE: delete only the created paths listed in the approved file plan.

## Stop Criteria
- If rollback succeeds → emit `ROLLED_BACK`
- If rollback fails → emit `ROLLBACK_FAILED`

## Signal
Emit: `ROLLED_BACK` or `ROLLBACK_FAILED`
