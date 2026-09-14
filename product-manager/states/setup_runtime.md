# SETUP_RUNTIME State

## Goal
Auto-configure the `@reactive-skills/axi` harness if the reactive runtime environment is not initially configured.

## Tools
- `run_command`

## Instructions
1. Check if Node.js (>= 22.5.0) and npm are accessible in PATH.
2. Verify if `@reactive-skills/axi` can be reached via `npx -y @reactive-skills/axi --version`.
3. If the command succeeds (exit code 0):
   - Emit signal `SETUP_COMPLETE` with payload `{ exit_code: 0 }`.
4. If the command fails or Node is missing:
   - Emit signal `SETUP_FAILED` with payload `{ exit_code: 1, reason: "<error details>" }`.

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Ran the verification command through `run_command`.
- [ ] Confirmed exit code status without assuming success.
- [ ] Captured error details in payload if setup failed.

## Stop Criteria
Configuration verified. Emit `SETUP_COMPLETE` on success or `SETUP_FAILED` on failure.

## Signals
- `SETUP_COMPLETE` (guard: `payload.exit_code == 0`)
- `SETUP_FAILED` (guard: `payload.exit_code != 0`)
