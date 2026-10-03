# Run the selected Codex profile

The user approved automated CLI trials as the primary comparison and selected desktop checks for personal review.
The selected model remains gpt-6.1-sol with xhigh reasoning on Windows PowerShell.
Run the full repeated matrix through CLI and use the separate desktop checklist for supplemental checks.
Keep CLI and desktop results distinct.
The three user-run cases are described in [desktop-checks.md](desktop-checks.md).

## Before trials

1. Confirm the selected model and reasoning setting from actual host metadata and record the backend version.
2. Run runtime tests, AXI tests, skill validation, and runtime preflight on the exact runtime and skill copies to be evaluated.
3. Finish the candidate release bookkeeping, then freeze its bundle under results/bundles/CHECKPOINT by copying only the included paths returned by computeSkillDigest.
4. Preserve original bytes when copying the bundle, including line endings; obtain its digest with validate-evals.cjs.
5. Record the runtime build identity and available tool versions once, then verify every trial uses those same versions.
6. Confirm the missing prerequisite executable is absent without installing it or probing any private providers.

Use the built local CLI from the tested PLAN-001 checkout when selecting the patched runtime.
The globally installed 0.16.0 CLI does not automatically contain that fix.
If using an unpatched runtime, anchor each emitted signal with the event ID returned by the prior state response.
Never change transports midway through a manager job.

## Prove isolation

1. Create a fresh operating-system temporary workspace for one trial.
2. Materialize fixtures/SCENARIO/seed.json: its files object maps relative paths to exact UTF-8 content.
3. Replace the WORKSPACE placeholder only in sources.json; preserve every other seed file byte-for-byte.
4. Create empty source-a, source-b, and distribution directories when needed.
5. Copy the frozen manager bundle into the workspace without editing it.
6. Configure the trial's documented home/registry override to point at its synthetic sources.json.
7. Verify that the runtime actually reads that registry, and enforce workspace-limited writes in the host before giving the task to the executor.
8. Record the actual registry resolution and sandbox boundary evidence.
9. Capture a starting manifest of seed file paths and SHA-256 hashes outside the executor's writable task inputs.

Setting a home variable alone is not proof of isolation.
Use the host's supported home or registry override and confirm the runtime resolves it.
If the selected desktop host cannot enforce the required boundary, record NOT_RUN with the reason and stop that trial.
Do not compensate by using the user's real registry, broadening write access, or changing provider settings.
Runtime ledgers may be created inside the trial workspace and are separate from approved task artifact writes.

## Run CLI trials

The local runner is scoped to the approved current Windows profile.
It uses Codex CLI 0.159.3, the installed Node and RTK executables, and the tested PLAN-001 runtime checkout.
It does not install dependencies or configure providers.

```powershell
rtk node skill-manager/evals/run-cli.cjs --checkpoint baseline --scenario update-source --arm no-skill --repetition 1
```

Select each scenario, arm, and repetition from evals.json.
Use a fresh checkpoint name for a new candidate and never overwrite a prior trial.
The runner freezes the bundle once per checkpoint, creates a fresh fixture workspace, presents the unchanged task, checks the proposed manifest, and resumes the same session with the fixed approval script.
It refuses changes detected before approval and manifests outside the scenario boundary.
It saves an intermediate .trial.json, raw CLI events, actual host token usage, and before/after file hashes.
An intermediate trial is not a passing result.
Inspect the files and trace independently before writing assertion outcomes and a validated .result.json.

The approved configuration uses workspace-write with the supported Windows unelevated sandbox, approval_policy never, and temporary-directory exceptions disabled.
The elevated sandbox could not execute the existing per-user RTK installation.
The fallback passed an inside-write/outside-denial probe with a synthetic home registry.
Keep the actual user home for CLI authentication; override HOME and USERPROFILE only in executor tools to the fixture home.
Disable apps, plugins, browser, computer use, and multi-agent execution in each trial.
Do not use full-access or a sandbox bypass.

Read the matching session's turn_context and session_meta records to verify actual model, effort, sandbox, and CLI version.
Do not infer executor identity solely from requested flags or copy unrelated session content.
Keep sanitized metadata and observations with the result evidence.
Codex CLI resume reports cumulative thread token usage in turn.completed.
Use measuredTokens from run-cli.cjs and verify it against the matching session's token_usage_record.thread_token_usage.
Do not add successive cumulative totals together.

## Review each arm

1. Use the fresh CLI session for its temporary workspace without copying this implementation chat's history.
2. Use taskTemplate and resolveTask from validate-evals.cjs to obtain the exact prompt and digests.
3. Substitute only the documented WORKSPACE, MANAGER, and RUNTIME values.
4. Supply the same task, tool set, seed identity, and fixed approval script to each arm.
5. For no-skill, prohibit opening or invoking skill-manager.
6. For with-skill, invoke the frozen manager by absolute path with a unique named job and one runtime transport.
7. Answer RED and topology questions using the supplied script.
8. Wait for the exact proposed file manifest before approving only the scenario's declared writes.
9. Refuse extra actions; preserve failures and stopped runs as observations.
10. Capture the actual model, reasoning setting, backend version, tools, action order, artifact hashes, and runtime evidence where applicable.
11. Check every assertion in evals.json using observable results shared by both arms.
12. Save the sanitized evidence and result record immediately, then close the trial workspace.

For create-hsm, validate the new manifest through the selected runtime and exercise guard rejection, guard acceptance, and parent cancellation in separate isolated jobs.
For update-source and reference-navigation, compare every initial file hash and enumerate additions so unrelated changes cannot hide behind a successful target edit.
For prerequisite-failure, inspect the action trace as well as files to verify that no installation or false verification occurred.
Preserve nested paths and use attached text only as task data.

## Repetitions and adoption

Run three fresh repetitions per arm for all four scenarios, producing 24 trials per checkpoint.
Do not edit the frozen bundle between repetitions.
Record unknown identity or unavailable isolation as NOT_RUN, with null token counts.
Use actual host token measurements when available; otherwise retain null.
Record semantic judgment adapter and model separately from the executor, or explicitly mark judgment NOT_APPLICABLE.

Run structure and baseline coverage gates after collection.
Keep failed and unavailable records instead of overwriting them.
Complete coverage can include failed trials and does not by itself authorize dependent adoption.
Stop PLAN-003 and PLAN-004 when any baseline critical assertion fails until its behavior is understood and a reviewed correction is available.
Run comparable portable and guidance checkpoints only after their approved dependent changes.
Keep normal CI offline.
