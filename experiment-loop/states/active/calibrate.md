# CALIBRATE
Run the fixed evaluator against known good and bad reference outputs before trial execution.
Check that it rewards intended success and rejects the relevant failure modes.
For model judgments, inspect rubric agreement and human-labeled examples when available.
Record observed calibration bound to contract_id and revision, good_passed, bad_failed, and evidence_refs.
If calibration fails, diagnose the evaluator and revise the contract before proceeding.
Update progress with actual cumulative calibration time and cost.
Emit CALIBRATION_PASSED.
## Atomic Gate
Both contrasts were actually checked; simulation or prediction is labeled and cannot pass this gate.
