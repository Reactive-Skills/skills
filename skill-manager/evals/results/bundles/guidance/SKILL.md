---
name: skill-manager
description: >-
  Full CRUD lifecycle management for reactive skills. Uses reactive-skills-axi CLI for execution. Authors only in the explicitly selected registered source and uses absolute paths. Use when the user wants to CREATE a new reactive skill, UPDATE an existing skill's states/manifest, DELETE a skill, MIGRATE_LEGACY a SKILL.md-only skill to reactive format, or MIGRATE_REACTIVE a v1 reactive skill to v2.0.0. Triggers on: "create a reactive skill", "manage skills", "skill lifecycle", "scaffold a skill", "install a skill", "remove a skill", "migrate a skill", "convert skill to reactive", "upgrade reactive skill", or any skill management request.
metadata:
  author: Reactive-Skills
  version: "2.1.0"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "skill-manager"`.
> - AXI: run `reactive-skills-axi bootloader skill-manager --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader skill-manager --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
<!-- END REACTIVE BOOTLOADER -->

# Skill Manager

Manages the complete lifecycle of reactive skills using a Hierarchical State Machine (HSM) model. Executes via reactive-skills-axi CLI.

## Startup and authoring paths

Use the selected manager's absolute directory as `manager_skill_dir`.
An explicitly supplied frozen evaluation bundle is also a valid read-only manager path.
For real authoring, load the manager from its registered authoring source; a name-only lookup can select an older distributed copy.
The bootloader command takes the name `skill-manager`; preflight, invoke, state, and emit take the absolute manager directory.

1. Retrieve the runtime-owned bootloader pointer above and choose one working transport.
2. Run read-only preflight on `manager_skill_dir` before invocation.
Use AXI `preflight "<manager_skill_dir>" --json` or the selected MCP transport's advertised compatibility operation.
Require the manifest's runtime 0.16.0 floor and three capabilities; no Jev provider is required.
On an unavailable or incompatible prerequisite, report the exact requirement and stop without installing or configuring anything.
3. Invoke the manager once with a job alias and the known task context.
Capture the returned run UUID, then use that UUID and the same transport for every later state query and signal.
Never run manager `inspect`, query a new job before invocation, or invoke again just to discover metadata.
Those operations can create additional jobs.
Use preflight or direct reads of the manager manifest for metadata throughout the run.
4. Read the current environment's registered authoring sources using `sync --show-config` or its source registry.
Honor the user's explicitly selected registered source.
If the intended source is still ambiguous, resolve that selection before writing.
Record absolute `authoring_source` and `target_skill_dir`.
5. Reject distribution and agent-local destinations before following links, including the registry's central and satellite paths.
Resolve the selected source and existing target or parent canonically; verify the target remains strictly inside that source.
Reject traversal, source-root deletion, and links escaping the chosen source.
For CREATE, validate the existing source/parent plus planned target without requiring the target to exist.
6. Throughout this run, including migration and rollback, resolve target operations against `target_skill_dir` and backups against the chosen `authoring_source`.
Relative `skills/<name>` examples in older prompts never override these recorded paths.
Recheck containment before a destructive operation.
Task writes require the approved file plan; existing approval remains valid within its scope.

Use `manager_skill_dir` to locate bundled templates and [the authoring checker](scripts/authoring-quality.cjs), independent of CWD.
For CREATE/UPDATE, run `node "<manager_skill_dir>/scripts/authoring-quality.cjs" "<target_skill_dir>" --json` and the selected runtime's `validate "<target_skill_dir>"`.
The checker reports definite file-reference/input errors, advisory navigation/size findings, and whitespace word measurements.
It does not parse the manifest schema, estimate tokens, or establish behavioral quality.
Warnings alone do not fail this checker.
For DELETE, verify the approved target is absent instead of running a checker on a deleted directory.

## State authoring contract

Each state needs its objective, consumed context, allowed actions, observable exit, and actual signal names.
Keep essential state-local invariants available in the served slice.
Planning permits design judgment and resolves open requirements; execution follows the approved manifest; verification checks observable outcomes.
Use specific acceptance checks where needed without requiring identical generic checklist prose.

When RED discovery is enabled, preserve all seven answers, including model tiers and actual verification coverage.
Use `substates` and `initial_substate` for nested HSMs, dotted targets, nested prompt paths, and declared parent handlers.
Validate actual structure and guard behavior before attributing failures to the runtime.
Keep approval, canonical source containment, bootloader ownership, verification guards, and rollback routing intact.

