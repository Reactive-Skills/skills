# FINALIZE
Assemble the outcome. The runtime generates the plan and report projections from the recorded context.
## Consumed context
All context records and context.stop.
## Choose the outcome
plan_only: plan approved with exit plan_only. No harness.
run_declined: harness built, run declined.
run_scored: calibration passed and results recorded.
cancelled: context.stop.kind is "cancelled".
blocked: context.stop.kind is "blocked". Use REPORT_BLOCKED.
## Exit
Emit REPORT_READY, or REPORT_BLOCKED for the blocked outcome, with contextUpdates.report:
```json
{ "outcome": "plan_only", "summary": "text", "claims_measured": false,
  "evidence_refs": [], "limitations": ["text"] }
```
claims_measured is true only for run_scored, and then evidence_refs is not empty.
limitations is never empty. Say what was not measured, such as held-out coverage, grader limits, or synthetic data.
## Atomic Gate
The report states only what the recorded records support.
