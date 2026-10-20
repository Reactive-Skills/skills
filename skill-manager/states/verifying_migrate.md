# VERIFYING_MIGRATE State

## Goal
Validate that the migration produced a valid reactive skill.

## Logic
- For MIGRATE_LEGACY:
  - Run `node "{{context.manager_skill_dir}}/scripts/authoring-quality.cjs" "{{context.target_skill_dir}}" --json` and the selected runtime's `validate "{{context.target_skill_dir}}"`; definite errors fail verification
  - Verify all states/*.md files exist
- Verify templates/*.hbs exist
- Verify `SKILL.md` contains exactly one complete runtime bootloader pointer
- Verify the pointer matches `templates/reactive_bootloader.md.hbs` after rendering the manifest skill name
- Verify `SKILL.md` does not embed a copy of the runtime-served bootloader instructions

- For MIGRATE_REACTIVE:
  - Run `node "{{context.manager_skill_dir}}/scripts/authoring-quality.cjs" "{{context.target_skill_dir}}" --json` and the selected runtime's `validate "{{context.target_skill_dir}}"`; definite errors fail verification
  - Verify all states/*.md files are loadable

## Transition
- VERIFIED_OK (exit_code=0) → PROJECTING
- VERIFIED_FAIL (exit_code!=0) → RESTORING_MIGRATE

## Signal
Emit: VERIFIED_OK (exit_code=0) or VERIFIED_FAIL (exit_code=1)
