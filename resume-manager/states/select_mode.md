# SELECT_MODE State

## Context
You are routing the user to the correct operational workflow within `resume-manager`: tailoring an application for a specific job posting, updating/maintaining an existing profile, bootstrapping a new profile from scratch, or managing specialized profile tracks.

## Calibrated Uncertainty
- If the user provides a job posting text or URL, assume `MODE_CUSTOMIZE`.
- If the user provides new accomplishments or roles to add, assume `MODE_MAINTAIN`.
- If the user explicitly asks to manage multiple profile tracks, assume `MODE_MANAGE_PROFILES`.
- If intent is ambiguous, resolve paths using `CONTEXT.md` and check the resolved master profile. If it is missing and the legacy-search conditions in `CONTEXT.md` are met, ask before reading or migrating any match. If no profile is available, route to `MODE_BOOTSTRAP`; otherwise ask whether the user wants customization, maintenance, or profile management.

## Instructions
1. Resolve `master_profile_path` and `profiles_dir` using `CONTEXT.md` before inspecting files.
2. Check legacy roots only under the conditions defined in `CONTEXT.md`, and ask before reading or copying a match.
3. If the user chooses in-place use, set explicit path overrides; if the user approves a copy, copy only into missing destinations, verify the copies, and preserve the legacy source.
4. Inspect conversation context and the resolved filesystem paths for existing profiles.
5. Select the appropriate operational mode:
   - For tailoring materials to a JD: emit `MODE_CUSTOMIZE`.
   - For recording new achievements: emit `MODE_MAINTAIN`.
   - For bootstrapping a brand new career profile: emit `MODE_BOOTSTRAP`.
   - For reviewing or tuning multiple profile tracks: emit `MODE_MANAGE_PROFILES`.

## Atomic Verification Checklist
- [CRUCIAL] Mode selected maps directly to user need or verified profile presence.
- [CRUCIAL] Emits exact valid transition signal.
- [IMPORTANT] Prompts user for clarification only when intent is genuinely ambiguous.
- [NEGATIVE] Does not default to CUSTOMIZE if no profile exists on disk.

## Signal
Emit one of: `MODE_CUSTOMIZE`, `MODE_MAINTAIN`, `MODE_BOOTSTRAP`, `MODE_MANAGE_PROFILES`
