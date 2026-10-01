# PROFILE_SELECTION State

## Goal
Select the appropriate profile archetype for the target job, evaluate role fit, and assess whether the candidate is at risk of being perceived as overqualified, intimidating, or flighty.

Classify role fit as `strong_fit`, `conditional_fit`, or `weak_fit` using calibrated evidence from the JD and verified candidate profile via the `guards/role_fit.yaml` judgment contract.
Confidence values below 0.8, weak fits, or unclassified roles automatically route via the snap-on adapter to `FIT_REVIEW`.
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
7. **Evaluate Overqualification & Flight-Risk Flags:**
   - Does the candidate have 10-15+ years of senior/staff/principal background, while the role is mid-level, non-technical, or in a traditional non-software industry?
   - If YES:
     - Set `overqualified_risk = true`.
     - Prepare to down-level technical jargon, modulate seniority signals, and construct an authentic anti-flight risk intent narrative.
     - Emit `CALIBRATION_REQUIRED` with payload `{ selected_profile, overqualified_risk: true, reason, role_fit, role_fit_confidence, role_fit_reasons, role_fit_gaps }`.
   - If NO:
     - Set `overqualified_risk = false`.
     - Emit `STANDARD_MATCH` with payload `{ selected_profile, overqualified_risk: false, role_fit, role_fit_confidence, role_fit_reasons, role_fit_gaps }`.

Include `role_fit`, `role_fit_confidence`, `role_fit_reasons`, and `role_fit_gaps` in both branch payloads.

The fit classification must distinguish transferable strengths from missing or unverified requirements.

## Atomic Checklist
- [ ] Role matched to appropriate profile track.
- [ ] Overqualification and flight-risk criteria explicitly evaluated.
- [ ] Role fit classification and confidence are evidence-backed.
- [ ] Correct branch signal emitted.

## Signal
Emit: `CALIBRATION_REQUIRED` (overqualified_risk == true) or `STANDARD_MATCH` (overqualified_risk != true).

The judgment contract routes weak or low-confidence fits to `FIT_REVIEW`.
