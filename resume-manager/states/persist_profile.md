# PERSIST_PROFILE State

## Context
You are writing updated achievements, metrics, and skill taxonomies to disk.

## Realistic Constraints
- Update only the resolved `master_profile_path` while strictly preserving existing history and formatting.
- Propagate relevant bullet points only to designated tracks under the resolved `profiles_dir`.
- Resolve both paths using `CONTEXT.md`; do not rediscover or write to an agent-specific directory.
- Append any newly confirmed tools, languages, or domain skills to the taxonomy blocks.
- Write every record in `context.project_record` in place under its employer entry or Open Source, keeping raw facts and rendered bullets together.
- Preserve existing text, order, and UTF-8 encoding.
  Never drop a `verified` flag, a non-claim, or a visibility label.
- Propagate a record to a track file only when its track relevance names that track and the track file exists.

## Instructions
1. Modify the resolved master profile with the new bullet points, project records, or role entries.
2. Update corresponding profile track files under the resolved `profiles_dir`.
3. Verify files are properly formatted and saved.
4. Emit `PROFILE_SAVED`.

## Atomic Verification Checklist
- [CRUCIAL] Master profile updated without corrupting previous historical entries.
- [CRUCIAL] Project Record fields written without altering existing entries; every metric keeps its source and verified flag.
- [CRUCIAL] Designated specialized profile tracks synchronized.
- [IMPORTANT] Skill taxonomies reflect newly adopted tools.

## Signal
Emit: `PROFILE_SAVED`
