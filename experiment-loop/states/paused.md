# PAUSED
Reopen the same named job and verify run identity, ledger, current artifacts, and pending external actions.
Reconcile actual timing and cost; an interrupted trial counts once before returning to search.
Record pause.reconciled: true and evidence_refs without changing its recorded recovery phase.
Update monotonic progress and emit the matching RESUME_INTAKE, RESUME_CONTRACT, RESUME_CALIBRATION, RESUME_BASELINE, RESUME_SEARCH, or RESUME_FINALIZE.
Interrupted confirmation always returns to finalization, never to another supposedly untouched comparison.
Emit CANCEL or DEPENDENCY_FAILED if recovery cannot continue.
## Atomic Gate
No external action repeats merely because the process restarted; recovered records match the same job and revision.
