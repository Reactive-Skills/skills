# Baseline on the fixed creation runtime

Status: COMPLETE; coverage PASS, with five understood critical failures.
The user approved PLAN-005's creation-help fix and fresh 24-trial baseline.
This checkpoint uses the same frozen skill-manager 1.1.0 bytes, task specification, scenario fixtures, approval script, and executor profile as the original diagnostic baseline.
The runtime build differs, so comparisons must use this checkpoint for the later portable and guidance candidates.
The original failed and NOT_RUN records remain preserved.

## Fixed inputs

- Manager bundle: be9b7704b15d1085df92fbcf0e67142414ede266774b7df40ca52d9a04992f06.
- Runtime build: sha256:13311a43e5a7bbd4fb3d3c916d2253c95345e39fd459ce20e2cdb26afcbdda01.
- Executor: gpt-6.1-sol, xhigh reasoning, Codex CLI 0.159.3, Windows PowerShell.
- Isolation: workspace-write, synthetic tool home and registry, temporary-directory exceptions disabled.
- Matrix: four scenarios, two arms, three fresh repetitions per arm.

Runtime build inventory and verification are recorded in [runtime-help-safe.json](evidence/runtime-help-safe.json).
Original sandbox boundary evidence is retained in [isolation-preflight.json](evidence/isolation-preflight.json).
Each completed trial independently verifies actual executor metadata, runtime registry resolution, immutable bundle/build digests, task artifacts, command history, approval order, and applicable runtime assertions.
Token counts use actual final cumulative session usage; they are not estimated from words.

## Collection

Three isolated CLI executors completed the matrix concurrently.
Intermediate .trial.json files are raw evidence awaiting review, not passing results.
Reviewed .result.json files retain each observable assertion and point to sanitized evidence.
All 24 trials received independent assertion review; the coverage gate passes.
No candidate quality improvement or adoption is claimed by baseline completion.
Supplemental desktop checks remain separate and NOT_RUN.

## Reviewed progress

24 of 24 trials independently reviewed: 19 PASS and 5 FAIL.
All 12 no-skill trials passed; 7 of 12 with-skill trials passed.
All five failures created extra manager jobs through inspection or state queries before or after the named invocation.
PLAN-003 already addresses this with read-only preflight, one named invocation, and consistent job identity afterward.
Every reviewed task-scope, approval, prerequisite, reference-policy, and topology assertion passed.
Independent constructor-based runtime proofs passed for all six created skills.
The failures are understood and fall within approved PLAN-003 startup guidance; preserve them in every comparison.
Candidate adoption remains gated on complete comparable evidence with every candidate critical assertion passing.

One reviewer explanation mislabeled the seven RED question topics; [the correction](evidence/baseline-review-corrections.json) records their actual wording and unchanged PASS outcome.
The original artifact contains all seven supplied answers, and original result/evidence bytes remain preserved.
