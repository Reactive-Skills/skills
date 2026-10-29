# PROFILE_SELECTION State

## Goal
Select the appropriate profile archetype for the target job, evaluate role fit, and assess whether the candidate is at risk of being perceived as overqualified, intimidating, or flighty.

Classify role fit as `strong_fit`, `conditional_fit`, or `weak_fit` using calibrated evidence from the JD and verified candidate profile via the `guards/role_fit.yaml` judgment contract.
Only `strong_fit` and `conditional_fit` may continue to tailoring; their transition guards refuse any other `role_fit`.
Weak, unclassified, or low-confidence fits go to `FIT_REVIEW` through `FIT_REVIEW_REQUIRED`.
The Jev judgment also falls back to `FIT_REVIEW` when the picked label's probability is below 0.8.
Overqualification risk is governed by the `guards/overqualification_risk.yaml` predicate contract.
Both evaluations can execute in a single forward pass via `guards/profile_evaluation_questionnaire.yaml`.

## Instructions
1. Resolve `master_profile_path` and `profiles_dir` using `CONTEXT.md` before selecting a track.
2. Read the master and candidate tracks only from those resolved paths.
3. Check legacy roots only under the conditions defined in `CONTEXT.md`, and ask before reading or copying a match.
4. If the user chooses in-place use, set explicit path overrides before reading the legacy files.
5. Copy legacy files only after explicit approval, only to absent destinations, and verify copies without changing the source.
6. Map the target role and industry against available profile tracks:
   - Senior / Staff / Principal / Architect in Tech -> `senior_technical`
   - Mid-Level Developer, Standard Web/App Developer, Non-Principal SWE -> `practical_mid_technical`
   - Operations Manager, Program Manager, Business Process -> `operations_management`
   - Solutions Architect, TAM, Customer Engineering -> `solutions_client_facing`
   - Healthcare, Manufacturing, Government, Logistics, Non-Tech Sector -> `adjacent_industry`
   - Read the Project Records whose track relevance names the chosen track.
     Cite matching records in `role_fit_reasons` and name unmatched JD requirements in `role_fit_gaps`.
7. **Evaluate Overqualification & Flight-Risk Flags:**
   - Does the candidate have 10-15+ years of senior/staff/principal background, while the role is mid-level, non-technical, or in a traditional non-software industry?
   - If YES, set `overqualified_risk = true` and prepare to down-level technical jargon, modulate seniority signals, and construct an authentic anti-flight risk intent narrative.
   - If NO, set `overqualified_risk = false`.
8. Prepare the judgment evidence: `jd_requirements` contains the required qualifications, seniority, technologies, and responsibilities parsed from the JD; `candidate_experience_summary` contains the relevant verified experience, transferable strengths, and missing or unverified requirements. Keep both as nonempty text. Omit candidate names, contact details, profile paths, unrelated achievements, and raw profile archives.
   Include `target_title`, `jd_requirements`, and `candidate_experience_summary` as top-level fields in each fit branch payload. These declared context keys reach the judgment before the factual guard. The judge receives only those three fields and no event payload. Runtime 0.20.0 refuses the signal before a model call only when requirements or experience are absent; a present empty value still reaches the model. Gather the evidence or use `FIT_REVIEW_REQUIRED`.
9. **Route the result:**
   - If `role_fit` is `weak_fit` or `other`, or `role_fit_confidence` is below 0.8, emit `FIT_REVIEW_REQUIRED` with payload `{ selected_profile, overqualified_risk, role_fit, role_fit_confidence, role_fit_reasons, role_fit_gaps }`. If the user approves the fit, `FIT_REVIEW` still calibrates framing when `overqualified_risk` is `true`.
   - Otherwise, if `overqualified_risk` is `true`, emit `CALIBRATION_REQUIRED` with payload `{ selected_profile, overqualified_risk: true, reason, target_title, jd_requirements, candidate_experience_summary, role_fit, role_fit_confidence, role_fit_reasons, role_fit_gaps }`.
   - Otherwise, emit `STANDARD_MATCH` with payload `{ selected_profile, overqualified_risk: false, target_title, jd_requirements, candidate_experience_summary, role_fit, role_fit_confidence, role_fit_reasons, role_fit_gaps }`.

Include `role_fit`, `role_fit_confidence`, `role_fit_reasons`, and `role_fit_gaps` in every branch payload.
Also include `target_title`, `jd_requirements`, and `candidate_experience_summary` in the `CALIBRATION_REQUIRED` and `STANDARD_MATCH` payloads.

The fit classification must distinguish transferable strengths from missing or unverified requirements.

## Atomic Checklist
- [ ] Role matched to appropriate profile track.
- [ ] Overqualification and flight-risk criteria explicitly evaluated.
- [ ] Role fit classification and confidence are evidence-backed.
- [ ] Correct branch signal emitted.

## Signal
Emit: `FIT_REVIEW_REQUIRED` (role_fit is weak_fit or other, or role_fit_confidence < 0.8), `CALIBRATION_REQUIRED` (strong or conditional fit and overqualified_risk == true), or `STANDARD_MATCH` (strong or conditional fit and overqualified_risk != true).

The Jev judgment on `CALIBRATION_REQUIRED` and `STANDARD_MATCH` falls back to `FIT_REVIEW` when the picked label's probability is below 0.8.
