# RUN
This parent enforces order: CALIBRATE first, then SCORE. SCORE is unreachable without a passed calibration.
## Invariants for both children
Stay within run_approval.estimate.total_calls and run_approval.max_cost_usd.
If a limit would be exceeded, stop and emit DEPENDENCY_FAILED with a reason.
Read the API key only from the environment variable named in run_approval.api_key_env.
Never print or record it.
Cancellation and dependency failure bubble to the ACTIVE parent.
