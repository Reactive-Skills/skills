# VERIFYING_MIGRATE State

## Goal
Validate that the migration produced a valid reactive skill.

## Logic
- For MIGRATE_LEGACY:
  - Verify skill.yaml is valid YAML
  - Verify skill.yaml conforms to reactive/v1 schema
  - Verify all states/*.md files exist
- Verify templates/*.hbs exist
- Verify `SKILL.md` says AXI CLI is the default runtime path
- Verify `SKILL.md` says MCP tools are fallback-only when shell access to AXI is unavailable
- Verify `SKILL.md` does not tell agents to check `reactive_state` before AXI
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
