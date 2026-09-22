---
name: ci-cd-automation
description: >-
  Automated CI/CD pipeline generator and linter that scaffolds production-ready workflows with caching, matrix builds, and security gates.
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
> - To start a new task, use selected runtime `invoke ci-cd-automation [--payload JSON]`.
> - To resume an active task, use selected runtime `state ci-cd-automation`.
> - For named or parallel work, keep the same `--job <alias>` flag on every command.
> - The runtime resolves aliases to immutable UUID-backed `run_id` values.
> - To advance state, use selected runtime `emit ci-cd-automation <signal>`.
>
> **SELECTED RUNTIME COMMANDS**
> Use selected MCP or AXI path for every state and signal command.
> First check `reactive_capabilities` when this MCP tool is available.
> Otherwise check `reactive-skills-axi capabilities --json`, then use direct AXI.
> Otherwise use `npx -y @reactive-skills/axi capabilities --json`, then use zero-install AXI.
> MCP uses `reactive_state` and `reactive_emit_signal`.
> Direct AXI uses `reactive-skills-axi state|emit ci-cd-automation`.
> Zero-install AXI uses `npx -y @reactive-skills/axi state|emit ci-cd-automation`.
> Emit `RUNTIME_READY` with `transport`, `launcher`, `runtime_version`, `axi_version`, `compatible`, and `capabilities`.
> Persist the selected runtime in `payload.contextUpdates` so later states reuse it.
> AXI remains the runtime interface. `npx` is only its zero-install launcher.
> Do not repeat version or capability checks after INIT.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run selected runtime `reset ci-cd-automation` or `invoke ci-cd-automation`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# CI/CD Automation

`ci-cd-automation` scaffolds and verifies production-ready CI/CD workflows for GitHub Actions and GitLab CI. It inspects repository package manifests, configures optimal dependency caching, enforces least-privilege token permissions, and performs pre-deployment security audits.

## Workflow

`INTAKE -> DETECT_STACK -> GENERATE_PIPELINE -> LINT_WORKFLOW -> SECURITY_AUDIT -> GATE -> SUCCESS`

Failures terminate in `ERROR`; syntax or security violations terminate in `BLOCKED`.

## Usage

```bash
npx -y @reactive-skills/axi invoke ci-cd-automation --payload '{"provider":"github-actions","test_command":"npm test","build_command":"npm run build"}'
```

## Deliverables

Generated workflows land under `.github/workflows/` with auditing summaries projected into `.docs/ci-cd-automation/`.
