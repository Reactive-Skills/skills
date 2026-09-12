# INSPECT_PROFILE State

## Goal
Inspect existing master profile and specialized tracks to prepare for maintenance.

## Instructions
1. Locate the master profile at `context.master_profile_path` or standard discovery paths (`~/.gemini/resume/master_profile.md`, `~/.agents/resume/master_profile.md`, `~/.kilocode/resume/master_profile.md`).
2. If profile exists and is non-empty:
   - Read and parse recent roles and skills taxonomy.
   - Emit `PROFILE_LOADED` with payload `{ profile_found: true, path: master_profile_path }`.
3. If no profile exists:
   - Emit `NO_PROFILE_FOUND`.

## Atomic Checklist
- [ ] Checked candidate master profile paths.
- [ ] Confirmed existence and readability before proceeding.

## Signal
Emit: `PROFILE_LOADED` or `NO_PROFILE_FOUND`
