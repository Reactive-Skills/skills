---
name: security-scan
description: >-
  Pre-commit secret and credential scanner with remediation checklist. Scans staged git changes for API keys, tokens, private keys, hardcoded credentials, and insecure defaults. Blocks commit on critical findings.
metadata:
  author: Reactive-Skills
  version: "1.0.0"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> **REACTIVE SKILL: STRICT RUNTIME EXECUTION**
> This skill is an event-driven state machine. Manual execution is forbidden.
>
> **LOCAL-FIRST RUNTIME SELECTION**
> Select one compatible runtime during INIT, then reuse it for the full run.
> - To start a new task, use selected runtime `invoke security-scan [--payload JSON]`.
> - To resume an active task, use selected runtime `state security-scan`.
> - For named or parallel work, keep the same `--job <alias>` flag on every command.
> - The runtime resolves aliases to immutable UUID-backed `run_id` values.
> - To advance state, use selected runtime `emit security-scan <signal>`.
>
> **SELECTED RUNTIME COMMANDS**
> Use selected MCP or AXI path for every state and signal command.
> First check `reactive_capabilities` when this MCP tool is available.
> Otherwise check `reactive-skills-axi capabilities --json`, then use direct AXI.
> Otherwise use `npx -y @reactive-skills/axi capabilities --json`, then use zero-install AXI.
> MCP uses `reactive_state` and `reactive_emit_signal`.
> Direct AXI uses `reactive-skills-axi state|emit security-scan`.
> Zero-install AXI uses `npx -y @reactive-skills/axi state|emit security-scan`.
> Emit `RUNTIME_READY` with `transport`, `launcher`, `runtime_version`, `axi_version`, `compatible`, and `capabilities`.
> Persist the selected runtime in `payload.contextUpdates` so later states reuse it.
> AXI remains the runtime interface. `npx` is only its zero-install launcher.
> Do not repeat version or capability checks after INIT.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run selected runtime `reset security-scan` or `invoke security-scan`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# security-scan Reactive Skill

## Overview

`security-scan` is a **workflow** type reactive skill that scans git-staged changes for secrets, credentials, and insecure configurations before commit. It uses regex pattern matching and entropy heuristics to detect high-signal security violations.

## Lifecycle

```
COLLECT_STAGED → SCAN_PIPELINE → REPORT → GATE → COMPLETED / BLOCKED / ERROR
```

`SCAN_PIPELINE` is a composite state with three sequential scan sub-states: `SECRETS_SCAN` (API keys, tokens, private keys), `CREDENTIALS_SCAN` (hardcoded passwords/credentials), and `CONFIG_SCAN` (insecure defaults, debug mode). Critical secrets found in any scan bubble up to `BLOCKED` via the `CRITICAL_SECRET_FOUND` event. `REPORT` is a composite state that generates a violation summary and remediation checklist. The `GATE` human review is the sole HITL checkpoint.

## Usage

```bash
# Read current state
npx -y @reactive-skills/axi state security-scan

# Start the skill (scans all staged files by default)
npx -y @reactive-skills/axi invoke security-scan
```

## Safety

This skill includes a mandatory `context_sanitizer` middleware hook that redacts secrets before any context is bound to the LLM. Patterns matched include `*_TOKEN`, `*_KEY`, `*_SECRET`, `*_PASSWORD`, `api_key`, `bearer`, `password`, `private_key`, and `-----BEGIN PRIVATE KEY`.
