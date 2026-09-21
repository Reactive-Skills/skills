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
> **DEFAULT EXECUTION: AXI CLI**
> AXI is the default runtime path, even when MCP tools are present.
> - To start a new task: Run `reactive-skills-axi invoke ci-cd-automation [--payload JSON]`
> - To resume an active task: Run `reactive-skills-axi state ci-cd-automation`
> - For named or parallel work: Keep the same `--job <job-id>` flag on every command.
> - To advance state: Run `reactive-skills-axi emit ci-cd-automation <signal>`
>
> **FALLBACK EXECUTION: MCP**
> Use `reactive_state` and `reactive_emit_signal` only when shell access to AXI is unavailable.
> Do not troubleshoot MCP before trying AXI.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run `reactive-skills-axi reset ci-cd-automation` or `reactive-skills-axi invoke ci-cd-automation`.
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
