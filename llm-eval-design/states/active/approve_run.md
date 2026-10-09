# APPROVE_RUN
Show the cost of running the evals and record the user's decision. This is a human gate.
## Consumed context
context.harness, context.eval_design, context.grading, context.intake.
## Estimate
cases: how many cases will run, at most eval_design.cases.total_target.
grader_calls_per_case: the number of LLM graded criteria.
repeats: how many times each case runs.
total_calls = cases x (1 + grader_calls_per_case) x repeats.
cost_usd: your cost estimate from current published pricing. Say how you computed it.
## Ask the user
Approve or decline the run, the maximum spend max_cost_usd (at least cost_usd), and the NAME of the environment variable that holds the API key.
Never ask for the key itself. Never record it.
Verify the model identifiers again against a current source.
## Exit
RUN_APPROVED with p.approved: true and contextUpdates.run_approval:
```json
{ "approved": true,
  "estimate": { "cases": 100, "grader_calls_per_case": 1, "repeats": 1, "total_calls": 200, "cost_usd": 1.5 },
  "max_cost_usd": 3, "api_key_env": "ENV_VAR_NAME",
  "model_ids": { "under_test": "text", "graders": ["text"], "verified_on": "date", "verification_source": "text" },
  "revisions": { "criteria": 1, "eval_design": 1, "grading": 1 }, "owner": "text", "source": "text" }
```
RUN_DECLINED with contextUpdates.run_approval = { "approved": false, "owner": "text", "source": "text" }.
## Atomic Gate
No model API call has happened. The estimate arithmetic is exact.
