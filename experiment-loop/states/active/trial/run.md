# RUN
Run the proposed artifact under the fixed evaluator and environment, within the reserved timeout and cost allowance.
Use selection cases and the same paired sample keys as the incumbent.
Retain actual outputs, crucial checks, timing, cost, and evidence references.
Update progress.trials by one and actual cumulative seconds and cost.
Emit TRIAL_MEASURED with an observed measurement, TRIAL_FAILED for execution failure, or TRIAL_INVALID for unusable evidence.
Never relabel predictions, simulations, missing data, or substituted evaluator results as measurements.
## Atomic Gate
The run is reconciled exactly once, and its evidence is bound to the proposal and contract revision.
