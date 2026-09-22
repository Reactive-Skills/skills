# PROFILE_SELECTION State

## Goal
Select the appropriate profile archetype for the target job, evaluate role fit, and assess whether the candidate is at risk of being perceived as overqualified, intimidating, or flighty.

Classify role fit as `strong_fit`, `conditional_fit`, or `weak_fit` using only evidence from the JD and verified candidate profile.
Set `role_fit_confidence` to a number from 0 to 1.
Treat values below 0.8 as low confidence and route them to `FIT_REVIEW`.

## Instructions
1. Map the target role and industry against available profile tracks:
   - Senior / Staff / Principal / Architect in Tech -> `senior_technical`
   - Mid-Level Developer, Standard Web/App Developer, Non-Principal SWE -> `practical_mid_technical`
   - Operations Manager, Program Manager, Business Process -> `operations_management`
   - Solutions Architect, TAM, Customer Engineering -> `solutions_client_facing`
   - Healthcare, Manufacturing, Government, Logistics, Non-Tech Sector -> `adjacent_industry`
2. **Evaluate Overqualification & Flight-Risk Flags:**
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
