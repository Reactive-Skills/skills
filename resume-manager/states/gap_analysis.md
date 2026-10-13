# GAP_ANALYSIS State

## Context
You are calibrating job description keywords against the candidate's verified profile, targeting the empirical ATS 25–35 keyword "Goldilocks Zone".

## Realistic Constraints
- Target between 25 and 35 exact-match keywords from the JD (tooling, platforms, compliance standards, methodologies).
  - < 25 keywords risks invisibility in recruiter search queries.
  - > 35 keywords risks triggering automated AI keyword-stuffing penalties.
- Calibrated Uncertainty & Socratic Verification:
  - If the JD requires tools, compliance standards, or domain skills not currently recorded in the candidate's profile, ask the candidate whether they have hands-on or adjacent experience before including them.
  - Never fabricate or hallucinate unearned skills.

## Instructions
1. Extract candidate keywords from JD text.
2. Cross-reference against the selected track under the resolved `context.profiles_dir`, using `CONTEXT.md` path precedence, and against the keyword tags, stack, and metrics of that track's Project Records.
3. Verify unconfirmed skills with candidate.
4. Select 25–35 verified keywords for inclusion in resume and cover letter.
5. Rank the Project Records by overlap between the JD terms and each record's keyword tags and stack, weighted toward the selected track.
   Choose 3 to 5 records with `verified: yes` metrics as `selected_projects`.
   Where the selected track or a role has no Project Records, fall back to its role-level bullets and metrics, set `selected_projects` to an empty list, and continue.
   If a strong JD requirement has no matching record, ask the candidate before claiming it.
6. Emit `ANALYSIS_COMPLETE` with payload `{"keywords": verified_keywords, "keyword_count": verified_keywords.length, "selected_projects": selected_projects}` and persist `selected_projects` in `contextUpdates`.

## Atomic Verification Checklist
- [CRUCIAL] Keyword count falls strictly within the 25–35 range.
- [CRUCIAL] Unconfirmed technologies verified with candidate before incorporation.
- [CRUCIAL] `selected_projects` contains only records that carry verified metrics, or is empty when the profile has no records.
- [IMPORTANT] Keywords use exact string phrasing from the JD.
- [NEGATIVE] Zero invented or unverified credentials.

## Signal
Emit: `ANALYSIS_COMPLETE`
