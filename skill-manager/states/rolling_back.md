# ROLLING_BACK State

## Goal
Best-effort rollback: restore original state or delete partial artifacts.

## Logic
- First recheck that `{{context.target_skill_dir}}` canonically remains inside `{{context.authoring_source}}`.
- UPDATE: restore each approved path byte-for-byte from `{{context.plan.pre_update_capture_dir}}` and delete only approved `files_to_create` paths absent from it. Never use `git restore`, `git checkout`, `git stash`, or a repository-wide restore: they discard uncommitted edits made before this update. If the capture is missing or incomplete, emit `ROLLBACK_FAILED` listing the affected paths.
- DELETE: do not replay deletion; emit `ROLLBACK_FAILED` listing the paths that remain.
- CREATE: delete only the created paths listed in the approved file plan.
- Re-observe the target and record the actual `contextUpdates.target_type` (`passive`, `reactive`, or `missing`) with either signal.

## Stop Criteria
- If rollback succeeds → emit `ROLLED_BACK`
- If rollback fails → emit `ROLLBACK_FAILED`

## Signal
Emit: `ROLLED_BACK` or `ROLLBACK_FAILED`
