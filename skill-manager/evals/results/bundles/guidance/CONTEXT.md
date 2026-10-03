# Skill Manager - Domain Context

Skill Manager is a reactive skill that manages the full lifecycle of skills in the ByteQuilt skills ecosystem.

## Contents

- [Language](#language)
- [Authoring paths and runtime](#authoring-paths-and-runtime)
- [State authoring contract](#state-authoring-contract)
- [Operations](#operations)
- [Legacy migration](#migrate_legacy-flow)
- [Reactive migration](#migrate_reactive-flow)
- [Error handling](#error-handling)
- [MCP integration](#mcp-integration)
- [Schema versions](#schema-versions)
- [Skill type taxonomy](#skill-type-taxonomy)

## Language

**Legacy Skill**:
A skill that has only a SKILL.md file (and optionally scripts/, references/, assets/) but no skill.yaml. These were created before the reactive skill architecture and contain all instructions in one file.

**Reactive Skill (v1)**:
A skill with a skill.yaml (schema_version: "reactive/v1"), a states/ directory of isolated prompt slices, and optionally guards/ and templates/. The FSM drives execution through discrete states.

**Reactive Skill (v2)**:
A reactive skill with schema_version "2.0.0", SQLite event storage, runtime-served state prompts, composite states, guard contracts, and live deliverable projections.
Token use and task quality depend on the executor, harness, and measured workflow; this description establishes no savings claim.

**Skill Release Version**:
The public SemVer release of a skill, declared in `skill.yaml.version` and mirrored exactly by `skill-release.json.version`.

**Reactive Schema Version**:
The compatibility identifier declared in `skill.yaml.schema_version` for the Reactive Skills manifest and runtime schema.
It identifies the manifest format used by this skill.
Skill Manager migration targets and supported input schemas are documented independently.

**Release Manifest Format Version**:
The integer `schemaVersion` in `skill-release.json`, which versions the JSON release-manifest format independently from the skill and Reactive Skills schema versions.

**Skill Type**:
A classification of a reactive skill's domain and operational characteristics. Skill types inform architectural shape selection, middleware hook requirements, and verification criteria during the PLANNING phase. Types are: `tool`, `agent`, `workflow`, `orchestrator`, `data_pipeline`, `domain_model`.

**RED Phase**:
An optional requirements phase enabled via `context.red_phase === true`.
During PLANNING, record all seven answers: domain boundaries, failure modes, secrets surface, human input, observability, concurrency, and model tiers plus verification coverage.
Reuse supplied answers and resolve missing decisions before architectural scaffolding.

**Guard Circumvention Testing**:
A verification methodology in the VERIFYING state that validates guards actually block unauthorized transitions. Uses static guard analysis plus runtime payload injection to confirm violating payloads are rejected and satisfying payloads are accepted.

**Operation**:
One of CREATE, UPDATE, DELETE, MIGRATE_LEGACY, MIGRATE_REACTIVE. The operation determines which branch of the state machine executes.

**Signal**:
A named event emitted by a state or tool that triggers a transition. Signals are typed (USER_INVOKED, PARSED, USER_APPROVED, etc.) and flow through a signal bus.

**Guard**:
A boolean expression evaluated before a transition fires. If false, the transition is blocked. Guards are deterministic and reference context variables (e.g., exit_code === 0).

**Deliverable Projection**:
A Handlebars template rendered by the runtime from execution state, with file output under the runtime workspace and optional SQLite output.
Named runs have job-specific archives; unqualified file mirrors depend on the active job.
Inspect actual paths and contents before claiming output presence or absence.

## Authoring paths and runtime

`authoring_source` is the absolute registered source explicitly selected for task writes.
`target_skill_dir` is the absolute target within that source, or its contained planned path for CREATE.
`manager_skill_dir` is the absolute selected manager package used for invocation, templates, and bundled checks.
Resolve the source and existing target/parent canonically; reject distribution and agent-local destinations even when linked.
Use these paths throughout detection, authoring, migration, verification, and rollback.
A migration backup resolves inside `<authoring_source>/.backup/<skill_name>/<timestamp>/`.

Read-only preflight checks the existing runtime_requirements contract before authoring.
The verified floor is runtime 0.16.0 with runtime.bootloader, runtime.preflight, and runtime.transport_handshake.
Unavailable requirements stop authoring without automatic installation or provider configuration.
Invoke the absolute manager path once, then retain the returned run UUID and transport for every state query and signal.
Manager inspection and state-before-invoke can create extra jobs; use preflight or manifest reads for metadata.
The bundled checker verifies references and reports advisory navigation/size findings; the runtime owns manifest semantics.
Runtime projections resolve against the runtime workspace, not `target_skill_dir`.
Enumerate `.docs/skill-manager/`, correlate `jobs/<resolved-job-name-or-UUID>/` with the retained run, and verify its contents before reporting completion.
An absent unqualified mirror alone never proves that the archive is missing.
Use ledger events for exact transition times; a projection timestamp may describe earlier rendered data.

## State authoring contract

Each state defines its objective, consumed context, allowed actions, observable exit, and actual signals.
Keep essential constraints in the served state slice when they would otherwise be unavailable.

| State purpose | Decisions and actions | Exit evidence |
|---|---|---|
| Planning | Compare suitable shapes, clarify unresolved requirements, and scope exact files | Selected shape and rationale, protected invariants, bounded manifest, and seven RED answers when enabled |
| Execution | Apply the approved operations in the canonical source | Actual changes, command results, protected-file checks, and operation exit code |
| Verification | Check requested outcomes, structure, guards, and runtime-owned outputs | Observable assertions, errors versus advisories, coverage limits, and explicit verification exit code |

Use specific acceptance checks where they constrain behavior.
An identical generic checklist is not required in every prompt.
Nested HSMs use `substates`, `initial_substate`, dotted targets, nested prompt paths, and declared parent handlers.
The runtime owns schema interpretation, bootloader logic, ledgers, and projections.

Prompt budgets are state-specific and provisional until supporting evaluations establish an operating limit.
Raw source whitespace words, rendered words, and actual host tokens are separate measurements.
Record unmeasured rendered words and tokens as null.
The registered authoring source's `evals/state-contracts.json` retains the reviewed invariant inventory, source measurements, selected evaluation digest, and budget status.
Behavioral evidence is retained under `evals/results/` in the registered authoring source; reduced source size alone proves no task-quality or token improvement.
Current evaluation scope is the selected Codex CLI profile, with supplemental desktop checks recorded separately.
Semantic model tiers express intended capabilities; only actual host evidence establishes executor coverage.
Contract validation checks recorded measurements and evidence identities; human review and behavioral trials establish whether the instructions preserve required behavior.
Do not add a nonstandard model field to SKILL frontmatter.

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
4. BACKING_UP: Copy entire skill directory to <authoring_source>/.backup/<skill_name>/<timestamp>/
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
4. BACKING_UP: Copy entire skill directory to <authoring_source>/.backup/<skill_name>/<timestamp>/
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

| Reactive schema identifier | Use |
|----------------------------|-----|
| `reactive/v1` | Legacy Reactive Skills manifest identifier used by migration detection. |
| `2.0.0` | Reactive Skills manifest compatibility identifier used by some registry skills. |
| `2.1.0` | Reactive Skills manifest compatibility identifier used by some registry skills. |
| `2.2.0` | Reactive Skills manifest compatibility identifier used by some registry skills. |

Current registry schema identifiers use SemVer syntax and are compared literally.
The schema compatibility version is independent from the skill's public release SemVer.
Skill Manager migration targets and supported input schemas are documented independently from the schema identifier of this skill's own manifest.

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
