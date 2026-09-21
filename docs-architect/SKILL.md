---
name: docs-architect
description: >-
  Documentation architecture workflow that discovers source truth, designs information architecture, authors living documentation, embeds diagrams, validates links, and gates publication.
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
> - To start a new task: Run `reactive-skills-axi invoke docs-architect [--payload JSON]`
> - To resume an active task: Run `reactive-skills-axi state docs-architect`
> - For named or parallel work: Keep the same `--job <job-id>` flag on every command.
> - To advance state: Run `reactive-skills-axi emit docs-architect <signal>`
>
> **FALLBACK EXECUTION: MCP**
> Use `reactive_state` and `reactive_emit_signal` only when shell access to AXI is unavailable.
> Do not troubleshoot MCP before trying AXI.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run `reactive-skills-axi reset docs-architect` or `reactive-skills-axi invoke docs-architect`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# Docs Architect

`docs-architect` turns repository truth into maintainable documentation architecture. It inventories source material, extracts facts, designs an audience-oriented information architecture, authors source-linked content, embeds diagrams, validates the result, and pauses at a publication gate.

## Workflow

`INTAKE -> DISCOVER -> EXTRACT -> DESIGN -> AUTHOR -> DIAGRAM -> VALIDATE -> REVIEW -> SUCCESS`

Failure paths terminate in `ERROR`; a rejected publication terminates in `BLOCKED`. Revision requests return to `AUTHOR` so source traceability and diagrams are regenerated.

## Usage

```bash
npx -y @reactive-skills/axi invoke docs-architect --payload '{"source_paths":["README.md","src"],"audience":"maintainers","outcomes":["onboard","operate"]}'
npx -y @reactive-skills/axi state docs-architect
npx -y @reactive-skills/axi emit docs-architect <SIGNAL>
```

## Outputs

Projections are written under `.docs/docs-architect/`: documentation architecture, diagram inventory, and a state snapshot.

## Guard Discipline

Every transition has an explicit JavaScript guard. Terminal-state guard assertions live in `guards/terminal_guard_assertions.test.js`.
