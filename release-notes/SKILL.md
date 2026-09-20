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
> **REACTIVE SKILL - STRICT RUNTIME EXECUTION**
> Use `npx -y @reactive-skills/axi state release-notes` to read the active prompt and `npx -y @reactive-skills/axi emit release-notes <SIGNAL>` to advance.
>
> The runtime governs transitions, guards, and projections. Do not emit release notes without source-scoped evidence.
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
