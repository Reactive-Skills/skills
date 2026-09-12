---
name: skill-manager
description: >-
  Full CRUD lifecycle management for reactive skills. Uses reactive-skills-axi CLI for execution. Auto-discovers skills from ~/.agents/skills/, ~/.gemini/config/skills/, and ./skills/. Use when the user wants to CREATE a new reactive skill, UPDATE an existing skill's states/manifest, DELETE a skill, MIGRATE_LEGACY a SKILL.md-only skill to reactive format, or MIGRATE_REACTIVE a v1 reactive skill to v2.0.0. Triggers on: "create a reactive skill", "manage skills", "skill lifecycle", "scaffold a skill", "install a skill", "remove a skill", "migrate a skill", "convert skill to reactive", "upgrade reactive skill", or any skill management request.
metadata:
  author: Reactive-Skills
  version: "2.1.0"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> **REACTIVE SKILL — STRICT RUNTIME EXECUTION**
> This skill is an event-driven state machine. Manual execution is FORBIDDEN.
>
> **PRIMARY EXECUTION (AXI CLI — Shell):**
> 1. Run `npx -y @reactive-skills/axi state skill-manager` (or `reactive-skills-axi state skill-manager`) to read your current instructions.
> 2. Complete the tasks described in the state prompt.
> 3. Run `npx -y @reactive-skills/axi emit skill-manager <signal>` (or `reactive-skills-axi emit skill-manager <signal>`) to advance to the next state.
>
> **ALTERNATIVE (MCP Mode):**
> If the `reactive_state` MCP tool is present in your tool list, you may use `reactive_state` and `reactive_emit_signal`.
>
> **STRICT INVARIANT:**
> Do NOT manually author `.docs/` deliverables or guess next states. The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# Skill Manager

Manages the complete lifecycle of reactive skills using a Hierarchical State Machine (HSM) model. Executes via reactive-skills-axi CLI.

## Operations

| Operation | Description |
|-----------|-------------|
| CREATE | Scaffold a new reactive skill from scratch |
| UPDATE | Modify an existing reactive skill's states, guards, or templates |
| DELETE | Remove a reactive skill entirely |
| MIGRATE_LEGACY | Convert a legacy SKILL.md skill to reactive format |
| MIGRATE_REACTIVE | Upgrade a reactive skill from v1 (reactive/v1) to v2.0.0 |

## Workflow Phases

### Shared States
- READY — Await skill_name and operation
- PARSING — Resolve operation type
- DETECTING — Verify skill existence, legacy status, or v1 reactive status
- PROJECTING — Write manifest snapshot + inventory
- SUCCESS | ERROR — Terminal states

### CREATE / UPDATE / DELETE Branch
1. PLANNING — Generate action plan; for CREATE, collect middleware hook declarations
2. APPROVING — Pre-COMMIT user approval gate
3. EXECUTING — Perform file operations (skill.yaml, SKILL.md, README.md, CONTEXT.md, STATECHART.md, states/, guards/, templates/); scaffold `runtime/middleware/` for CREATE
4. VERIFYING — Validate operation success
5. ROLLING_BACK — Best-effort rollback on failure

### MIGRATE_LEGACY / MIGRATE_REACTIVE Branch
1. BACKING_UP_MIGRATE — Full backup to skills/.backup/<skill>/<timestamp>/
2. INFERRING_LEGACY — Parse SKILL.md, infer states, score confidence
3. GRILLING_MIGRATE — Socratic questions if confidence < 50%
4. INSPECTING_REACTIVE — Diff v1 → v2.0.0 schema (MIGRATE_REACTIVE only)
5. PLANNING_MIGRATE — Generate migration plan
6. APPROVING_MIGRATE — Pre-COMMIT user approval gate
7. EXECUTING_MIGRATE — Write reactive structure (including README.md) or upgrade schema
8. VERIFYING_MIGRATE — Validate migrated skill is loadable
9. RESTORING_MIGRATE — Restore from backup on failure

## State Transition Summary

- READY → PARSING (USER_INVOKED, guard: Boolean(skill_name))
- PARSING → DETECTING (PARSED, guard: valid operation)
- DETECTING → PLANNING (CREATE: not exists, UPDATE/DELETE: exists)
- DETECTING → BACKING_UP_MIGRATE (MIGRATE_LEGACY: isLegacy, MIGRATE_REACTIVE: isV1Reactive)
- DETECTING → ERROR (invalid existence condition for operation)
- INFERRING_LEGACY → GRILLING_MIGRATE (confidence < 0.5)
- INFERRING_LEGACY → PLANNING_MIGRATE (confidence >= 0.5)
- VERIFYING_MIGRATE → PROJECTING (exit_code=0) | RESTORING_MIGRATE (exit_code!=0)
- RESTORING_MIGRATE → ERROR (always)
- All branches → PROJECTING → SUCCESS
- All branches → ERROR (on rejection or unrecoverable failure)

## File Operations

File creation/modification delegates to the `@reactive-skills/axi` CLI:

```bash
npx -y @reactive-skills/axi state <skill> [--payload JSON]
```

Skills are auto-discovered from:
- `~/.agents/skills/<name>/skill.yaml`
- `~/.gemini/config/skills/<name>/skill.yaml`
- `./skills/<name>/skill.yaml` (workspace-local)

CLI execution: `npx -y @reactive-skills/axi <command>` (zero install) or `reactive-skills-axi <command>` (if installed globally via `npm i -g @reactive-skills/axi`).

## Deliverables

On success:
- .docs/skill-manager/<skill_name>-snapshot.md — skill manifest snapshot
- .docs/skill-manager/inventory.json — skills inventory
- SQLite skill_inventory table

