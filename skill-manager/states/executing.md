# EXECUTING State

## Goal
Perform the file operations according to the approved plan.

## Tools
Use file manipulation tools or shell commands to:
- **CREATE**:
  - `mkdir -p skills/{{context.skill_name}}/` (recursively creating subdirectories like `states/<phase>/` if hierarchical).
  - Write `skill.yaml`: The authoritative Single Source of Truth (SSOT). For hierarchical shapes, declare composite states (`type: composite`, nested `states:` blocks, and bubble-up event handlers).
  - Write `SKILL.md`: Include universal reactive bootloader and gradable operational instructions.
  - Write `README.md`: Include human-facing overview, installation, CLI/MCP usage, and complete directory layout.
  - Write `CONTEXT.md`: Ubiquitous language, domain boundaries, and statechart invariants.
  - Write `STATECHART.md`: Mermaid `stateDiagram-v2` depicting states and transitions. If hierarchical, render composite states using `state PARENT { ... }` blocks and document bubble-up transitions.
  - Create `states/` directory: Write individual state prompt `.md` files (and `states/<phase>/_parent.md` for composite parents if applicable).
  - Create `guards/.gitkeep` and `templates/` with `.hbs` files.
- **UPDATE**:
  - Modify listed files.
  - ALWAYS update `STATECHART.md` and `README.md` to keep diagrams and directory layouts synced with `skill.yaml`.
  - Prune any unreferenced or deprecated prompt template files to avoid dead code warnings.
- **DELETE**:
  - Remove skill directory and all files.

## Context Note
File operations must ensure recursive directory creation (`mkdir -p`) for nested subdirectories under `states/`.

## Stop Criteria
All file operations completed and verified against the checklist. Emit `EXECUTED`.

## Exit Code
Set `exit_code = 0` on success, `exit_code = 1` on failure.

## Signal
Emit: `EXECUTED`

---

## 🛑 ATOMIC CHECKLIST & ACCEPTANCE RUBRIC
Before completing this execution and emitting `EXECUTED`, you MUST verify your work passes this strict atomic checklist:

### Skill Construction & Hierarchy Standards
- [ ] **Prompt Quality**: Does `SKILL.md` contain strict, gradable instructions without AI gimmicks (like "take a deep breath" or vague hand-waving)?
- [ ] **Reactive Bootloader**: Does `SKILL.md` include the universal `<!-- REACTIVE BOOTLOADER -->` referencing `npx -y @reactive-skills/axi` (or `reactive-skills-axi`)?
- [ ] **Anti-Shortcut Gates**: Did you include an **Atomic Checklist / Anti-Shortcut Gate** within each state prompt file (under `states/**/*.md`)?
- [ ] **Authoritative SSOT Alignment**:
  - Every `prompt_template` declared in `skill.yaml` exists on disk.
  - Every `.md` file in `states/**` is referenced by an active state in `skill.yaml` (no orphan/dead code files).
  - No empty directories remain under `states/`.
- [ ] **Statechart Fidelity**:
  - Does `STATECHART.md` accurately mirror `skill.yaml` states, transitions, and guards?
  - If hierarchical, does `STATECHART.md` display composite states (`state PARENT { ... }`) and bubble-up transitions?
- [ ] **Hygiene Gate Verification**:
  - Run `node scripts/validate-skills.js {{context.skill_name}}` — does it report `✅ VALID` with zero errors and zero warnings?

If you fail any of these criteria, you must correct the generated files before transitioning states.
