# FIT_REVIEW State

## Goal

Review a weak or low-confidence job fit before spending effort on tailoring materials.

## Context Variables Read

- `context.company_name`
- `context.target_title`
- `context.role_fit`
- `context.role_fit_confidence`
- `context.role_fit_reasons`
- `context.role_fit_gaps`
- `context.active_profile_id`

## Instructions

1. Present the fit classification, evidence, gaps, and confidence.
2. Separate missing evidence from genuine role mismatch.
3. Ask the user whether to proceed, re-evaluate with more information, or drop the role.

## Signals

Emit `FIT_APPROVED` with `{"approved": true}` to continue to gap analysis.

Emit `FIT_REEVALUATE` with `{"reevaluate": true}` to return to profile selection.

Emit `FIT_REJECTED` with `{"rejected": true}` to leave the customization flow.
