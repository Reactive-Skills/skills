# CRITERIA
Turn the intake into specific, measurable, achievable, and relevant success criteria.
Most applications need several dimensions, not one score.
## Consumed context
context.intake. On a revision, the prior context.criteria and the user's change request.
## Dimensions
task_fidelity, consistency, relevance_coherence, tone_style, privacy, context_utilization, latency, price, custom.
Choose only the dimensions that matter for this application. Say why the others do not.
## For each criterion record
id, dimension, metric, threshold (a number), comparator (">=" or "<="), population (the dataset or sample the number applies to), target_source ("benchmark", "baseline", or "expert"), source_ref (where the target comes from), fuzzy_terms, definitions, and includes_negative_cases.
Every fuzzy term such as "egregious" or "toxic" needs a definition with the same term and a meaning.
A privacy criterion must set includes_negative_cases: true so the eval also scores cases that hold no sensitive data. This measures over-refusal.
A target must be achievable for current frontier models. Cite the benchmark, baseline, or expert behind it.
Bad: "classify sentiment well". Good: "F1 at least 0.85 on a held-out set of labeled posts, 5 percent above the current baseline".
## Exit
Emit CRITERIA_READY with contextUpdates.criteria = { revision, items: [...] }.
revision is 1 on the first pass and the previous revision plus 1 on every later pass.
## Atomic Gate
Every threshold is numeric, bound to a population, and traced to a source.
