# TRIAL
Development cases support diagnosis; selection cases guide exploratory candidate choice.
Check actual progress against all approved budget limits before another trial.
When a retained candidate exists and confirmation fits, emit SEARCH_FINISHED with stop.kind: selected, reason, and consumed_confirmation_cases extended by the current confirmation identifiers.
Without a retained improvement, emit NO_CANDIDATE with stop.kind: no_improvement.
If more work cannot fit, emit BUDGET_EXHAUSTED with stop.kind: budget.
Finish any pending assessment before selecting a winner.
## Atomic Gate
Repeated selection feedback is exploratory; confirmation cases remain unused and unavailable to candidate construction.
