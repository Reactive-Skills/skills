# MANAGE_PROFILES State

## Context
You are managing the candidate's suite of specialized profile tracks. Different industries and role tiers require tailored narratives: senior engineering positions require architecture and scale, while operational or adjacent industry roles require grounded execution without intimidating hiring managers.

## Realistic Constraints
- Resolve the profile home and exact file paths using `CONTEXT.md` before listing or changing tracks.
- Read and write tracks only under the resolved `profiles_dir`.
- Search legacy roots only under the conditions defined in `CONTEXT.md`; ask before reading or copying a match.
- If the user chooses in-place use, set explicit path overrides before reading the legacy files.
- If the user approves a copy, preserve legacy files, avoid existing destinations, and verify copied content.
- Present an inventory of available profile tracks.
- Enable the candidate to view, calibrate narrative tone, or create a new custom track.
- If candidate wants to immediately tailor an application for a job, allow quick transition to `INGEST_JD`.

## Instructions
1. Display current profile tracks (`senior_technical`, `practical_mid_technical`, `operations_management`, `solutions_client_facing`, `adjacent_industry`).
2. Apply requested calibration edits or scaffold new custom tracks.
3. If candidate wants to customize a resume immediately, emit `SWITCH_TO_CUSTOMIZE`.
4. If management session is complete, emit `PROFILES_UPDATED`.

## Atomic Verification Checklist
- [CRUCIAL] Multi-profile options clearly presented to candidate.
- [IMPORTANT] Track modifications persisted to disk.
- [IMPORTANT] Clean transition to customization supported.

## Signal
Emit: `PROFILES_UPDATED` or `SWITCH_TO_CUSTOMIZE`
