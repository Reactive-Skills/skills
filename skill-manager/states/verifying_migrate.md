# VERIFYING_MIGRATE State

## Goal
Validate that the migration produced a valid reactive skill.

## Logic
- For MIGRATE_LEGACY:
  - Verify skill.yaml is valid YAML
  - Verify skill.yaml conforms to reactive/v1 schema
  - Verify all states/*.md files exist
- Verify templates/*.hbs exist
- Verify `SKILL.md` selects one compatible MCP or AXI runtime during INIT
- Verify `SKILL.md` persists the selected runtime and does not repeat capability checks
- Verify `SKILL.md` identifies `npx` as AXI's zero-install launcher, not a separate runtime
- Verify `states/bypass_detected.md` does not say to use only `reactive_state`

- For MIGRATE_REACTIVE:
  - Verify skill.yaml is valid YAML
  - Verify skill.yaml conforms to v2.0.0 schema
  - Verify SQLite event store is initialized
  - Verify MCP config is valid
  - Verify all states/*.md files are loadable

## Transition
- VERIFIED_OK (exit_code=0) → PROJECTING
- VERIFIED_FAIL (exit_code!=0) → RESTORING_MIGRATE

## Signal
Emit: VERIFIED_OK (exit_code=0) or VERIFIED_FAIL (exit_code=1)
