---
name: release-notes
description: >-
  Automated changelog and release note generator that scopes changes, classifies entries, composes draft notes, validates formatting, and gates human approval.
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
> - To start a new task: Run `reactive-skills-axi invoke release-notes [--payload JSON]`
> - To resume an active task: Run `reactive-skills-axi state release-notes`
> - For named or parallel work: Keep the same `--job <job-id>` flag on every command.
> - To advance state: Run `reactive-skills-axi emit release-notes <signal>`
>
> **FALLBACK EXECUTION: MCP**
> Use `reactive_state` and `reactive_emit_signal` only when shell access to AXI is unavailable.
> Do not troubleshoot MCP before trying AXI.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run `reactive-skills-axi reset release-notes` or `reactive-skills-axi invoke release-notes`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# Release Notes

`release-notes` generates auditable release notes from source-scoped change evidence. It scopes the release, collects commits and artifacts, classifies changes into changelog categories, composes draft release notes, validates formatting and links, and pauses at a human approval gate.

## Workflow

`INTAKE -> COLLECT -> CLASSIFY -> COMPOSE -> VALIDATE -> REVIEW -> SUCCESS`

Failures terminate in `ERROR`; a rejected release terminates in `BLOCKED`; revision requests return to `COMPOSE`.

## Usage

```bash
npx -y @reactive-skills/axi invoke release-notes --payload '{"repository":".","release_version":"1.2.0","scope_refs":["main","v1.1.0"]}'
```

## Outputs

Projections are written under `.docs/release-notes/`: release notes and a state snapshot.

## Guard Discipline

Every transition has an explicit JavaScript guard. Terminal-state guard assertions live in `guards/terminal_guard_assertions.test.js`.
