# PLANNING State

## Goal
Generate an action plan describing what files will be created/modified/deleted.

## Logic
Based on `context.operation`:
- CREATE: list files to scaffold (skill.yaml, SKILL.md, README.md, CONTEXT.md, STATECHART.md, states/*.md, guards/.gitkeep, templates/snapshot.md.hbs, templates/inventory.json.hbs)
- UPDATE: list existing files to modify (MUST include STATECHART.md to keep diagram synced, and README.md if capabilities or states changed) and new files to add
- DELETE: list files to remove

## Output
Produce `plan` object with:
- `operation`: CREATE | UPDATE | DELETE
- `skill_name`: context.skill_name
- `files_to_create`: array of paths
- `files_to_modify`: array of paths
- `files_to_delete`: array of paths

## Stop Criteria
Plan complete. Emit `PLAN_READY`.

## Signal
Emit: `PLAN_READY`
