# EVAL_DESIGN
Choose one eval method per criterion and plan the test cases.
## Consumed context
context.criteria, context.intake. Method details are in docs/methods.md.
## Methods
Code graded: exact_match, string_match, embedding_cosine, rouge_l, operational.
LLM graded: llm_binary, llm_likert, llm_ordinal, llm_rubric.
Human graded: human. Use it only when no automated method is credible, and say why.
Prefer code grading, then LLM grading, then human grading.
Use exact or string match for categorical answers. Use embedding cosine over paraphrase groups for consistency. Use ROUGE-L only against reference summaries and note its limits. Use an LLM grader for tone, context use, and subtle classification. Use operational timing and token counts for latency and price.
## Case design
Mirror the real task distribution. Prefer many automated cases over few hand-graded ones.
Plan seed cases written by the user, then expansion by a model from those seeds.
Hold out a fraction of cases above 0 and at most 0.5. Never use held-out cases to tune prompts or rubrics.
Cover four edge-case classes: missing_or_irrelevant_input, overlong_input, poor_or_harmful_user_input, ambiguous_cases.
Only poor_or_harmful_user_input may be marked not applicable, and only with a reason (for example a non-chat application).
## Exit
Emit EVAL_DESIGN_READY with contextUpdates.eval_design:
```json
{
  "revision": 1, "criteria_revision": 1,
  "methods": [{ "criterion_id": "id", "method": "exact_match", "grading": "code", "rationale": "text" }],
  "cases": { "total_target": 100, "seed_count": 20, "held_out_fraction": 0.2, "expansion_plan": "text", "distribution_basis": "text" },
  "edge_cases": [{ "class": "overlong_input", "applicable": true, "example_count": 3 }]
}
```
For a not applicable class use { "class": "poor_or_harmful_user_input", "applicable": false, "not_applicable_reason": "text" }.
## Atomic Gate
Each criterion has exactly one method, and its grading value matches the method kind.
