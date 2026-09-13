# PLANNING State

## Goal
Generate an action plan describing what files will be created/modified/deleted, including architectural shape selection and directory layout.

## Logic
Based on `context.operation`:

### 1. CREATE (or Major Architectural UPDATE)
Evaluate the user's intent against the **HSM Litmus Test**:
- **Event Bubbling / Cross-Cutting Signals**: Does the workflow need global cancellation, timeouts, quota limits, or user interrupts handled cleanly across multiple steps without transition explosion?
- **Tiered Failure Escalation**: Does a phase require localized retry/fix loops before escalating to a macro rollback or human review?
- **Guaranteed Lifecycle Boundaries**: Does the workflow require setup/teardown invariants (sandboxes, git branches, locks) that must run regardless of how child states exit?
- **Pause & Resume**: Does a sub-flow need to pause for external human input and resume via History states (`H`)?

#### Formulate the Architectural Menu
Synthesize 2–3 concrete candidate shapes tailored to the user's domain intent:
1. **Flat Linear Pipeline**: Fast, single-pass sequential executions where a failure aborts the run (`states/*.md`).
2. **Flat Iterative Loop**: Resilient item-by-item batch processing with cycle transitions (`states/*.md`).
3. **Hierarchical HSM (Composite States)**: Complex multi-step domains with sub-state encapsulation, localized retries, and parent event bubbling (`states/<phase>/*.md` + optional `_parent.md`).

Tag one shape as **`[RECOMMENDED]`** with clear trade-off rationale. Solicit user selection (`1`, `2`, `3`, or custom adjustments). If the user confirms/proceeds without choosing, default to the `[RECOMMENDED]` shape.

#### Map Files to Scaffold
- `skill.yaml`: Declares the authoritative statechart topology (including composite states, sub-states, transitions, and bubbling handlers).
- `SKILL.md`: Universal reactive bootloader.
- `README.md`: Human-facing documentation and directory layout.
- `CONTEXT.md`: Ubiquitous language and domain boundaries.
- `STATECHART.md`: Mermaid diagram accurately depicting the chosen shape (including `state PARENT { ... }` for composite states).
- `states/`:
  - For flat shapes: `states/*.md`
  - For hierarchical shapes: `states/<phase>/<sub_state>.md` and optional `states/<phase>/_parent.md` (or `states/<phase>.md`) housing parent invariants and bubbling rules.
- `guards/.gitkeep`
- `templates/snapshot.md.hbs`, `templates/inventory.json.hbs`

### 2. UPDATE
- List existing files to modify (MUST include `STATECHART.md` to keep diagram synced, and `README.md` if capabilities or states changed).
- List new files to add (ensuring any new prompt templates match `skill.yaml` references).
- List any deprecated state files to delete to prevent orphan dead code.

### 3. DELETE
- List skill directory and all files to remove.

## Output
Produce `plan` object with:
- `operation`: CREATE | UPDATE | DELETE
- `skill_name`: context.skill_name
- `shape`: `flat_pipeline` | `iterative_loop` | `hierarchical_hsm`
- `shape_rationale`: Rationale explaining the chosen architecture
- `files_to_create`: array of paths (including nested paths if hierarchical)
- `files_to_modify`: array of paths
- `files_to_delete`: array of paths

## Stop Criteria
Plan complete. Emit `PLAN_READY`.

## Signal
Emit: `PLAN_READY`
