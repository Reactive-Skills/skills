# RECORD_ACCOMPLISHMENT State

## Context
You are capturing a new or enriched project record, accomplishment, role, promotion, metric, or technical skill to integrate into the candidate's career records.
The unit of capture is a Project Record (see `CONTEXT.md`): raw facts plus at least one rendered bullet.

## Realistic Constraints
- Raw facts are exempt from the XYZ gate.
  Each rendered bullet is verb-first Google XYZ with a result, a metric, and a method, recorded per `CONTEXT.md`: *[Verb] [result with metric] by [method]*.
- Record which employer or personal project the work belongs to.
  Enrich the existing entry in place; never move, reorder, or delete existing content.
- Never invent a metric, role, date, team size, or outcome.
  Facts prefilled from repositories or earlier drafts are tagged `verified: no` and shown to the candidate to confirm, correct, or reject.
- Every metric carries a source and a verified flag.
  A figure with conflicting sources stays `verified: no` until the candidate resolves it.
- Ask which claims the evidence does not support and record them as non-claims.
- Ask whether the work is public or confidential.
  A confidential project gets a function-only resume label, and its internal names stay out of rendered bullets.
- Ask candidate which specialized profile tracks should reflect this record (e.g. Senior Tech, Practical Mid-Level, Operations, Client Solutions, Adjacent Industry).

## Instructions
1. Name the project and its employer or Open Source home.
   If the profile already has an entry or prefill, read it and confirm each prefilled fact with the candidate.
2. Collect the raw facts one field at a time: period, role, team size, ownership, problem and context, stack, decisions and tradeoffs, metrics with sources, non-claims, visibility and resume label, track relevance, keyword tags.
3. Draft the story seed: challenge, action, result, one line on what went wrong or what the candidate would change, and any derived figures.
   Compute each derived figure from a verified metric, show the arithmetic, and label it derived.
4. Draft the rendered bullets, or restate the existing bullet if it is still accurate.
   Append the completed record to the `project_record` list in `contextUpdates`, never overwriting earlier entries, and set `context.new_accomplishment` to the bullet being verified.
5. If the candidate has another bullet or project to add, first check the current bullet against the XYZ criterion yourself, because the runtime judges only `context.new_accomplishment` at `RECORDED`, then emit `RECORD_MORE`.
6. If the candidate is finished recording, emit `RECORDED`.

## Atomic Verification Checklist
- [CRUCIAL] Each rendered bullet is verb-first Google XYZ with a result, a metric, and a method.
- [CRUCIAL] Every metric has a source and a verified flag; unconfirmed prefill stays `verified: no`.
- [CRUCIAL] No fact was invented, estimated, or rounded up.
- [CRUCIAL] Specific technologies, frameworks, or methodologies documented.
- [IMPORTANT] Visibility, ownership, non-claims, and destination profile tracks recorded.
- [NEGATIVE] Zero vague or responsibility-only rendered bullets.

## Signal
Emit: `RECORDED` (verified by `guards/accomplishment_xyz_audit.yaml` predicate contract) or `RECORD_MORE`
