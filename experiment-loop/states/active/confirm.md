# CONFIRM
Perform one separate comparison of the preserved baseline and selected candidate on untouched confirmation cases.
Use the fixed evaluator, repeated paired samples, and reserved allowance.
Record confirmation.contract_id, revision, candidate_id, baseline and candidate measurements, and the computed outcome.
Update actual cumulative progress and emit CONFIRMATION_MEASURED.
If execution fails, dependency is missing, or interruption occurs, finalize with explicit limitations.
Never reuse these cases as untouched evidence after feedback or interruption.
## Atomic Gate
Confirmation is independent of selection and recorded once; no significance claim exceeds the analysis actually performed.
