# SUCCESS State

## Goal

Signal that onboarding is complete and a guide is ready to be generated.

## Deliverable

Render `templates/onboarding_guide.md.hbs` and `templates/state_snapshot.json.hbs`.

## Signal

Terminal — no forward transitions. Emit `COMPLETED` for external observers.
