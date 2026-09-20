# INIT State

## Goal
Verify that the host agent harness is connected to the reactive runtime environment.

## Instructions
1. Prefer AXI CLI.
2. Run `reactive-skills-axi state resume-manager` to inspect this job, or `reactive-skills-axi invoke resume-manager` to start a fresh isolated job.
3. If this is named or parallel work, keep `--job <job-id>` on every `state` and `emit` command.
4. Use MCP tools only when shell access to AXI is unavailable.
5. If AXI or MCP runtime access works, emit `RUNTIME_READY`.
6. If neither path works, emit `SETUP_REQUIRED`.

## Atomic Checklist
- [ ] Runtime execution capability confirmed.
- [ ] No bypass attempted.
- [ ] Signal emitted cleanly.

## Signal
Emit: `RUNTIME_READY` or `SETUP_REQUIRED`
