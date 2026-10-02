---
name: jsm-workflow
description: Write human facing change prose from evidence.
type: reactive
---

# DOCUMENT

## Objective

Write the document named in the approved DoD.

## Deliverables

- Document type, evidence, output path, audience, and lifecycle update when tracked.

## Constraints

Use only commits, diffs, specs, verification, or user supplied facts.
Do not invent causes, timelines, impact, or changes.
Do not edit code, tests, or generated files.

## Uncertainty

If documentation is excluded, emit `DOCUMENT_DEFERRED`.
If evidence required by the approved document is missing, block that item.
If prose changes an accepted decision, emit `DECISION_REOPENED`.
If the user or evidence changes the approved outcome without reopening a decision, emit `DOD_CHANGE_REQUESTED` with the full `dod_record` plus `pending_diff`, `revision_reason`, and `downstream_work_to_rerun`.

## Atomic Gate

- Required document and output location are known.
- Claims trace to evidence.
- No generated file was manually edited.

## Task

Update `document_record` with summary, type, evidence, path, audience, and defer reason.
Emit `DOCUMENTED`, `DOCUMENT_DEFERRED`, `DECISION_REOPENED`, or `DOD_CHANGE_REQUESTED`.
