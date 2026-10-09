# AUTHENTICITY_REVIEW State

## Goal
Check that the drafted resume reads as written by the candidate before export.
Find tells that mark text as AI-generated or written for a keyword scanner.
Check every metric against the verified master profile.

## Context Variables Read
- `context.resume_path`
- `context.master_profile_path`
- `context.active_profile_id`

## Context Variables Set
- `context.resume_text`: full text of the resume headline and experience bullets
- `context.authenticity_flags`: list of `{location, line, tell, repeat}` entries, empty when clean
- `context.unverified_metrics`: list of metrics in the resume that the master profile does not support, empty when clean

## Instructions
1. Read `resume_path` and the master profile at `master_profile_path` for the selected track under `profiles_dir`.
   Read the existing `context.authenticity_flags`: entries there come from the previous review round.
2. Set `resume_text` to the headline and every experience bullet.
3. Flag each line that has any of these tells (see `references/professional-voice-standards.md`, tells 2, 5, and 6).
   Record `location` as the employer or project plus the bullet number, or `headline`.
   Set `repeat` to 0 for a new flag, or to the previous `repeat` plus 1 when the same `location` was flagged in the previous round.
   - buzzwords with no named system or action
   - no concrete result, or no named method
   - the same opening verb on more than two bullets
   - an "Accomplished" opener, an "as measured by" clause, or stacked hedges such as "up to approximately"
   - an em dash, or a double hyphen used as one
4. Check every number and percentage in the resume against the master profile.
   Record each one the profile does not support in `unverified_metrics`.
5. Never edit `resume.md` in this state.
   Never invent or adjust a metric to clear a flag.
6. If a line has no flag and no unverified metric, leave it out of both lists.

## Signals
If `authenticity_flags` and `unverified_metrics` are both empty, emit `RESUME_AUTHENTIC` with payload `{"authenticity_flag_count": 0, "unverified_metric_count": 0}`.
Persist `resume_text` and the two empty lists in `contextUpdates`.
The runtime then judges `resume_text` against `guards/resume_authenticity_audit.yaml` and routes to `DRAFTING` when P(clean) is below 0.80.

If either list has entries, emit `RESUME_FLAGGED` with payload `{"authenticity_flag_count": <n>, "unverified_metric_count": <m>}`.
Persist `resume_text`, `authenticity_flags`, and `unverified_metrics` in `contextUpdates` so `DRAFTING` can rewrite only the flagged lines.

## Atomic Verification Checklist
- [CRUCIAL] Every resume metric was compared with the master profile.
- [CRUCIAL] No metric was invented, rounded up, or adjusted to clear a flag.
- [CRUCIAL] `resume.md` is unchanged by this state.
- [IMPORTANT] Each flag names the exact line and the tell.
- [IMPORTANT] Counts in the payload equal the list lengths in context.
