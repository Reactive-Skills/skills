# EXECUTING_MIGRATE State

## Goal
Perform the actual migration file operations.

## Logic
- For MIGRATE_LEGACY:
  - Write skill.yaml (schema_version 2.1.0)
  - Write states/*.md (split from inferred SKILL.md sections, including init.md and setup_mcp.md)
  - Render `templates/init_state.md.hbs` into states/init.md
  - Render `templates/bypass_detected.md.hbs` into states/bypass_detected.md
  - Scaffold guards/.gitkeep
  - Write templates/*.hbs (default projection templates)
  - Write README.md with human-facing overview, installation commands, and architecture
  - Render the centralized runtime bootloader pointer from `templates/reactive_bootloader.md.hbs` into SKILL.md

- For MIGRATE_REACTIVE:
  - Rewrite skill.yaml to 2.1.0 schema
  - Add version field
  - Add event_store config
  - Ensure INIT and SETUP_MCP states exist
  - Ensure README.md exists and is updated with schema/usage details
  - Update SKILL.md with the centralized runtime bootloader pointer

## Tools
Delegate file operations to a general agent.

## Stop Criteria
All file operations complete.
Record created, modified, and deleted paths in `contextUpdates.files` as a flat array of path strings for the inventory and snapshot projections.
Emit EXECUTED.

## Exit Code
Set exit_code = 0 on success, exit_code = 1 on failure.

## Signal
Emit: EXECUTED

---

## 🛑 ATOMIC CHECKLIST & ACCEPTANCE RUBRIC
Before completing this execution and emitting `EXECUTED`, verify your work passes this strict atomic checklist:

### Migration Integrity Standards
- [ ] Are the migrated state files (`states/*.md`) completely free of AI gimmicks or un-gradable instructions?
- [ ] Does the migrated `SKILL.md` contain exactly one complete pointer rendered from `templates/reactive_bootloader.md.hbs` for the manifest skill name?
- [ ] Does the migrated `SKILL.md` leave shared bootloader instructions to the runtime?
- [ ] Does the migrated skill include a human-facing `README.md` alongside `SKILL.md` with clear installation, CLI/MCP usage, and directory overview?
- [ ] Did you inject an **Atomic Checklist** into the execution/terminal states of the new migrated skill, so it holds itself accountable?
- [ ] Does the new `skill.yaml` (v2.1.0) strictly map to the exact files you created in the `states/` directory? (Failure mode: missing state prompt files).

If you fail any of these criteria, you must correct the generated files before transitioning states.
