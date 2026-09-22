# EXECUTING State

## Goal
Perform the file operations according to the approved plan.

## Tools
Use file manipulation tools or shell commands to:
- **CREATE**:
  - `mkdir -p skills/{{context.skill_name}}/` (recursively creating subdirectories like `states/<phase>/` if hierarchical).
  - Write `skill.yaml`: The authoritative Single Source of Truth (SSOT). For hierarchical shapes, declare composite states (`type: composite`, nested `states:` blocks, and bubble-up event handlers).
  - Write `SKILL.md`: Render `templates/reactive_bootloader.md.hbs` with `skill_name`, then add gradable operational instructions.
  - Write `README.md`: Include human-facing overview, installation, CLI/MCP usage, and complete directory layout.
  - Write `CONTEXT.md`: Ubiquitous language, domain boundaries, and statechart invariants.
  - Write `STATECHART.md`: Mermaid `stateDiagram-v2` depicting states and transitions. If hierarchical, render composite states using `state PARENT { ... }` blocks and document bubble-up transitions.
  - Create `states/` directory: Write individual state prompt `.md` files (and `states/<phase>/_parent.md` for composite parents if applicable).
  - Create `guards/.gitkeep` and `templates/` with `.hbs` files.
  - Copy `templates/init_state.md.hbs` into `states/init.md` after rendering `skill_name`.
  - Copy `templates/bypass_detected.md.hbs` into `states/bypass_detected.md` after rendering `skill_name`.
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
- [ ] **Reactive Bootloader**: Does `SKILL.md` use the canonical local-first bootloader from `templates/reactive_bootloader.md.hbs`?
- [ ] **Runtime Selection**: Does `SKILL.md` select one compatible MCP or AXI runtime during INIT and reuse it?
- [ ] **No Repeated Checks**: Does `SKILL.md` persist the selected runtime instead of repeating capability checks?
- [ ] **Anti-Shortcut Gates**: Did you include an **Atomic Checklist / Anti-Shortcut Gate** within each state prompt file (under `states/**/*.md`)?
- [ ] **Authoritative SSOT Alignment**:
  - Every `prompt_template` declared in `skill.yaml` exists on disk.
  - Every `.md` file in `states/**` is referenced by an active state in `skill.yaml` (no orphan/dead code files).
  - No empty directories remain under `states/`.
- [ ] **Statechart Fidelity**:
  - Does `STATECHART.md` accurately mirror `skill.yaml` states, transitions, and guards?
  - If hierarchical, does `STATECHART.md` display composite states (`state PARENT { ... }`) and bubble-up transitions?
- [ ] **Hygiene Gate Verification**:
  - Run `node ../scripts/validate-skills.js {{context.skill_name}}` — does it report `✅ VALID` with zero errors and zero warnings?

### SDO & Form-Matching Standards
- [ ] **SDO Conformance**: Does `skill.yaml` declare all required top-level fields (`schema_version`, `name`, `version`, `initial_state`, `states`) with correct types?
- [ ] **Context Key Declaration**: Are all context variables referenced in guards or state prompts declared under `context_keys` in `skill.yaml`?
- [ ] **Guard Syntax Validation**: Are all guard expressions valid JavaScript (not Python)? Check for `!= null`, `!== null`, `||`, `&&` usage.
- [ ] **Transition Signal Consistency**: Do all transition signal names match between `skill.yaml` declarations and the `Emit:` directives in corresponding `states/*.md` files?
- [ ] **Prompt Template Path Alignment**: Do all `prompt_template` paths in `skill.yaml` resolve to actual files relative to the skill directory?
- [ ] **Deliverable Projection Templates**: Do `templates/*.hbs` files use only declared context variables and plan fields? No undefined Handlebars helpers.

### Token Efficiency Standards
- [ ] **State Prompt Brevity**: Is each `states/*.md` file under 200 words? (Verify with `wc -w` or PowerShell `($content -split '\s+').Count`)
- [ ] **JIT Loading Readiness**: Are state prompts structured for Just-In-Time loading (focused, single-responsibility, no cross-state dependencies inlined)?
- [ ] **Bootloader Overhead**: Does `SKILL.md` bootloader section stay under 50 lines? (Excluding metadata frontmatter)
- [ ] **Bootloader Drift Check**: Does the bootloader match `templates/reactive_bootloader.md.hbs` except for rendered `skill_name`?
- [ ] **No Duplicate Instructions**: Do sibling state prompts avoid re-declaring logic already in `SKILL.md` or `CONTEXT.md`?

### Cross-Reference Standards
- [ ] **SKILL.md ↔ README.md Alignment**: Does `README.md` accurately reflect the operations, states, and capabilities declared in `SKILL.md`?
- [ ] **CONTEXT.md ↔ skill.yaml Alignment**: Does `CONTEXT.md` document all schema versions and operations actually supported by `skill.yaml`?
- [ ] **STATECHART.md ↔ skill.yaml Alignment**: Does the Mermaid diagram in `STATECHART.md` include ALL states and transitions from `skill.yaml` (no omissions, no extras)?
- [ ] **README.md Directory Layout ↔ Disk**: Does the directory tree shown in `README.md` match the actual on-disk structure?
- [ ] **Migration Branch Documentation**: If the skill supports MIGRATE_LEGACY or MIGRATE_REACTIVE, do both `SKILL.md` and `README.md` document the full migration flow?

### RED Phase Standards (only when `context.red_phase === true`)
- [ ] **Skill Type Classification**: Is `plan.skill_type` set to one of: `tool` | `agent` | `workflow` | `orchestrator` | `data_pipeline` | `domain_model`?
- [ ] **RED Findings Recorded**: Does `plan.red_phase_findings` contain answers to all 6 discovery questions?
- [ ] **Middleware Alignment**: Do declared middleware hooks match the skill type? (e.g., `agent` requires `context_sanitizer` if secrets present; `orchestrator` requires all hooks)
- [ ] **RED-Gate Checklist**: Did the PLANNING state complete the RED-Gate validation checklist before emitting `PLAN_READY`?

If you fail any of these criteria, you must correct the generated files before transitioning states.
