---
name: pr-triage
description: >-
  Pull request triage workflow that collects PR metadata, classifies risk and ownership, assesses readiness, routes work, and pauses at a human disposition gate.
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
> - To start a new task: Run `reactive-skills-axi invoke pr-triage [--payload JSON]`
> - To resume an active task: Run `reactive-skills-axi state pr-triage`
> - For named or parallel work: Keep the same `--job <job-id>` flag on every command.
> - To advance state: Run `reactive-skills-axi emit pr-triage <signal>`
>
> **FALLBACK EXECUTION: MCP**
> Use `reactive_state` and `reactive_emit_signal` only when shell access to AXI is unavailable.
> Do not troubleshoot MCP before trying AXI.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run `reactive-skills-axi reset pr-triage` or `reactive-skills-axi invoke pr-triage`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# PR Triage

`pr-triage` turns a pull request batch into an auditable triage plan. It collects metadata, checks, reviews, diffs, and ownership signals; classifies risk and size; assesses readiness against policy; routes each PR to an owner or reviewer; and pauses for human disposition.

## Workflow

`INTAKE -> COLLECT -> CLASSIFY -> ASSESS -> ROUTE -> REVIEW -> SUCCESS`

Failures terminate in `ERROR`; a blocked disposition terminates in `BLOCKED`; rework returns to `ASSESS`.

## Usage

```bash
npx -y @reactive-skills/axi invoke pr-triage --payload '{"repository":".","pull_requests":["12","14"],"triage_policy":{"max_size":"medium","required_checks":["test","lint"]}}'
```

## Outputs

Projections are written under `.docs/pr-triage/`: triage report and state snapshot.

## Guard Discipline

Every transition has an explicit JavaScript guard. Terminal-state guard assertions live in `guards/terminal_guard_assertions.test.js`.
