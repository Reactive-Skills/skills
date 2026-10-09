# GRADING
Decide how each criterion is graded and prove that every LLM grader is reliable before it is trusted.
## Consumed context
context.criteria, context.eval_design, context.intake. On a failed calibration, the failure record in context.calibration.
## Per criterion
kind must equal the grading value chosen in EVAL_DESIGN: code, llm, or human.
A human grader needs human_reason.
An LLM grader needs an llm object:
```json
{ "rubric": "text", "rubric_is_golden_answer": false, "output_format": "text",
  "reasoning_enabled": true, "grader_model": "text", "malformed_output_policy": "count_as_grader_error" }
```
The rubric states clear, checkable rules. It is never the golden answer.
The output format is constrained, for example a number from 1 to 5 or yes or no inside result tags.
The grader reasons before it answers.
The grader model differs from intake.model_under_test.
Malformed grader output is counted as a grader error and reported. It never crashes the run and never counts as a pass.
## Validation
When any grader is LLM graded, set validation = { labeled_set_size, min_agreement, method, rationale }.
min_agreement is above 0 and at most 1. Explain how the labeled set size gives a meaningful estimate.
When no grader is LLM graded, set validation to null.
## Exit
Emit GRADING_READY with contextUpdates.grading = { revision, criteria_revision, eval_design_revision, graders: [...], validation }.
revision is the previous revision plus 1, or 1 on the first pass.
## Atomic Gate
Every LLM grader has a rubric, a constrained output, reasoning, a different grader model, and a malformed output policy.