## Guard Syntax

Guards use JavaScript expression syntax (not Python). Use `!= null`, `!== null`, `||`, `&&`.

```yaml
# Wrong (Python-like):
guard: 'context.job_description_url != null || context.company_name != null'

# Correct (JavaScript):
guard: 'context.job_description_url != null || context.company_name != null'
```

## Error Handling

Failure cascade: VERIFYING fails → ROLLING_BACK (or RESTORING_MIGRATE) attempts best-effort restore → ERROR.
- MIGRATE_LEGACY rollback: delete reactive structure, leave legacy intact
- MIGRATE_REACTIVE rollback: restore entire directory from .backup/
- Errors logged to .docs/skill-manager-errors.md

## Middleware Hooks for CREATE

When scaffolding a new reactive skill via CREATE, collect middleware hook requirements in the PLANNING phase. Middleware hooks are **runtime-level cross-cutting concerns invisible to the LLM**.

### Hook Types

| Hook | Trigger | Purpose |
|------|---------|---------|
| `telemetry` | post_transition | Emit transition events to observability bus |
| `audit` | post_transition | Immutable transition audit log |
| `metrics` | post_transition | Prometheus-compatible metrics |
| `invariant_checker` | post_transition | Verify context constraints after each transition |
| `context_sanitizer` | pre_transition | Redact secrets before context reaches LLM |

### Discovery Questions (PLANNING phase)

Ask the user:
- Does this skill need telemetry/logging of state transitions?
- Does it handle secrets or credentials that must never reach the LLM?
- Are there invariant rules that must hold after every transition?
- What metrics matter (transition counts, state durations, error rates)?

If all answers are no, omit `middleware` from `skill.yaml` entirely.

### Middleware Schema (skill.yaml v2.2.0)

```yaml
middleware:
  hooks:
    - name: telemetry
      trigger: post_transition
      config:
        emitter: stdout  # stdout | file | http
    - name: audit
      trigger: post_transition
      config:
        destination: ".reactive/<skill-name>.audit.log"
        redact: []      # context keys to redact
    - name: metrics
      trigger: post_transition
      config:
        backend: prometheus
        port: 9090
    - name: invariant_checker
      trigger: post_transition
      config:
        rules_file: "runtime/hooks/invariants.yaml"
        on_violation: halt  # halt | warn | log
    - name: context_sanitizer
      trigger: pre_transition
      config:
        patterns:
          - ".*_TOKEN"
          - ".*_KEY"
          - "password"
        replacement: "[REDACTED]"
```

### Scaffold for CREATE

When `middleware` is declared, generate:

```
skills/<skill-name>/
├── runtime/
│   ├── middleware/
│   │   ├── telemetry.js
│   │   ├── audit.js
│   │   ├── metrics.js
│   │   ├── invariant_checker.js
│   │   └── context_sanitizer.js
│   └── hooks/
│       └── invariants.yaml
```

Each hook is a plain Node.js module `(hookCtx) => Promise<void> | void`. The runtime executes it — the LLM never touches these files.

## Migration Confidence

MIGRATE_LEGACY uses auto-infer with a 50% confidence threshold. Below 50%, the skill runs targeted Socratic questions before proceeding. This is configurable via context.migrate_mode (AUTO_INFER or GRILL_ON_AMBIGUITY).

## CLI / MCP Integration

Primary entry: `npx -y @reactive-skills/axi` (zero install), or `reactive-skills-axi` (if installed globally).

Fallback: MCP server via `npx -y @reactive-skills/axi mcp`.

Skills auto-discovered from known locations — no symlinks or junctions required.

### State Machine Stepping Workflow

Skills execute via a state/invoke → emit cycle:

```bash
# 1. Inspect current state or invoke skill with initial context
npx -y @reactive-skills/axi state <skill>
# Or invoke with context payload:
npx -y @reactive-skills/axi invoke <skill> --payload '{"skill_name":"my-skill","operation":"CREATE"}'

# 2. Emit signals to advance state machine (event ID is automatically resolved)
npx -y @reactive-skills/axi emit <skill> <SIGNAL> [--payload '{"key":"value"}']

# 3. Each emit rehydrates state from disk, evaluates guards, and transitions state
```

Events stored at: `<workspace>/.reactive/skills/<skill>/events.jsonl`

Context is persisted in SKILL_INITIALIZED payload and rehydrated on subsequent emit calls.

## Skill Package Structure

```
skill-manager/
├── SKILL.md           # This file (LLM agent instructions & bootloader)
├── README.md          # Human-facing documentation, catalog overview & usage
├── skill.yaml         # HSM statechart manifest (v2.1.0)
├── STATECHART.md      # Visual statechart diagram
├── docs/
│   └── adr/
│       └── 0001-reactive-skill-schema-v2-migration.md
├── states/           # 20 isolated state prompts
│   ├── ready.md
│   ├── parsing.md
│   ├── detecting.md
│   ├── planning.md
│   ├── approving.md
│   ├── executing.md
│   ├── verifying.md
│   ├── rolling_back.md
│   ├── projecting.md
│   ├── success.md
│   ├── error.md
│   ├── backing_up_migrate.md
│   ├── inferring_legacy.md
│   ├── grilling_migrate.md
│   ├── inspecting_reactive.md
│   ├── planning_migrate.md
│   ├── approving_migrate.md
│   ├── executing_migrate.md
│   ├── verifying_migrate.md
│   └── restoring_migrate.md
├── guards/
└── templates/
    ├── manifest_snapshot.md.hbs
    └── inventory.json.hbs
```
