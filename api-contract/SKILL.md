---
name: api-contract
description: >-
  OpenAPI/Swagger spec vs client code drift detector — parses spec, walks fetch/axios calls, detects mismatches. Uses HSM statechart with composite validation phases and human-in-the-loop gate.
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
> - To start a new task, use selected runtime `invoke api-contract [--payload JSON]`.
> - To resume an active task, use selected runtime `state api-contract`.
> - For named or parallel work, keep the same `--job <alias>` flag on every command.
> - The runtime resolves aliases to immutable UUID-backed `run_id` values.
> - To advance state, use selected runtime `emit api-contract <signal>`.
>
> **SELECTED RUNTIME COMMANDS**
> Use selected MCP or AXI path for every state and signal command.
> First check `reactive_capabilities` when this MCP tool is available.
> Otherwise check `reactive-skills-axi capabilities --json`, then use direct AXI.
> Otherwise use `npx -y @reactive-skills/axi capabilities --json`, then use zero-install AXI.
> MCP uses `reactive_state` and `reactive_emit_signal`.
> Direct AXI uses `reactive-skills-axi state|emit api-contract`.
> Zero-install AXI uses `npx -y @reactive-skills/axi state|emit api-contract`.
> Emit `RUNTIME_READY` with `transport`, `launcher`, `runtime_version`, `axi_version`, `compatible`, and `capabilities`.
> Persist the selected runtime in `payload.contextUpdates` so later states reuse it.
> AXI remains the runtime interface. `npx` is only its zero-install launcher.
> Do not repeat version or capability checks after INIT.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run selected runtime `reset api-contract` or `invoke api-contract`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# api-contract Reactive Skill

## Overview

`api-contract` is a **workflow** type reactive skill that detects drift between an OpenAPI/Swagger specification and client-side code that consumes it. It parses the API spec, walks client fetch/axios calls, diffs endpoint coverage and type compatibility, and projects a structured drift report with fix recommendations.

## Lifecycle

```
DISCOVER_APIS → VALIDATION_PIPELINE → DRIFT_ANALYSIS → REPORT → GATE → COMPLETED / BLOCKED
```

The `VALIDATION_PIPELINE` composite state contains nested `SCHEMA_VALIDATION` (openapi check, type compatibility, breaking changes, example conformance) and `DRIFT_DIFFING` (client code walk + spec diff). The `REPORT` composite state generates a violation summary and fix recommendations. A human review `GATE` is the final approval checkpoint.

## Usage

```bash
# Read current state
npx -y @reactive-skills/axi state api-contract

# Start the skill (provide spec and client paths)
npx -y @reactive-skills/axi invoke api-contract \
  --payload '{"api_spec_path": "openapi.json", "client_code_paths": ["src/api/"]}'
```

## Deliverables

On completion, projected to `.docs/api-contract/`:
- `drift.md` — Full drift report with findings, severity, and fix recommendations
- `coverage.md` — Endpoint coverage matrix (spec ↔ client)
- `state.json` — Machine-readable state snapshot

## Middleware

This skill runs four middleware hooks:
- **telemetry** — Transition events to stdout
- **audit** — Immutable audit log at `.reactive/api-contract.audit.log`
- **invariant_checker** — Pre/post-transition context constraint validation
- **context_sanitizer** — Redacts secrets/credentials before LLM context binding

See `runtime/` for hook implementations and `runtime/hooks/invariants.yaml` for invariant rules.
