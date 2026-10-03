# 🛠️ skill-manager

> Full CRUD lifecycle management for reactive skills - `CREATE`, `UPDATE`, `DELETE`, `MIGRATE_LEGACY`, and `MIGRATE_REACTIVE` with pre-commit approval gates, best-effort rollback, and manifest snapshot projections.

[![Schema Version](https://img.shields.io/badge/schema-v2.1.0-blue.svg)](skill.yaml)
[![Skill Version](https://img.shields.io/badge/version-v1.2.0-green.svg)](skill.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Supported Operations](#-supported-operations)
- [Lifecycle & State Machine](#-lifecycle--state-machine)
  - [Shared Workflow Phases](#shared-workflow-phases)
  - [CRUD Branch (`CREATE` / `UPDATE` / `DELETE`)](#crud-branch-create--update--delete)
  - [Migration Branch (`MIGRATE_LEGACY` / `MIGRATE_REACTIVE`)](#migration-branch-migrate_legacy--migrate_reactive)
- [Scaffolding Standards](#-scaffolding-standards)
- [Installation](#-installation)
- [Execution & Usage](#-execution--usage)
  - [CLI Mode (Shell)](#cli-mode-shell)
  - [MCP Mode](#mcp-mode)
- [Portable authoring checks](#portable-authoring-checks)
- [Deliverables](#-deliverables)
- [Directory Layout](#-directory-layout)
- [License](#-license)

---

## 🔍 Overview

`skill-manager` is the authoritative lifecycle automation engine for the Reactive Skills Architecture. It allows developers and AI agents to scaffold, update, delete, and migrate reactive skills reliably.

Every operation is governed by a deterministic Hierarchical State Machine (HSM) with pre-commit human/agent approval gates, strict verification against schema validators, and automatic rollback on failure.

---

## ⚙️ Supported Operations

| Operation | Description | Target Scenarios |
| :--- | :--- | :--- |
| `CREATE` | Scaffolds a complete reactive skill package from scratch (`skill.yaml`, `SKILL.md`, `README.md`, `CONTEXT.md`, `STATECHART.md`, `states/*.md`, `guards/`, `templates/`). | Building a new reactive skill. |
| `UPDATE` | Modifies an existing skill's statechart, prompt templates, or guards while keeping `STATECHART.md` and `README.md` synchronized. | Adding states or modifying transitions. |
| `DELETE` | Safely tears down a skill package and its associated artifacts. | Deprecating or removing skills. |
| `MIGRATE_LEGACY` | Analyzes a single-file legacy `SKILL.md` skill, infers states, grills ambiguities via Socratic inquiry, and splits it into a reactive skill. | Modernizing legacy agent skills. |
| `MIGRATE_REACTIVE` | Upgrades a reactive skill across schema versions (e.g. v1 to v2.1.0/v2.2.0), updating event store configurations and bootloader pointers. | Upgrading schema and capabilities. |

---

## 🔄 Lifecycle & State Machine

Defined in [`skill.yaml`](skill.yaml). For full Mermaid state diagrams, see [`STATECHART.md`](STATECHART.md).

### Shared Workflow Phases

```
[INIT] ──► [SETUP_RUNTIME] ──► [READY] ──► [PARSING] ──► [DETECTING]
                                                             │
                  ┌──────────────────────────────────────────┴────────────────────────┐
                  ▼                                                                   ▼
       (CREATE / UPDATE / DELETE)                                        (MIGRATE_LEGACY / MIGRATE_REACTIVE)
            CRUD Pipeline                                                        Migration Pipeline
                  │                                                                   │
                  └──────────────────────────────────────────┬────────────────────────┘
                                                             ▼
                                                       [PROJECTING] ──► [SUCCESS]
```

### CRUD Branch (`CREATE` / `UPDATE` / `DELETE`)
1. **`PLANNING`**: Evaluates intent against the HSM Litmus Test (cross-cutting signals, retry loops, lifecycle invariants). Proposes 2–3 candidate shapes (Flat Pipeline, Flat Iterative Loop, Hierarchical HSM) with a `[RECOMMENDED]` default, and maps out the directory layout (flat `states/*.md` or nested `states/<phase>/*.md`).
2. **`APPROVING`**: Pre-commit approval gate displaying the chosen shape, architectural rationale, and structured file manifest.
3. **`EXECUTING`**: Materializes files on disk (`skill.yaml`, `SKILL.md`, `README.md`, `CONTEXT.md`, `STATECHART.md`, `states/**/`, `guards/`, `templates/`), recursively creating subdirectories for composite states.
4. **`VERIFYING`**: Validates the new/modified skill with the runtime's `validate "<target_skill_dir>"` and bundled authoring checker, bi-directional hygiene checks (no orphan templates or empty folders), and syntax checks.
5. **`ROLLING_BACK`**: Atomic cleanup on verification failure before transitioning to `ERROR`.

### Migration Branch (`MIGRATE_LEGACY` / `MIGRATE_REACTIVE`)
1. **`BACKING_UP_MIGRATE`**: Creates an isolated snapshot at `<authoring_source>/.backup/<skill>/<timestamp>/`.
2. **`INFERRING_LEGACY`**: Parses legacy `SKILL.md`, infers workflow phases, and computes a confidence score.
3. **`GRILLING_MIGRATE`**: If confidence is below 50%, asks targeted Socratic questions to resolve ambiguous transitions.
4. **`INSPECTING_REACTIVE`**: Diffs older schema definitions against the target reactive schema.
5. **`PLANNING_MIGRATE`**: Generates a detailed migration plan.
6. **`APPROVING_MIGRATE`**: Pre-commit user approval gate.
7. **`EXECUTING_MIGRATE`**: Rewrites manifests, splits states, creates `README.md`, and replaces embedded bootloaders with the canonical runtime pointer.
8. **`VERIFYING_MIGRATE`**: Confirms the migrated skill compiles and passes runtime validation.
9. **`RESTORING_MIGRATE`**: Guaranteed restoration from backup on failure.

---

## 📐 Scaffolding Standards

When `skill-manager` scaffolds a skill (`CREATE` or `MIGRATE_LEGACY`), it strictly adheres to these engineering standards:

1. **Dual Documentation**:
  - **`SKILL.md`**: Dedicated to the AI agent runtime. Contains YAML frontmatter, a pointer to the runtime-served bootloader, and skill-specific usage guidance.
   - **`README.md`**: Dedicated to human developers, catalog browsing, and GitHub navigation. Contains overview, architecture, installation, and CLI usage.
2. **Self-Contained State Prompts**: Each state in `states/**/*.md` specifies exact preconditions, actions, and exit signals. Subdirectories (`states/<phase>/`) are supported and encouraged for composite states.
3. **Anti-Shortcut Atomic Checklists**: Execution and terminal states include checklist rubrics to hold the executing agent accountable.
4. **Synchronized Statecharts**: `STATECHART.md` is automatically maintained to mirror the exact states and transitions in `skill.yaml` (including Mermaid `state PARENT { ... }` blocks for composite states).
5. **Canonical Runtime Pointer**: `templates/reactive_bootloader.md.hbs` points to the bootloader served by the Reactive Skills runtime.
   The `init_state.md.hbs` and `bypass_detected.md.hbs` templates provide per-skill state prompts.

---

## 📥 Installation

Install into your agent workspace using `skills.sh` (`npx skills`):

```bash
npx skills add Reactive-Skills/skills --skill skill-manager
```

---

## 🚀 Execution & Usage

### CLI Mode (Shell)

Resolve the manager by its absolute authored source path.
Read `reactive-skills-axi sync --show-config` or the current environment's registry, honor the selected registered source, and record absolute `authoring_source`, `target_skill_dir`, and `manager_skill_dir`.
Reject distribution and agent-local destinations before following links, and verify canonical containment before any write.
A new CREATE target need not exist; validate its existing source/parent first.
If source selection is genuinely ambiguous, resolve it before authoring.

```text
reactive-skills-axi preflight "<manager_skill_dir>" --json
reactive-skills-axi invoke "<manager_skill_dir>" --job <new-alias> --payload <initial-context-json>
reactive-skills-axi state "<manager_skill_dir>" --job <returned-run-uuid>
reactive-skills-axi emit "<manager_skill_dir>" <current-event-id> <SIGNAL> --job <returned-run-uuid> --payload <signal-json>
```

Invoke once, then retain its returned run UUID, current event ID, and selected launcher for subsequent commands.
The initial context includes the operation, skill_name, and known absolute paths.
Use the host's supported JSON serialization or invocation payload-file syntax.
Avoid manager inspection or state queries before invocation; they create extra jobs.
Use preflight or direct manager manifest reads for metadata at any stage.
The bootloader retrieval command still takes the name `skill-manager`.
Runtime 0.16.0 with the declared bootloader, preflight, and transport-handshake capabilities is the verified floor; no Jev provider is required.
If a prerequisite is unavailable or incompatible, report it and stop before authoring or automatic setup.

### MCP Mode

If MCP was selected, use its advertised compatibility, invocation, state, and signal operations with the same absolute manager path and run identity.
Keep that transport throughout the run.

## Portable authoring checks

The [bundled Node helper](scripts/authoring-quality.cjs) works from any CWD without registry scripts, dependencies, or providers.

```text
node "<manager_skill_dir>/scripts/authoring-quality.cjs" "<target_skill_dir>" --json
reactive-skills-axi validate "<target_skill_dir>"
```

Its exported `checkAuthoringQuality(skillRoot)` and CLI return schema_version 1, errors, warnings, and per-file line/body-line/whitespace-word measurements.
Each finding includes code, relative path, line, and explanation.
Exit 1 means a definite broken package reference or unreadable checker input; advisories keep exit 0, and invalid CLI usage exits 2.
The checker scans root Markdown and authored supporting directories, excluding tests, evaluations, dependencies, and runtime ledgers.
It checks concrete inline/reference Markdown file links and literal manifest prompt_template fields while preserving nested state paths.
Code examples, URLs, fragments, and unresolved Handlebars placeholders are excluded; outside-package paths remain advisory without reading their content.
Nonliteral YAML scalars require runtime validation.
Supporting documents over 100 lines need working contents/navigation; SKILL.md bodies over 500 lines receive an advisory.
These measurements establish neither token savings nor behavioral quality, and there is no universal state word limit in this checker.
For DELETE, verify absence instead of checking the removed target.

Registry development imports this same helper for skill-manager by default.
Opt in for other selected skills with `node scripts/validate-skills.js <skill-name> --no-runtime --authoring-quality`; existing registry structural checks remain in place.
After validated authoring, use source-aware sync if already approved, otherwise request approval for the explicit source/skill command.

---

## 📦 Deliverables

On successful execution, `skill-manager` produces:
- **`.docs/skill-manager/<skill_name>-snapshot.md`**: Manifest snapshot detailing files touched and transition history.
- **`.docs/skill-manager/inventory.json`**: Machine-readable inventory of all active skills in the repository.
- **SQLite `skill_inventory` Table**: Persisted records of all managed skills and schemas.

---

## 📂 Directory Layout

```
skill-manager/
├── README.md               # Human-facing documentation (this file)
├── SKILL.md                # Agent entrypoint with runtime bootloader pointer
├── skill.yaml              # HSM statechart manifest (schema_version: 2.1.0)
├── STATECHART.md           # Mermaid diagram of all lifecycle states
├── CONTEXT.md              # Architectural glossary and migration concepts
├── skill-release.json      # Release metadata
├── scripts/
│   └── authoring-quality.cjs # Portable read-only authoring checks
├── evals/                  # Behavioral scenarios and measured evidence
├── tests/                  # Offline helper/evidence tests
├── guards/                 # Deterministic transition guards
├── states/                 # 22 isolated state prompts (*.md)
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
└── templates/              # Projection templates (*.hbs)
    ├── reactive_bootloader.md.hbs
    ├── init_state.md.hbs
    ├── bypass_detected.md.hbs
    ├── manifest_snapshot.md.hbs
    └── inventory.json.hbs
```

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](../LICENSE) for details.
