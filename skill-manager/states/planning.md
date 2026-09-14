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
- `skill_type`: `tool` | `agent` | `workflow` | `orchestrator` | `data_pipeline` | `domain_model`
- `shape_rationale`: Rationale explaining the chosen architecture
- `files_to_create`: array of paths (including nested paths if hierarchical)
- `files_to_modify`: array of paths
- `files_to_delete`: array of paths
- `red_phase`: optional, included only when `context.red_phase === true`

## RED Phase Integration (Optional)
When `context.red_phase === true`, run the RED (Requirements Engineering & Discovery) phase before architectural shape selection:

### Step 1: Skill Type Classification
Classify the skill into one of these types to inform scaffolding decisions:

| Type | Characteristics | Typical Shape | Middleware Concerns |
|------|----------------|---------------|-------------------|
| **`tool`** | Single-purpose utility, deterministic output, no human-in-loop | Flat Pipeline | Telemetry only; no invariant checks needed |
| **`agent`** | Conversational, multi-turn, requires judgment, may pause for input | Flat Iterative Loop or Hierarchical HSM | Context sanitizer essential; invariant rules for safety |
| **`workflow`** | Multi-step process with approval gates, retries, escalation paths | Hierarchical HSM | Audit + invariant_checker + telemetry |
| **`orchestrator`** | Coordinates multiple sub-skills or external systems, event-driven | Hierarchical HSM with composite states | All hooks: telemetry, audit, metrics, invariant_checker, context_sanitizer |
| **`data_pipeline`** | ETL/ELT stages, batch or streaming, idempotent retries | Flat Iterative Loop | Metrics essential; invariant rules for data integrity |
| **`domain_model`** | Encapsulates domain logic, rules engine, inference | Flat Pipeline or Hierarchical HSM | Invariant_checker critical; audit for rule changes |

Classification rules:
- If the skill invokes external APIs or coordinates multiple systems → `orchestrator`
- If the skill processes data in stages with retries → `data_pipeline`
- If the skill makes judgments, gives advice, or has conversational turns → `agent`
- If the skill has explicit approval gates or escalation → `workflow`
- If the skill encapsulates rules or domain logic → `domain_model`
- Otherwise → `tool`

### Step 2: RED Requirements Elicitation
When `context.red_phase === true`, ask targeted discovery questions before finalizing the plan:

1. **Domain boundaries**: What are the explicit invariants and edge cases this skill must never violate?
2. **Failure modes**: What happens when an external dependency is unavailable? Retry, fail-fast, or degrade gracefully?
3. **Secrets surface**: Does this skill ever receive or process credentials, tokens, or PII?
4. **Human-in-loop**: At which exact steps does the skill pause for user input or approval?
5. **Observability**: Which transitions, durations, and error rates must be measurable in production?
6. **Concurrency**: Can multiple instances run simultaneously? Is there shared mutable state?

Record answers in `plan.red_phase_findings` as an object with keys matching the questions above.

### Step 3: RED-Gate Validation
Before emitting `PLAN_READY`, verify:
- [ ] Skill type is classified and matches the selected architectural shape
- [ ] If `red_phase` was requested, all 6 discovery questions have answers recorded
- [ ] Middleware hook declarations (if any) align with the skill type classification
- [ ] If `skill_type` is `agent` or `orchestrator`, `context_sanitizer` is declared when secrets are present
- [ ] If `skill_type` is `workflow` or `orchestrator`, `audit` hook is declared

## Stop Criteria
Plan complete. Emit `PLAN_READY`.

## Signal
Emit: `PLAN_READY`
