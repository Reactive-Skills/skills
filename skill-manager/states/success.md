# SUCCESS State

## Goal
Signal that the skill was managed successfully.

## Final Output
- Emit completion summary with:
  - operation performed
  - skill_name
  - timestamp
  - files affected
- For CREATE, UPDATE, DELETE, or a migration, ask the user whether to run `reactive-skills-axi sync --source <authoring_source> --skill <skill_name>`, and run it only on approval.

## Terminal State
This is a terminal state. No further transitions.
