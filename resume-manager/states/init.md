# INIT State

## Goal
Verify that the host agent harness is connected to the reactive runtime environment.

Require runtime 0.20.0 or newer with `evidence.local_registry`, `evidence.reference_submission`, `judgment.context_paths`, and `judgment.probability_thresholds`.
Run preflight for this skill before invocation; stop if incompatible. Never drop evidence fields to proceed.

## Instructions
1. Check `reactive_capabilities` when the MCP tool is available.
2. Otherwise check `reactive-skills-axi capabilities --json`, then `npx -y @reactive-skills/axi capabilities --json`.
3. Select the compatible local MCP or AXI runtime, keep the same `--job <job-id>` for named or parallel work, and persist the selection for this run.
4. If runtime access works, emit `RUNTIME_READY` with transport, launcher, versions, compatibility, and capabilities.
5. If no compatible runtime works, emit `SETUP_REQUIRED`.

## Atomic Checklist
- [ ] Runtime execution capability confirmed.
- [ ] No bypass attempted.
- [ ] Signal emitted cleanly.

## Signal
Emit: `RUNTIME_READY` or `SETUP_REQUIRED`
