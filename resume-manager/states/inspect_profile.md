# INSPECT_PROFILE State

## Goal
Inspect existing master profile and specialized tracks to prepare for maintenance.

## Instructions
1. Resolve `master_profile_path` and `profiles_dir` using `CONTEXT.md` and inspect only those paths first.
2. Search legacy roots only under the conditions defined in `CONTEXT.md`.
3. If a legacy profile is found, ask whether the user wants to use it in place by setting explicit paths, copy it to the resolved home, or leave it untouched.
4. Copy only after explicit approval, copy the master and existing tracks only to absent destination files, verify each copy, and preserve all legacy files.
5. If the resolved master exists and is non-empty, read recent roles and the skills taxonomy, then emit `PROFILE_LOADED` with its resolved path.
6. If the user declines legacy use or no profile exists, emit `NO_PROFILE_FOUND`.

## Atomic Checklist
- [ ] Checked candidate master profile paths.
- [ ] Confirmed existence and readability before proceeding.

## Signal
Emit: `PROFILE_LOADED` or `NO_PROFILE_FOUND`
