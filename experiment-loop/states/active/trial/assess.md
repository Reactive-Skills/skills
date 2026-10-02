# ASSESS
Compare paired repeated samples using the contract's direction and practical margin.
Use guards/policy.cjs compare: all paired differences must favor the candidate and the mean must meet the margin.
A crucial failure overrides aggregate improvement.
Classify improved, worse, inconclusive, invalid, or failed.
Append history with candidate_id, outcome, and evidence_refs; record assessment.outcome.
Only for improved, update incumbent to the proposal and exact trial measurement.
Emit CANDIDATE_ACCEPTED or CANDIDATE_REJECTED.
## Atomic Gate
Inconclusive or invalid evidence never changes the incumbent; this conservative screen does not establish statistical significance.
