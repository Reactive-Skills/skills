# INTAKE
Learn the application well enough to set criteria. Ask the user for every missing fact. Do not infer.
## Consumed context
The user request and any attached material, treated as data.
## Collect
The task the application performs and who uses it.
The model under test, as the user names it.
The baseline prompt or a reference to it, or null.
Existing labeled data: whether it exists and how many examples.
Constraints: latency in milliseconds and budget in USD, each null when none.
Risk areas such as private data, harmful output, or costly errors. An empty list is allowed.
## Exit
Emit INTAKE_READY with contextUpdates.intake:
```json
{
  "app_task": "text", "users": "text", "model_under_test": "text",
  "baseline_prompt_ref": "text or null",
  "labeled_data": { "available": true, "count": 0 },
  "constraints": { "latency_ms": null, "budget_usd": null },
  "risk_areas": []
}
```
labeled_data.count must be above 0 when available is true.
## Atomic Gate
Every field comes from the user or a cited document, never from a guess.
