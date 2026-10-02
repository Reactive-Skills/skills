# Make the experience tangible

Use the current-basis problem and story.
Map discovery, evaluation, acquisition, onboarding, use, support, retention, and exit.
Include one touchpoint per stage with stage, status, and detail.
Status is mapped, needs_test, or not_applicable.
Explain every not_applicable choice.
Identify friction, owners, and how to prototype relevant touchpoints.
Prototype the narrative and marketing alongside product behavior.
Distinguish proposed sketches or walkthroughs from completed prototypes.
If the experience cannot fulfill its promise, revise the story.
Save context.experience with basis_version and touchpoints.

## Atomic checklist

- [ ] All eight stages are addressed.
- [ ] Whole-experience gaps are visible.
- [ ] Proposed work is labeled as proposed.
- [ ] Record uses context.basis_version.

Emit: EXPERIENCE_READY with experience in payload.contextUpdates.
Emit: REVISE_STORY with a reason when its promise needs revision.

Emit: ROUTE_CHANGED, SITUATION_CHANGED, CANCEL, REVISE_PROBLEM using the shared event contract in CONTEXT.md.
