# CALIBRATE
Prove the LLM graders agree with human labels before any scoring is trusted.
## Consumed context
context.grading.validation, context.harness, context.run_approval.
## Steps
When no grader is LLM graded, emit CALIBRATION_PASSED with kind "not_required", passed true, and a reason.
Otherwise run every LLM grader on the labeled validation set. Count a malformed reply as a grader error, which is a disagreement.
Compute agreement = agreement_count / labeled_set_size.
passed is true only when agreement is at least validation.min_agreement.
labeled_set_size must be at least the planned validation.labeled_set_size.
## Exit
Emit CALIBRATION_PASSED or CALIBRATION_FAILED with contextUpdates.calibration:
```json
{ "kind": "observed", "grading_revision": 1, "labeled_set_size": 20, "agreement_count": 18,
  "agreement": 0.9, "min_agreement": 0.85, "grader_error_count": 0, "passed": true, "evidence_refs": ["text"] }
```
For CALIBRATION_FAILED also give a payload field reason and set contextUpdates.plan_approval, harness, and run_approval to null.
The workflow returns to GRADING so the rubric can be revised. The plan and harness are approved again.
## Atomic Gate
Agreement is computed from counts, not asserted.
