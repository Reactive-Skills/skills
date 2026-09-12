# PERSIST_PROFILE State

## Context
You are writing updated achievements, metrics, and skill taxonomies to disk.

## Realistic Constraints
- Update `master_profile.md` while strictly preserving existing history and formatting.
- Propagate relevant bullet points to designated profile tracks under `profiles/`.
- Append any newly confirmed tools, languages, or domain skills to the taxonomy blocks.

## Instructions
1. Modify `master_profile.md` with the new bullet points or role entries.
2. Update corresponding profile track files under `profiles/`.
3. Verify files are properly formatted and saved.
4. Emit `PROFILE_SAVED`.

## Atomic Verification Checklist
- [CRUCIAL] Master profile updated without corrupting previous historical entries.
- [CRUCIAL] Designated specialized profile tracks synchronized.
- [IMPORTANT] Skill taxonomies reflect newly adopted tools.

## Signal
Emit: `PROFILE_SAVED`
