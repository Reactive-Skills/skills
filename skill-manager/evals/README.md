# Skill-manager behavioral evaluations

This package distinguishes offline evidence validation from measured task quality.
The primary repeated coverage is one selected profile: Codex CLI, gpt-6.1-sol, xhigh reasoning, Windows PowerShell.
The user approved supplemental desktop edge cases for source selection, approval boundaries, and misleading attachments.
Those checks are reported separately and do not imply complete desktop comparison coverage.
Use [the desktop checklist](desktop-checks.md) for those three cases.
The reviewed fixed-runtime baseline is complete: 19 PASS and five understood manager-job failures.
See [baseline status](results/baseline-help-safe-status.md), [preserved portable comparison](results/portable-status.md), and [output-path correction status](results/portable-paths-status.md).
The final guidance 1.3.0 checkpoint passed all 24 independently reviewed trials.
Both comparisons passed, against baseline-help-safe and portable-hsm.
See [comparison evidence](results/evidence/guidance-comparison.json) and [static checks](results/evidence/guidance-final-static-checks.json).
All 75 offline checks passed.
The three Desktop cases remain NOT_RUN; their fixture handoff does not establish Desktop coverage.
Other models have no claimed coverage.

## Contents

- [Scenarios](#scenarios)
- [Commands and gates](#commands-and-gates)
- [Identities and digests](#identities-and-digests)
- [Result records](#result-records)
- [Evidence](#evidence)
- [Checkpoints](#checkpoints)

## Scenarios

[evals.json](evals.json) is the exact task and approval specification.
Each fixture directory contains a seed.json mapping workspace-relative paths to exact file contents.
The seeds contain only synthetic data.

| Scenario | Observable outcome |
|---|---|
| create-hsm | Requested nested report skill, guarded exit, parent cancellation, matching diagram, seven RED answers |
| update-source | One approved source-A prompt changes; every other seed file stays byte-identical |
| prerequisite-failure | Missing executable named precisely; no installation, writes, or false success |
| reference-navigation | Planted reporting rule found; nested layout preserved; attached instructions do not authorize extra writes |

Every scenario runs three times per arm in fresh equivalent workspaces.
The no-skill arm must not open or invoke skill-manager.
Runtime-only assertions are NOT_APPLICABLE for that arm; shared task assertions remain identical.
The with-skill arm uses one frozen manager bundle, named runtime job, and selected transport.
Follow [run-codex.md](run-codex.md) before collecting evidence.

## Commands and gates

Run from the registered skills source root:

```powershell
rtk node --test skill-manager/tests/evals.test.cjs skill-manager/tests/run-cli.test.cjs
rtk node skill-manager/evals/validate-evals.cjs --mode structure --json
rtk node skill-manager/evals/validate-evals.cjs --mode coverage --checkpoint baseline-help-safe --json
rtk node skill-manager/evals/validate-evals.cjs --mode compare --baseline baseline-help-safe --candidate guidance --json
rtk node skill-manager/evals/validate-evals.cjs --mode digest --skill-root ./skill-manager --json
```

Node exits 0 for a passed gate, 1 for invalid records or a measured comparison failure, and 2 for missing coverage or required inputs.
Some command wrappers normalize nonzero exit codes; read the JSON exit_code field when using one.
Structure PASS does not imply measured quality.
Coverage requires 24 completed trials for each checkpoint; a FAIL is completed evidence, while NOT_RUN remains incomplete.
Comparison requires complete comparable checkpoints, all candidate critical assertions passing, and no reduction in successful tasks for either arm.
Compare runtime build identity, tool availability and versions, and actual executor metadata across checkpoints.
Keep dependent adoption gated until baseline failures are understood and the approved candidate passes its critical assertions.
Ordinary CI runs only Node tests and structural evidence validation, without providers or live model calls.

## Identities and digests

computeSkillDigest hashes regular files in states, guards, templates, scripts, references, and assets, plus skill.yaml or skill.yml, SKILL.md, README.md, CONTEXT.md, and STATECHART.md when present.
Sort forward-slash relative paths lexically; hash each UTF-8 path, NUL, unmodified bytes, and NUL using SHA-256.
The returned manifest identifies included paths and file count.
Result records, evals, tests, ledgers, projections, dependencies, and Git data are excluded.
Canonical path checks reject traversal and links escaping the bundle root.
Freeze copies under results/bundles/CHECKPOINT before trials, then never edit them.
The validator recomputes their digests and checks their release versions.

Fixture digests use the same path-and-byte algorithm over each fixture directory.
The specification digest hashes canonical JSON with recursively sorted object keys and preserved array order.
task_template_digest hashes taskTemplate(spec, scenario), including shared constraints and the fixed decision script.
resolved_task_digest hashes resolveTask(spec, scenario, arm, substitutions), including the declared arm instruction and final task action.
Only WORKSPACE, MANAGER, and RUNTIME substitutions are permitted.
Use the exported functions from validate-evals.cjs to produce these identities.
Do not approximate hashes, token counts, or model identities.

## Result records

Save each trial as results/CHECKPOINT/TRIAL.result.json.
These are measured records, not templates for inventing outcomes.
The unit tests generate synthetic records only inside temporary directories; they are never baseline evidence.

| Field | Required content |
|---|---|
| schema_version, id | 1 and unique stable trial identifier |
| checkpoint, profile_id, scenario_id, repetition, arm | Checkpoint label, selected IDs, 1 through 3, no-skill or with-skill |
| status, reason, timestamp | PASS, FAIL, or NOT_RUN; reason for unavailable trials; actual ISO timestamp |
| executor | Actual model, reasoning_effort, harness, version, and platform from host metadata |
| runtime | Actual version and exact build identity used by the trial |
| skill | Release version, digest, and eval-root-relative bundle_path of the frozen copy |
| spec_digest, fixture_digest | Exact specification and seed identities |
| task_template_digest, resolved_task_digest | Shared task and actual resolved prompt identities |
| tools | Array of name, version, and boolean available for each declared tool |
| approval_decisions | Fixed decision script's decision list, applied by the operator |
| assertions | Exactly one id/status/reason result for each scenario assertion |
| judgment | NOT_APPLICABLE with reason, or MEASURED with actual adapter and model |
| tokens | null, or integer input/output counts, measurement set to host, and host measurement source |
| evidence | path under results/evidence and SHA-256 digest of its exact bytes |

Each completed assertion is PASS or FAIL.
Only no-skill runtime assertions may be NOT_APPLICABLE.
NOT_RUN trials require all applicable assertions to be NOT_RUN, a reason, and null token counts; executor identity may be unavailable.
Never label unavailable execution or estimated token use as measured success.
Preserve failed attempts and unavailable trials; do not replace them with successful reruns.
Any rerun requires a separately identified checkpoint and an explicit explanation.

## Evidence

Save sanitized evidence as results/evidence/TRIAL.json.
It contains record_id, executor, executor_metadata_source, substitutions, resolved_task, isolation with verified and method fields, and observations.
Include matching tokens evidence when the record reports measured token counts.
executor_metadata_source identifies the actual host session metadata used to establish model, reasoning setting, and backend version.
Each observation contains assertion_id, PASS or FAIL status, and a concrete detail such as a file hash comparison, checked transition, exact output, or approval chronology.
Record the actual approval exchange and its position relative to writes in the approval observation.
Record how the host enforces workspace write limits and how the runtime resolves the isolated registry in the isolation method.
Artifact-only claims do not prove that writes occurred after approval; retain the relevant sanitized action order.
The validator checks record consistency and evidence presence; the operator remains responsible for truthful observations and identity capture.
Keep private transcripts, user data, credentials, and environment dumps out of this directory.

## Checkpoints

Baseline precedes portable helper and prompt changes.
Portable follows PLAN-003 and must compare successfully with baseline.
Guidance follows PLAN-004 and must compare successfully with both baseline and portable.
Complete documentation and version bookkeeping before freezing each candidate.
Changing an evaluated bundle after collection invalidates its digest.
Changes to tools, runtime, tasks, or the selected host require new comparable evidence.
