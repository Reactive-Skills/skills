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
2. Cross-reference against selected profile track.
3. Verify unconfirmed skills with candidate.
4. Select 25–35 verified keywords for inclusion in resume and cover letter.
5. Emit `ANALYSIS_COMPLETE` with payload `{"keywords": verified_keywords, "keyword_count": verified_keywords.length}`.

## Atomic Verification Checklist
- [CRUCIAL] Keyword count falls strictly within the 25–35 range.
- [CRUCIAL] Unconfirmed technologies verified with candidate before incorporation.
- [IMPORTANT] Keywords use exact string phrasing from the JD.
- [NEGATIVE] Zero invented or unverified credentials.

## Signal
Emit: `ANALYSIS_COMPLETE`
