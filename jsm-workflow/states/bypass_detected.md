---
name: jsm-workflow
description: Bypass detected because execution moved outside the signal contract.
type: reactive
---

# BYPASS_DETECTED

## Context

This state is entered when work appears to have skipped the runtime controlled state machine.

## Objective

Stop unsafe execution and return control to the runtime.

## Deliverables

- Bypass description.
- Last known valid state.
- Recovery step.

## Constraints

Do not continue lifecycle work manually.
Do not guess the next state.

## Atomic Gate

- Bypass is reported.
- Recovery step uses the reactive runtime.
- No lifecycle work continues from this state.

## Task

Tell the user to resume through `reactive-skills-axi state jsm-workflow` and stop.
