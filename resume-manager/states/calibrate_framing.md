# CALIBRATE_FRAMING State

## Context
You are calibrating the application narrative for a role where the candidate's deep senior technical background risks intimidating hiring managers or triggering flight-risk rejections.

## Realistic Constraints
- Apply principles from `references/overqualification-and-framing.md`.
- De-Jargon Hyperscale Vocabulary: Translate distributed systems abstractions into concrete business and operational outcomes (e.g. "streamlined automated reporting pipelines" instead of "distributed event-driven Kafka mesh").
- Title Calibration: Calibrate the headline title to match the target position cleanly rather than broadcasting intimidating executive titles.
- De-Emphasize Raw Years: Strip out lead-in numbers (e.g., "15+ years of experience"). Convey seasoning through steady judgment, calm execution, and trade-off maturity.
- Construct the Anti-Flight Risk Intent Narrative: Formulate a compelling, authentic explanation in the cover letter explaining why this specific environment, mission, and hands-on role represent a deliberate, long-term choice.

## Instructions
1. Audit candidate experience against target role context.
2. Generate language translation mappings and intent narrative themes.
3. Save calibration guidelines into `context.calibration_notes`.
4. Emit `FRAMING_CALIBRATED` with payload `{"calibration_notes": calibration_notes}`.

## Atomic Verification Checklist
- [CRUCIAL] High-altitude tech buzzwords mapped to grounded, accessible business language.
- [CRUCIAL] Raw year-count lead-ins eliminated.
- [CRUCIAL] Grounded anti-flight risk intent narrative formulated for cover letter and summary.
- [NEGATIVE] Absence of patronizing or over-engineered technical jargon.

## Signal
Emit: `FRAMING_CALIBRATED`
