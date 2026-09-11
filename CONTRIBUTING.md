# Contributing Reactive Skills

Thank you for contributing a skill to the official Reactive Skills Registry!

## Principles of a Reactive Skill

1. **Hierarchical State Machine (HSM):** A skill must define explicit states and transitions in `skill.yaml`.
2. **State Independence:** Each state in `states/*.md` must be self-contained and specify exact exit conditions.
3. **Deterministic Guarding:** Use programmatic conditions (`exit_code == 0`, schema validation) rather than subjective completion claims.
4. **Universal Bootloader:** The skill's `SKILL.md` must include the standard `<!-- REACTIVE BOOTLOADER -->` referencing `npx -y @reactive-skills/axi state <skill>` (or `reactive-skills-axi state <skill>`).

## Skill Structure

```
skills/<skill-name>/
├── SKILL.md       # Entrypoint with universal bootloader
├── skill.yaml     # Statechart specification (schema_version: 2.1.0)
├── states/        # Self-contained state prompt templates (*.md)
├── guards/        # Custom deterministic guard functions (optional)
└── templates/     # Deliverable projection templates (*.hbs, optional)
```

## Pull Request Checklist

- [ ] Does `skill.yaml` validate against schema `2.1.0`?
- [ ] Are all referenced state prompt files present in `states/`?
- [ ] Does `SKILL.md` contain the universal bootloader with `npx -y @reactive-skills/axi`?
