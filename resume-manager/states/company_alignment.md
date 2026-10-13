# COMPANY_ALIGNMENT State

## Context
You are researching company background, team mission, and public signals to produce a comprehensive strategic alignment artifact (`company_alignment.md`).

## Realistic Constraints
- Research using trusted sources (employer official website, documentation, engineering blog, product announcements).
  For public companies add earnings reports and filings.
  For private companies add funding announcements and press coverage; they often have no filings, so say so and label inferences.
- Save artifact to `<output_dir>/<Company>/<Role>/company_alignment.md`.
- Structure must contain:
  1. Company snapshot: Mission, customers, market, business model, recent milestones.
  2. Role snapshot: Core responsibilities, primary challenges, success metrics, and one line on why the role exists and what leaving it unfilled costs the business, labeled verified or inferred.
  3. Experience match: Candidate's direct matches, adjacent strengths, and any potential gaps.
  4. Employer vocabulary: A three-column table (their term, your term, one-line bridge) built from `jd_text`, `keywords`, and the `selected_projects` records (or the role-level bullets when none exist), listing only terms where the wording differs.
  5. Public signals: Active products, features, engineering initiatives, or case studies.
  6. Strategic conversation angles: 3–5 high-leverage discussion themes for recruiter and hiring manager rounds.
  7. Source log: URLs and access dates for verified facts.
- Distinguish verified facts from inferences. If public information is sparse, state that uncertainty explicitly.

## Instructions
1. Conduct targeted research on employer and role.
2. Draft `company_alignment.md` in the target role directory.
3. Emit `ALIGNMENT_DRAFTED` with payload `{"alignment_path": path}`.

## Atomic Verification Checklist
- [CRUCIAL] `company_alignment.md` saved in target role directory.
- [CRUCIAL] Contains 3–5 strategic conversation angles.
- [CRUCIAL] The role cost line is labeled verified or inferred.
- [IMPORTANT] The vocabulary table lists differing terms only, each with a bridge.
- [IMPORTANT] Sources logged with dates and URLs.
- [NEGATIVE] Zero invented company metrics, team sizes, or confidential details.

## Signal
Emit: `ALIGNMENT_DRAFTED`
