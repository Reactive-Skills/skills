# Skill Manager — Domain Context

Skill Manager is a reactive skill that manages the full lifecycle of skills in the ByteQuilt skills ecosystem.

## Language

**Legacy Skill**:
A skill that has only a SKILL.md file (and optionally scripts/, references/, assets/) but no skill.yaml. These were created before the reactive skill architecture and contain all instructions in one file.

**Reactive Skill (v1)**:
A skill with a skill.yaml (schema_version: "reactive/v1"), a states/ directory of isolated prompt slices, and optionally guards/ and templates/. The FSM drives execution through discrete states.

**Reactive Skill (v2)**:
A reactive skill with schema_version "2.0.0", SQLite event store, MCP server integration, and Just-In-Time prompt loading (~70% token reduction vs v1). Introduces composite states, Zod-validated guards, and live deliverable projections from the event stream.

**Skill Type**:
A classification of a reactive skill's domain and operational characteristics. Skill types inform architectural shape selection, middleware hook requirements, and verification criteria during the PLANNING phase. Types are: `tool`, `agent`, `workflow`, `orchestrator`, `data_pipeline`, `domain_model`.

**RED Phase**:
An optional pre-design requirements engineering phase enabled via `context.red_phase === true`. Runs during PLANNING to elicit domain boundaries, failure modes, secrets surface, human-in-loop checkpoints, observability needs, and concurrency considerations before architectural scaffolding begins.

**Guard Circumvention Testing**:
A verification methodology in the VERIFYING state that validates guards actually block unauthorized transitions. Uses static guard analysis plus runtime payload injection to confirm violating payloads are rejected and satisfying payloads are accepted.

**Operation**:
One of CREATE, UPDATE, DELETE, MIGRATE_LEGACY, MIGRATE_REACTIVE. The operation determines which branch of the state machine executes.

**Signal**:
A named event emitted by a state or tool that triggers a transition. Signals are typed (USER_INVOKED, PARSED, USER_APPROVED, etc.) and flow through a signal bus.

**Guard**:
A boolean expression evaluated before a transition fires. If false, the transition is blocked. Guards are deterministic and reference context variables (e.g., exit_code === 0).

**Deliverable Projection**:
A Handlebars template rendered from the event stream upon reaching a terminal state. Written to .docs/ and optionally to SQLite.

## Operations

| Operation | Description |
|-----------|-------------|
| CREATE | Scaffold a new reactive skill from scratch |
| UPDATE | Modify an existing reactive skill's states, guards, or templates |
| DELETE | Remove a reactive skill entirely |
| MIGRATE_LEGACY | Convert a legacy SKILL.md skill to reactive (v1 or v2) |
| MIGRATE_REACTIVE | Upgrade a reactive skill from v1 to v2.0.0 |

## MIGRATE_LEGACY Flow

1. READY: Await skill_name + operation=MIGRATE_LEGACY
2. PARSING: Resolve operation
3. DETECTING: Verify SKILL.md exists, skill.yaml does NOT exist (confirms legacy)
4. BACKING_UP: Copy entire skill directory to skills/.backup/<skill_name>/<timestamp>/
5. INFERRING: Parse SKILL.md for phases, numbered steps, or workflow sections. Auto-infer states with >50% confidence. Ask targeted questions if confidence <50%.
6. PLANNING: Generate migration plan (states/ to create, SKILL.md modifications, README.md creation, guards/, templates/ scaffolding)
7. APPROVING: Show plan to user, await USER_APPROVED or USER_REJECTED
8. EXECUTING: Write skill.yaml, README.md, split states/, scaffold guards/ and templates/
9. VERIFYING: Confirm skill.yaml is valid, all states/ files exist, skill is loadable
10. ROLLING_BACK: On failure, delete reactive structure, restore from .backup/
11. PROJECTING: Write migration report to .docs/
12. SUCCESS | ERROR

## MIGRATE_REACTIVE Flow

1. READY: Await skill_name + operation=MIGRATE_REACTIVE
2. PARSING: Resolve operation
3. DETECTING: Verify skill.yaml exists with schema_version "reactive/v1"
4. BACKING_UP: Copy entire skill directory to skills/.backup/<skill_name>/<timestamp>/
5. INSPECTING: Read v1 skill.yaml, compare with v2.0.0 schema, compute delta (new fields, reorganized sections, new event store config)
6. PLANNING: Generate migration plan (skill.yaml rewrites, states/ reorganization, SQLite init, MCP config, README.md)
7. APPROVING: Show plan to user, await USER_APPROVED or USER_REJECTED
8. EXECUTING: Rewrite skill.yaml to v2.0.0, reorganize states/, ensure README.md is present/updated, init SQLite event store, add MCP server config
9. VERIFYING: Confirm skill.yaml is valid v2.0.0, SQLite initialized, all states/ loadable
10. ROLLING_BACK: On failure, delete v2.0.0 structure, restore from .backup/
11. PROJECTING: Write migration report to .docs/
12. SUCCESS | ERROR

## Error Handling

Failure cascade: VERIFYING fails ? ROLLING_BACK attempts best-effort rollback ? ERROR.
- MIGRATE_LEGACY rollback: delete reactive structure, leave legacy intact
- MIGRATE_REACTIVE rollback: restore entire directory from .backup/

Errors are logged to .docs/skill-manager-errors.md and included in the final projection.

## MCP Integration

The reactive-skills MCP server exposes a reactive_migrate tool. The skill-manager reactive skill IS the implementation behind that tool. When the MCP server receives a migrate request, it delegates to the skill-manager state machine.

## Schema Versions

| Version | schema_version value | Key Features |
|---------|---------------------|--------------|
| v1 | "reactive/v1" | HSM, signal bus, isolated states, guards, projections |
| v2.0.0 | "2.0.0" | +SQLite event store, MCP server, JIT prompts, composite states, Zod guards |

## Skill Type Taxonomy

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
