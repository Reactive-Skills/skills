---
name: product-manager
description: Bootloader - Verify reactive runtime
type: reactive
---

# product-manager - INIT

Verify access to the reactive runtime.

## Instructions
1. Prefer AXI CLI.
   Run `reactive-skills-axi state product-manager` to inspect this job, or `reactive-skills-axi invoke product-manager` to start a fresh isolated job.
2. If this is named or parallel work, choose a job ID and keep `--job <job-id>` on every `state` and `emit` command.
3. Use MCP tools only when shell access to AXI is unavailable.
4. If AXI or MCP runtime access works, emit `RUNTIME_READY`.
5. If neither path works, emit `SETUP_REQUIRED`.
