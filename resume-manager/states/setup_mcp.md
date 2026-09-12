# SETUP_MCP State

## Context
The host agent harness requires configuration to connect to the `@reactive-skills/axi` MCP server.

## Realistic Constraints
- Execute the harness configuration command to register `@reactive-skills/axi`.
- Must check exit code: 0 indicates success, non-zero indicates failure.

## Instructions
1. Run configuration command to attach the MCP server to the host harness.
2. If command succeeds with exit code 0, emit `SETUP_COMPLETE` with payload `{"exit_code": 0}`.
3. If command fails with non-zero exit code, emit `SETUP_FAILED` with payload `{"exit_code": 1}`.

## Atomic Verification Checklist
- [CRUCIAL] Exit code explicitly evaluated.
- [CRUCIAL] Payload contains integer exit code.
- [IMPORTANT] Diagnostic message provided if setup fails.

## Signal
Emit: `SETUP_COMPLETE` (exit_code == 0) or `SETUP_FAILED` (exit_code != 0)
