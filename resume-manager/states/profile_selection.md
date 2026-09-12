# PROFILE_SELECTION State

## Goal
Select the appropriate profile archetype for the target job, and evaluate whether the candidate is at risk of being perceived as overqualified, intimidating, or flighty.

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
     - Emit `CALIBRATION_REQUIRED` with payload `{ selected_profile, overqualified_risk: true, reason }`.
   - If NO:
     - Set `overqualified_risk = false`.
     - Emit `STANDARD_MATCH` with payload `{ selected_profile, overqualified_risk: false }`.

## Atomic Checklist
- [ ] Role matched to appropriate profile track.
- [ ] Overqualification and flight-risk criteria explicitly evaluated.
- [ ] Correct branch signal emitted.

## Signal
Emit: `CALIBRATION_REQUIRED` (overqualified_risk == true) or `STANDARD_MATCH` (overqualified_risk != true)
