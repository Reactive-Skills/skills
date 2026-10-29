---
name: release-notes
description: >-
  Automated changelog and release note generator that scopes changes, classifies entries, composes draft notes, validates formatting, and gates human approval.
metadata:
  author: bytesbybrandon
  version: "1.1.0"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "release-notes"`.
> - AXI: run `reactive-skills-axi bootloader release-notes --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader release-notes --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
<!-- END REACTIVE BOOTLOADER -->

# Release Notes

`release-notes` generates auditable release notes from source-scoped change evidence. It scopes the release, collects commits and artifacts, classifies changes into changelog categories, composes draft release notes, validates formatting and links, and pauses at a human approval gate.

## Runtime and saved evidence

Requires Reactive Skills runtime **0.20.0 or newer** with `evidence.local_registry` and `evidence.reference_submission`.
Run `reactive-skills-axi preflight release-notes --json` before invocation and stop on incompatibility; keep the same compatible transport and run UUID throughout.
Do not remove evidence fields to continue on an older runtime. Existing inline text submissions remain supported on compatible runtimes.

The compose state prefers `emit --evidence` with a workspace-relative path to the saved draft. `COMPOSITION_FAILED` stays inline.
This imports and verifies the saved bytes in the signal call, preserving existing guards, judgment inputs and projections.
For MCP, use `reactive_emit_signal` with the same pointer map in `evidence`.
For reuse, `evidence <skill> import <path> --media-type text/markdown --job <run-uuid>` returns a receipt; bind it as `{"/field":{"reference":<receipt>}}`.
Receipts belong to the selected run. Re-import after editing a file; do not reuse a receipt for changed content.
Only an explicit evidence read returns the saved content.

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
