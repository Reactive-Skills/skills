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
> **REACTIVE SKILL - STRICT RUNTIME EXECUTION**
> Use `npx -y @reactive-skills/axi state pr-triage` to read the active prompt and `npx -y @reactive-skills/axi emit pr-triage <SIGNAL>` to advance.
>
> The runtime governs transitions, guards, and projections. Do not approve or route a PR without recorded evidence.
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
