# APPROVE_PLAN
Present the complete design plan and record the user's decision. This is a human gate.
## Consumed context
context.intake, context.criteria, context.eval_design, context.grading.
## Present
A criteria table with metric, threshold, population, and target source.
The eval method and grader for each criterion.
The case plan: volume, held-out share, seed and expansion plan, edge-case coverage.
For LLM graders: rubric summary, grader model, and the validation plan.
The default outcome is this plan only. Building a harness and running it are optional next steps.
## Decide
Ask the user to choose exactly one:
PLAN_APPROVED_FINAL: accept the plan and stop here.
PLAN_APPROVED_BUILD: accept the plan and continue to harness generation.
REVISE_PLAN: change the plan. Ask what to change, then return to CRITERIA.
Approval already given for these exact revisions stays valid. Do not infer approval from silence.
## Exit
For approval, emit the signal with p.approved: true and contextUpdates.plan_approval:
```json
{ "approved": true, "exit": "plan_only", "revisions": { "criteria": 1, "eval_design": 1, "grading": 1 },
  "owner": "text", "source": "where the user approved" }
```
Use exit "build_harness" with PLAN_APPROVED_BUILD. The revisions must equal the current revisions.
For REVISE_PLAN, emit with a payload field reason (what the user wants changed) and contextUpdates.plan_approval = null.
## Atomic Gate
The approval record points to the user's own words and the exact revisions shown.
