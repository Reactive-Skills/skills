# INGEST_JD State

## Context
You are ingesting and analyzing a target Job Description (JD) to prepare for tailored application generation.

## Realistic Constraints
- Extract:
  - `company_name`: Exact employer name.
  - `target_title`: Literal job title string from the posting (essential for ATS title mirroring).
  - Core requirements, tech stack, and responsibilities.
  - Detected industry sector (Tech/Software, Healthcare, Manufacturing, Logistics, Public Sector, Finance Ops).
  - Detected role seniority (Entry, Mid, Senior, Staff, Principal, Director, Manager).
- Do not alter or summarize the literal job title in this step.

## Instructions
1. Parse the provided JD text or posting URL.
2. Extract the required parameters.
3. Validate that `company_name` and `target_title` are non-empty.
4. Emit `JD_INGESTED` with payload `{"company_name": company_name, "target_title": target_title, "industry": industry, "leveling": leveling}`.

## Atomic Verification Checklist
- [CRUCIAL] Literal job title string captured exactly as printed in JD.
- [CRUCIAL] Company name extracted.
- [IMPORTANT] Industry and role leveling classified.
- [NEGATIVE] No loss of literal title wording needed for ATS exact-match search.

## Signal
Emit: `JD_INGESTED` (guard: payload.company_name != null)
