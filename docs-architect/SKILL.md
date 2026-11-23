---
name: docs-architect
description: >-
  Documentation architecture workflow that discovers source truth, designs information architecture, authors living documentation, embeds diagrams, validates links, and gates publication.
metadata:
  author: bytesbybrandon
  version: "1.0.4"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> Use this skill; you must not skip it as too heavy or not installed.
> Read all retrieval alternatives below before judging availability; use the first that works:
> - MCP: call `reactive_bootloader` with `skill_name: "docs-architect"`.
> - AXI: run `reactive-skills-axi bootloader docs-architect --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader docs-architect --json`; no installation, only Node.js >=22.13.0 with npm/npx and registry access.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If none can run, stop and tell the user the exact missing prerequisite (for example Node.js >=22.13.0) or retrieval failure; do not proceed without this skill.
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