Measure raw source words separately from rendered words and host tokens.
State-specific budgets remain provisional until supported by evaluation evidence; no universal 200-word gate applies.
The registered authoring source's `evals/state-contracts.json` retains reviewed invariants and measurements.
Its `evals/results/` records identify actual tested models and harnesses.
Semantic model tiers do not guarantee host routing, and SKILL frontmatter has no added model-selection field.

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
- READY - Await skill_name and operation
- PARSING - Resolve operation type
- DETECTING - Verify skill existence, legacy status, or v1 reactive status
- PROJECTING - Write manifest snapshot + inventory
- SUCCESS | ERROR - Terminal states

### CREATE / UPDATE / DELETE Branch
1. PLANNING - Produce a bounded file plan, shape rationale, and seven RED answers when enabled; evaluate supported middleware within that scope
2. APPROVING - Pre-COMMIT user approval gate
3. EXECUTING - Apply only the approved file manifest within the canonical source; create middleware files only when declared, supported, and included in that plan
4. VERIFYING - Validate operation success
5. ROLLING_BACK - Best-effort rollback on failure

### MIGRATE_LEGACY / MIGRATE_REACTIVE Branch
1. BACKING_UP_MIGRATE - Full backup inside <authoring_source>/.backup/<skill>/<timestamp>/
2. INFERRING_LEGACY - Parse SKILL.md, infer states, score confidence
3. GRILLING_MIGRATE - Socratic questions if confidence < 50%
4. INSPECTING_REACTIVE - Diff v1 → v2.0.0 schema (MIGRATE_REACTIVE only)
5. PLANNING_MIGRATE - Generate migration plan
6. APPROVING_MIGRATE - Pre-COMMIT user approval gate
7. EXECUTING_MIGRATE - Write reactive structure (including README.md) or upgrade schema
8. VERIFYING_MIGRATE - Validate migrated skill is loadable
9. RESTORING_MIGRATE - Restore from backup on failure

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

File tools apply the approved file plan in `target_skill_dir`.
The runtime records workflow context and signals; `state` does not author task files.
Use the absolute paths and single-invocation sequence documented above.

## Deliverables

Resolve projection paths against the runtime workspace, separately from the registered task authoring source.
After reaching PROJECTING and before reporting completion, enumerate the actual files under that workspace's `.docs/skill-manager/`.
Correlate the archive with the retained run UUID and its resolved job name; named runs normally write under `jobs/<resolved-job-name-or-UUID>/`.
Read the snapshot and inventory contents to verify the target skill, operation, and observed state.
The unqualified paths are optional active-job mirrors; an absent mirror does not establish that the run produced no outputs.
Report the paths and contents actually verified, and identify any incomplete coverage.
Projection timestamps describe the rendered data; use ledger events when reporting exact transition or completion times.
The runtime owns projections; do not fabricate or manually repair them.

The job archive contains `<skill_name>-snapshot.md` and `inventory.json`.
The templates summarize the current skill and operation; their file list depends on recorded context.
The manifest also declares the SQLite `skill_inventory` projection; claim its contents only when independently verified.

## Runtime Persistence Contract

The runtime owns execution persistence.

Each skill has one canonical SQLite ledger at `.reactive/skills/<skill>/events.db`.

`.reactive/skills/<skill>/events.jsonl` is a recoverable export and projection of SQLite, not an independent source of truth.

Each run has an immutable generated UUID-backed `run_id` and isolated filesystem state at `.reactive/skills/<skill>/runs/<run_id>/`.

The run directory contains `job.json`, `artifacts/`, and `logs/`.

Run aliases are display labels only and may be changed without changing event identity.

Use `reactive-skills-axi jobs <skill>` to inspect aliases and UUIDs.

Use `reactive-skills-axi rebuild-sqlite <skill>` only for explicit JSONL import or repair.

## Guard & Judgment Syntax

Guards use JavaScript expression syntax (not Python). Use `!= null`, `!== null`, `||`, `&&`.

```yaml
# Wrong (Python-like):
guard: 'context.job_description_url != null or context.company_name != null'

# Correct (JavaScript):
guard: 'context.job_description_url != null || context.company_name != null'
```

### Snap-On Judgments (Decoupled Model Verification)
Transitions can declare a `judgment:` contract evaluated by the runtime's snap-on adapter cascade (e.g. TypeSafe Jev -> Ambient LLM -> Local Script):

