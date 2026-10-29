# AUTHENTICITY_REVIEW State

## Goal
Check that the drafted resume reads as written by the candidate before export.
Find tells that mark text as AI-generated or written for a keyword scanner.
Check every metric against the verified master profile.

## Context Variables Read
- `context.resume_path`
- `context.master_profile_path`
- `context.active_profile_id`
- `context.selected_projects`

## Context Variables Set
- `context.resume_text`: full text of the resume headline and experience bullets
- `context.authenticity_flags`: list of `{location, line, tell, repeat}` entries, empty when clean
- `context.unverified_metrics`: list of metrics in the resume that the master profile does not support, empty when clean

## Instructions
1. Read `resume_path` and the master profile at `master_profile_path` for the selected track under `profiles_dir`.
   Read the existing `context.authenticity_flags`: entries there come from the previous review round.
2. Set `resume_text` to the headline and every experience bullet.
3. Flag each line that has any of these tells (see `references/professional-voice-standards.md`, tells 2, 5, and 6, and the Project Record rules in `CONTEXT.md`).
   Record `location` as the employer or project plus the bullet number, or `headline`.
   Set `repeat` to 0 for a new flag, or to the previous `repeat` plus 1 when the same `location` was flagged in the previous round.
   - buzzwords with no named system or action
   - no concrete result, or no named method
   - the same opening verb on more than two bullets
   - an "Accomplished" opener, an "as measured by" clause, or stacked hedges such as "up to approximately"
   - an em dash, or a double hyphen used as one
   - a statement the master profile lists as a non-claim
   - a confidential internal product name (a record with `visibility: confidential` carries the resume label to use instead)
4. Check every number and percentage in the resume against the master profile.
   A metric is supported only when a Project Record lists it with `verified: yes` or the profile's role text states it.
   Record each one the profile does not support in `unverified_metrics`.
5. Never edit `resume.md` in this state.
   Never invent or adjust a metric to clear a flag.
6. If a line has no flag and no unverified metric, leave it out of both lists.

## Saved review evidence

After reading and checking the resume, save the exact `resume_text` headline and experience bullets to a workspace-local Markdown evidence file.
Keep `resume.md` unchanged. Import that excerpt with the signal so the judgment sees the same text scope as the inline form:

```bash
reactive-skills-axi emit resume-manager RESUME_AUTHENTIC --job <run-uuid> --payload '{"authenticity_flag_count":0,"unverified_metric_count":0,"contextUpdates":{"authenticity_flags":[],"unverified_metrics":[]}}' --evidence '{"/resume_text":{"path":"<workspace-relative-review-excerpt>","media_type":"text/markdown"}}'
```

Use `RESUME_FLAGGED` with the actual counts and populated lists when findings exist; bind the same `/resume_text` pointer.
For MCP supply the pointer map in `reactive_emit_signal.evidence`.
Re-import the current excerpt each round. Import/verification failure must be corrected before retrying.
Never send an inline `resume_text` or duplicate it in `contextUpdates` when binding `/resume_text`.
The existing guards, factual checks, judgment scope, and 0.75 threshold still apply.

## Signals
The following inline forms remain valid on the same compatible runtime.
If `authenticity_flags` and `unverified_metrics` are both empty, emit `RESUME_AUTHENTIC` with payload `{"authenticity_flag_count": 0, "unverified_metric_count": 0, "resume_text": resume_text}`.
Send `resume_text` as a top-level payload field: the judgment reads only that field.
Persist the two empty lists in `contextUpdates`.
The runtime then judges `resume_text` against `guards/resume_authenticity_audit.yaml` and routes to `DRAFTING` when P(clean) is below 0.75.
This is a style policy threshold, not a calibrated AI-authorship detector.
Factual metric checks remain mandatory regardless of the style score.

If either list has entries, emit `RESUME_FLAGGED` with payload `{"authenticity_flag_count": <n>, "unverified_metric_count": <m>, "resume_text": resume_text}`.
Persist `authenticity_flags`, and `unverified_metrics` in `contextUpdates` so `DRAFTING` can rewrite only the flagged lines.

## Atomic Verification Checklist
- [CRUCIAL] Every resume metric was compared with the master profile.
- [CRUCIAL] No metric was invented, rounded up, or adjusted to clear a flag.
- [CRUCIAL] No resume line states a non-claim or a confidential internal product name.
- [CRUCIAL] `resume.md` is unchanged by this state.
- [IMPORTANT] Each flag names the exact line and the tell.
- [IMPORTANT] Counts in the payload equal the list lengths in context.
