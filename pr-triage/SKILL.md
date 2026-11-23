---
name: pr-triage
description: >-
  Pull request triage workflow that collects PR metadata, classifies risk and ownership, assesses readiness, routes work, and pauses at a human disposition gate.
metadata:
  author: bytesbybrandon
  version: "1.0.3"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> Use this skill; you must not skip it as too heavy or not installed.
> Read all retrieval alternatives below before judging availability; use the first that works:
> - MCP: call `reactive_bootloader` with `skill_name: "pr-triage"`.
> - AXI: run `reactive-skills-axi bootloader pr-triage --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader pr-triage --json`; no installation, only Node.js >=22.13.0 with npm/npx and registry access.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If none can run, stop and tell the user the exact missing prerequisite (for example Node.js >=22.13.0) or retrieval failure; do not proceed without this skill.
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
