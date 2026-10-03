# State guidance comparison

Status: COMPARISON PASS; source-aware sync incomplete because the sync engine omitted the bundled scripts directory.
Progress: 24 of 24 independently reviewed trials PASS, zero FAIL, zero active.
Release: 1.3.0.
Digest: 6e10534d0dff717590ac320cfe0660a39bad9ace8034d361650b824be26de9b3.

The portable-hsm prerequisite passed 24/24 trials and comparison against baseline-help-safe.
This approved candidate revises planning, execution, and verification around state-specific objectives, consumed context, actions, observable exits, and actual signals.
Eighty reviewed invariants are recorded in the source state-contracts.json.
Raw source words changed from 964/1047/1169 to 605/655/758.
Rendered words and state-level host tokens remain unmeasured; budgets are provisional.
No task-quality or token improvement is established by those source counts.

[Scope evidence](evidence/guidance-scope.json) proves unchanged topology, schema, guards, bootloader, runtime, specification, tools and models.
[Preflight evidence](evidence/guidance-preflight.json) records 75 passing offline tests and the frozen identity.
The unchanged 24-trial matrix passed every critical assertion and both [baseline comparisons](evidence/guidance-comparison.json).
Preserve every failure and unavailable trial; do not edit the frozen candidate or selectively replace a behavioral failure.
All 75 offline tests and static/release checks passed.
Sync returned no errors, but independent destination digest verification found scripts/authoring-quality.cjs missing.
PLAN-007 contains the reproduced distribution fix, pending approval; deployment is not complete.
Three fresh [Desktop checks](desktop-guidance/index.json) remain supplemental and NOT_RUN.
