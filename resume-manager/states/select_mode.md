# SELECT_MODE State

## Context
You are routing the user to the correct operational workflow within `resume-manager`: tailoring an application for a specific job posting, updating/maintaining an existing profile, bootstrapping a new profile from scratch, or managing specialized profile tracks.

## Calibrated Uncertainty
- If the user provides a job posting text or URL, assume `MODE_CUSTOMIZE`.
- If the user provides new accomplishments or roles to add, assume `MODE_MAINTAIN`.
- If the user explicitly asks to manage multiple profile tracks, assume `MODE_MANAGE_PROFILES`.
- If intent is ambiguous: check if `master_profile.md` exists. If missing, route to `MODE_BOOTSTRAP`. If present, ask the user to clarify whether they want to customize an application, update records, or manage profiles.

## Instructions
1. Inspect conversation context and filesystem state for existing profiles.
2. Select the appropriate operational mode:
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
