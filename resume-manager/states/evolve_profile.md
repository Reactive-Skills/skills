# EVOLVE_PROFILE State

## Context
You are executing the continuous learning flywheel: proposing that newly verified skills and sharpened phrasing from this application be compounded back into the candidate's Master Experience Profile and specialized profile tracks.

## Realistic Constraints
- Only propose skills, frameworks, or tools verified by the candidate during gap analysis.
- Only propose bullet points that improved metric clarity or architectural precision over existing versions.
- Propose newly confirmed project facts only: metrics with a source, decisions and tradeoffs, keyword tags, non-claims, and story seed lines.
  Mark a fact `verified: yes` only after the candidate confirms it.
- Never mutate the candidate's master profile without explicit candidate approval.

## Instructions
1. Resolve `master_profile_path` and `profiles_dir` using `CONTEXT.md`, then review the tailored resume against that master profile:
   - Identify newly verified technical or operational skills.
   - Identify bullet points with sharpened metrics or clearer phrasing.
   - Identify project facts confirmed during gap analysis or drafting that the matching Project Record lacks.
2. Present proposed updates to the candidate.
3. If candidate approves: update only the resolved master profile and relevant tracks under the resolved `profiles_dir`, then emit `EVOLUTION_COMPLETE`.
4. If no updates exist or candidate declines: emit `SKIP_EVOLUTION`.

## Atomic Verification Checklist
- [CRUCIAL] Candidate consent required before modifying master records.
- [CRUCIAL] Only verified additions proposed.
- [IMPORTANT] Appropriate profile tracks designated for propagation.

## Signal
Emit: `EVOLUTION_COMPLETE` or `SKIP_EVOLUTION`
