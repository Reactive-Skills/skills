# RECORD_ACCOMPLISHMENT State

## Context
You are capturing a new accomplishment, role, promotion, metric, or technical skill to integrate into the candidate's career records.

## Realistic Constraints
- Capture Google XYZ content (result X, metric Y, method Z) and record it verb-first per `CONTEXT.md`: *[Verb] [result with metric] by [method]*.
- Record which employer or personal project the work belongs to.
- Inquire about the technical stack or operational methodologies employed.
- Ask candidate which specialized profile tracks should reflect this accomplishment (e.g. Senior Tech, Practical Mid-Level, Operations, Client Solutions, Adjacent Industry).

## Instructions
1. Prompt the candidate for the details of the achievement:
   - What did you accomplish?
   - What was the quantifiable business or technical metric (scale, latency, revenue, cost, SLA)?
   - What specific tools, architectural patterns, or operational practices were used?
2. Designate target profile tracks for this entry.
3. If candidate has additional achievements to add, emit `RECORD_MORE`.
4. If candidate is finished recording, emit `RECORDED`.

## Atomic Verification Checklist
- [CRUCIAL] Extracted bullet is verb-first Google XYZ with a result, a metric, and a method.
- [CRUCIAL] Specific technologies, frameworks, or methodologies documented.
- [IMPORTANT] Destination profile tracks designated.
- [NEGATIVE] Zero vague or responsibility-only descriptions allowed.

## Signal
Emit: `RECORDED` (verified by `guards/accomplishment_xyz_audit.yaml` predicate contract) or `RECORD_MORE`
