# SCORE
Run the evals and record observed results per criterion.
## Consumed context
context.criteria, context.harness, context.run_approval, context.calibration.
## Steps
Run the harness on the approved cases. Score each criterion with its approved method.
Do not tune prompts, rubrics, or thresholds using held-out cases.
Report every criterion separately. Do not blend them into one pass claim.
Count malformed grader replies per criterion as grader_error_count.
A failing criterion is a valid result. Record it.
## Exit
Emit SCORING_COMPLETE with contextUpdates.results:
```json
{ "kind": "observed", "total_calls_made": 200, "cost_usd": 1.2,
  "criteria": [{ "criterion_id": "id", "value": 0.9, "threshold": 0.85, "comparator": ">=", "passed": true,
                 "n": 100, "grader_error_count": 0, "evidence_refs": ["text"] }] }
```
threshold and comparator copy the criterion. passed must agree with value.
total_calls_made and cost_usd stay within the approved limits.
## Atomic Gate
Every criterion has a result, and results come from the harness run, not from estimation.
