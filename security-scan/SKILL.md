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
> **DEFAULT EXECUTION: AXI CLI**
> AXI is the default runtime path, even when MCP tools are present.
> - To start a new task: Run `reactive-skills-axi invoke security-scan [--payload JSON]`
> - To resume an active task: Run `reactive-skills-axi state security-scan`
> - For named or parallel work: Keep the same `--job <job-id>` flag on every command.
> - To advance state: Run `reactive-skills-axi emit security-scan <signal>`
>
> **FALLBACK EXECUTION: MCP**
> Use `reactive_state` and `reactive_emit_signal` only when shell access to AXI is unavailable.
> Do not troubleshoot MCP before trying AXI.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run `reactive-skills-axi reset security-scan` or `reactive-skills-axi invoke security-scan`.
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
