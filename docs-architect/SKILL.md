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
> **REACTIVE SKILL - STRICT RUNTIME EXECUTION**
> Manual execution is forbidden. Use `npx -y @reactive-skills/axi state docs-architect` to read the active prompt and `npx -y @reactive-skills/axi emit docs-architect <SIGNAL>` to advance.
>
> The runtime governs transitions, guards, and projections. Do not guess a state or author `.docs/` deliverables outside the runtime.
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
