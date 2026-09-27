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
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "api-contract"`.
> - AXI: run `reactive-skills-axi bootloader api-contract --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader api-contract --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
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
