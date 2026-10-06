---
name: jsm-workflow
description: Present one complete outcome contract for approval.
type: reactive
---

# DOD APPROVAL

## Objective

Present the final output contract before implementation.

## Required card

Show outcome, deliverables and locations, setup and use, itemized observable checks with evidence methods, assumptions, gotchas, exclusions, and approved decisions.
Include recommended workflow tier, technical decisions, ADR status, and any planned external actions.
List unresolved user-only decisions together.

## Gate

Ask once for approval, revisions, or stop.
On revisions, update the same DoD and repeat this gate.
Record approval status and render the approved contract to the run artifact.
Do not begin implementation before approval.

## Atomic Gate

- Outcome, deliverables, locations, setup, and use are explicit.
- Each check has a unique ID, one observable assertion, a yes/no question, an expected result, an `exact` or `semantic` check type, and an evidence method.
- Refuse a compound semantic check; split it into separate item IDs before approval. The judge scores one assertion per call, so a joined assertion can pass on one half while the other half fails unnoticed.
  Compound: `C3: Does the page show the totals and send the receipt email?`
  Split: `C3: Does the page show the totals?` and `C4: Does the system send the receipt email?`
- Assumptions, gotchas, exclusions, decisions, and external actions are listed.
- Only blocking user-owned choices remain open.
- A short highlight summary makes the approval card skimmable.

## Signals

Emit USER_APPROVED after approval with the full `dod_record`.
The runtime refuses it unless `outcome` is set and every criterion has `id`, `question`, `expected_result`, `check_type`, and `evidence_method`.
Emit USER_REVISION_REQUESTED with grouped feedback.
Emit USER_REJECTED when the user stops the run.