```yaml
transitions:
  VERIFY_ACCEPTED:
    target: APPROVED
    judgment:
      type: predicate # predicate (boolean) | categorical (choice) | evaluation (score)
      criterion: "Did all security scans and unit test suites pass with zero regressions?"
      min_confidence: 0.85
      fallback_target: ESCALATED_REVIEW # Routes here if verification fails or confidence is low
```

## Model Capability Tiers

States can declare semantic capability requirements in `skill.yaml` without hardcoding vendor IDs:

```yaml
states:
  triage:
    description: "Lightweight triage step"
    model:
      tier: fast # fast (flash/haiku) | balanced (sonnet/gpt-4o) | reasoning (o3/sonnet-thinking) | decision (jev)
      suggested: "gemini-2.5-flash / haiku"
      temperature: 0.1

  architect_solution:
    description: "Deep design synthesis"
    model:
      tier: reasoning
      suggested: "claude-3-7-sonnet / o3-mini"
```

## Error Handling

Failure cascade: VERIFYING fails → ROLLING_BACK (or RESTORING_MIGRATE) attempts best-effort restore → ERROR.
- MIGRATE_LEGACY rollback: delete reactive structure, leave legacy intact
- MIGRATE_REACTIVE rollback: restore entire directory from .backup/
- Errors logged to .docs/skill-manager-errors.md

## Middleware Hooks for CREATE

When scaffolding via CREATE, assess middleware needs during PLANNING using the supplied requirements and seven RED answers.
Declare and implement only hooks supported by the selected runtime and included in the approved manifest.
Resolve unknown support before approval; record justified omissions.
Middleware is runtime behavior, not evidence that the host executed a particular model.

### Hook Types

| Hook | Trigger | Purpose |
|------|---------|---------|
| `telemetry` | post_transition | Emit transition events to observability bus |
| `audit` | post_transition | Immutable transition audit log |
| `metrics` | post_transition | Prometheus-compatible metrics |
| `invariant_checker` | post_transition | Verify context constraints after each transition |
| `context_sanitizer` | pre_transition | Redact secrets before context reaches LLM |

### Discovery Questions (PLANNING phase)

Reuse supplied answers; ask only for unresolved requirements:
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

When supported middleware is declared and approved, generate only the corresponding files in the approved manifest.
The following layout illustrates possible files, not a mandatory scaffold:

```
<target_skill_dir>/
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

Verify each declared hook's module and signature against the selected runtime.
Do not claim sanitization, auditing, or invariant enforcement without observed evidence.

## Migration Confidence

MIGRATE_LEGACY uses auto-infer with a 50% confidence threshold. Below 50%, the skill runs targeted Socratic questions before proceeding. This is configurable via context.migrate_mode (AUTO_INFER or GRILL_ON_AMBIGUITY).

## CLI / MCP Integration

Use the selected working AXI launcher or MCP transport throughout the run.
Read the three path values from context rather than resolving the manager by its distributed name.

### State Machine Stepping Workflow

```text
reactive-skills-axi preflight "<manager_skill_dir>" --json
reactive-skills-axi invoke "<manager_skill_dir>" --job <new-alias> --payload <initial-context-json>
reactive-skills-axi state "<manager_skill_dir>" --job <returned-run-uuid>
reactive-skills-axi emit "<manager_skill_dir>" <current-event-id> <SIGNAL> --job <returned-run-uuid> --payload <signal-json>
```

The placeholders describe arguments, not literal shell syntax; serialize JSON with the host's supported quoting or a payload file.
Invoke accepts `--payload @filepath.json` when a file is needed.
Capture the current event ID from the runtime response for each signal.
Passing it explicitly also avoids the long-signal parsing issue in unpatched AXI 0.16.0 builds.
Never query a new job before invoke or inspect the manager; both can create an extra run.
Read-only metadata checks use preflight or manifest reads.

The runtime owns the canonical SQLite ledger and its recoverable JSONL export.
Do not edit either to advance the workflow.

## Skill Package Structure

```
skill-manager/
├── SKILL.md           # This file (LLM instructions with runtime bootloader pointer)
├── README.md          # Human-facing documentation, catalog overview & usage
├── skill.yaml         # HSM statechart manifest (v2.1.0)
├── STATECHART.md      # Visual statechart diagram
├── CONTEXT.md         # Domain and source-path contract
├── scripts/
│   └── authoring-quality.cjs
├── states/           # 22 isolated state prompts
│   ├── init.md
│   ├── setup_runtime.md
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
