---
name: jsm-workflow
description: Write human facing change prose from evidence.
type: reactive
---

# DOCUMENT

## Context

This phase writes the prose that helps people understand the change.
It follows the source corpus pattern where documentation comes from commits, diffs, specs, and incident facts.

## Objective

Create the required human facing document for the change.

## Deliverables

- Document type.
- Source evidence used.
- Draft or file path.
- Audience fit.
- Scope or lifecycle update when the repo tracks documentation work.

## Constraints

Write only from evidence.
Do not invent timeline entries, causes, user impact, or changes.
Do not modify code or tests in this phase.
Do not manually edit files marked as generated.

## Uncertainty

If the document type is unclear, ask the user to choose.
If evidence is incomplete for a postmortem or release note, ask for the missing facts before writing.
If documentation exposes a changed decision or corrected narrative, emit `DECISION_REOPENED`.

## Atomic Gate

- The document type is known.
- Every factual claim traces to a commit, diff, spec, verification result, or user supplied incident fact.
- The output location or chat only delivery is explicit.
- No generated file was manually edited.

## Task

Write the requested change documentation from evidence.
Update `document_record` with `summary`, `document_type`, `evidence`, `output_path`, `audience`, and `deferred_reason`.
Emit `DOCUMENTED` when the document is produced.
Emit `DOCUMENT_DEFERRED` when documentation is not required for this lifecycle run.
Emit `DECISION_REOPENED` when documentation work changes a load bearing decision.
