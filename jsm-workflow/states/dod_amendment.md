---
name: jsm-workflow
description: Request approval for a change to an accepted DoD.
type: reactive
---

# DOD AMENDMENT

## Objective

Get approval only when evidence or a load-bearing decision changes the accepted outcome.
This state is entered from ARCHITECT through `DOD_AMENDMENT_REQUIRED`, or from any active phase through the bubbled `DOD_CHANGE_REQUESTED`, which carries `dod_record.pending_diff`, `revision_reason`, and `downstream_work_to_rerun`.

## Required diff

Show each changed criterion or decision with before, after, reason, output impact, verification impact, and affected work to rerun.
Include revised ADR details when a load-bearing decision changes.
Keep unchanged DoD items collapsed into a count.

## Gate

Ask once to approve the diff, request edits, or stop.
On approval, version the DoD and rerun affected implementation and checks.
On stop, record the affected work as blocked.

## Atomic Gate

- Each changed item shows before, after, reason, and output or verification impact.
- Unchanged criteria are represented by count.
- Required ADR updates and downstream work are named.
- No implementation resumes before approval.

## Signals

Emit USER_APPROVED, USER_REVISION_REQUESTED, or USER_REJECTED.
