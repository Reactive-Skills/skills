# EXECUTING State

## Goal
Perform the file operations according to the approved plan.

## Tools
Use a `general` agent or shell commands to:
- CREATE: mkdir skills/{{context.skill_name}}/, write skill.yaml, SKILL.md, CONTEXT.md, STATECHART.md (with a Mermaid stateDiagram-v2 of the skill.yaml), create states/ with .md files, guards/.gitkeep, and templates/ with .hbs files
- UPDATE: modify listed files, and ALWAYS update STATECHART.md to reflect any state/transition changes.
- DELETE: remove skill directory and all files

## Context Note
File writing is delegated to a general agent due to lack of direct fs tool.

## Stop Criteria
All file operations completed (success or failure). Emit `EXECUTED`.

## Exit Code
Set `exit_code = 0` on success, `exit_code = 1` on failure.

## Signal
Emit: `EXECUTED`

---

## 🛑 ATOMIC CHECKLIST & ACCEPTANCE RUBRIC
Before completing this execution and emitting `EXECUTED`, you MUST verify your work passes this strict atomic checklist:

### Skill Construction Standards
- [ ] If creating or updating a skill, does the `SKILL.md` contain strict, gradable instructions without AI gimmicks (like "take a deep breath")?
- [ ] Does the `SKILL.md` include the universal `<!-- REACTIVE BOOTLOADER -->` with primary `reactive-skills-axi state <skill>` and `reactive-skills-axi emit <skill> <signal>` instructions (never requiring event UUIDs, never bypassing runtime)?
- [ ] Did you include an **Atomic Checklist / Anti-Shortcut Gate** within the skill's state prompts (e.g., inside `states/*.md`) so the generated skill holds *itself* accountable?
- [ ] Does the `STATECHART.md` accurately reflect the actual states and transitions defined in `skill.yaml`? (Failure mode: `STATECHART.md` describes states that don't exist in the YAML).
- [ ] Are all required directories properly initialized (`states/`, `guards/`, `templates/`)?

If you fail any of these criteria, you must correct the generated files before transitioning states.
