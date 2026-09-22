# 🛠️ skill-manager

> Full CRUD lifecycle management for reactive skills — `CREATE`, `UPDATE`, `DELETE`, `MIGRATE_LEGACY`, and `MIGRATE_REACTIVE` with pre-commit approval gates, best-effort rollback, and manifest snapshot projections.

[![Schema Version](https://img.shields.io/badge/schema-v2.1.0-blue.svg)](skill.yaml)
[![Skill Version](https://img.shields.io/badge/version-v1.0.0-green.svg)](skill.yaml)
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
| `MIGRATE_REACTIVE` | Upgrades a reactive skill across schema versions (e.g. v1 to v2.1.0/v2.2.0), updating event store configurations and bootloaders. | Upgrading schema and capabilities. |

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
4. **`VERIFYING`**: Validates the new/modified skill with `@reactive-skills/axi inspect`, bi-directional hygiene checks (no orphan templates or empty folders), and syntax checks.
5. **`ROLLING_BACK`**: Atomic cleanup on verification failure before transitioning to `ERROR`.

### Migration Branch (`MIGRATE_LEGACY` / `MIGRATE_REACTIVE`)
1. **`BACKING_UP_MIGRATE`**: Creates an isolated snapshot at `skills/.backup/<skill>/<timestamp>/`.
2. **`INFERRING_LEGACY`**: Parses legacy `SKILL.md`, infers workflow phases, and computes a confidence score.
3. **`GRILLING_MIGRATE`**: If confidence is below 50%, asks targeted Socratic questions to resolve ambiguous transitions.
4. **`INSPECTING_REACTIVE`**: Diffs older schema definitions against the target reactive schema.
5. **`PLANNING_MIGRATE`**: Generates a detailed migration plan.
6. **`APPROVING_MIGRATE`**: Pre-commit user approval gate.
7. **`EXECUTING_MIGRATE`**: Rewrites manifests, splits states, creates `README.md`, and injects universal bootloaders.
8. **`VERIFYING_MIGRATE`**: Confirms the migrated skill compiles and passes runtime validation.
9. **`RESTORING_MIGRATE`**: Guaranteed restoration from backup on failure.

---

## 📐 Scaffolding Standards

When `skill-manager` scaffolds a skill (`CREATE` or `MIGRATE_LEGACY`), it strictly adheres to these engineering standards:

1. **Dual Documentation**:
  - **`SKILL.md`**: Dedicated to the AI agent runtime. Contains YAML frontmatter, the canonical local-first runtime bootloader, and step instructions without human exposition.
   - **`README.md`**: Dedicated to human developers, catalog browsing, and GitHub navigation. Contains overview, architecture, installation, and CLI usage.
2. **Self-Contained State Prompts**: Each state in `states/**/*.md` specifies exact preconditions, actions, and exit signals. Subdirectories (`states/<phase>/`) are supported and encouraged for composite states.
3. **Anti-Shortcut Atomic Checklists**: Execution and terminal states include checklist rubrics to hold the executing agent accountable.
4. **Synchronized Statecharts**: `STATECHART.md` is automatically maintained to mirror the exact states and transitions in `skill.yaml` (including Mermaid `state PARENT { ... }` blocks for composite states).
5. **Canonical Runtime Templates**: `templates/reactive_bootloader.md.hbs`, `templates/init_state.md.hbs`, and `templates/bypass_detected.md.hbs` define local-first runtime guidance for future skills.

---

## 📥 Installation

Install into your agent workspace using `skills.sh` (`npx skills`):

```bash
npx skills add Reactive-Skills/skills --skill skill-manager
```

---

## 🚀 Execution & Usage

### CLI Mode (Shell)

```bash
# Inspect current state instructions
npx -y @reactive-skills/axi state skill-manager

# Scaffold a new reactive skill
npx -y @reactive-skills/axi invoke skill-manager --payload '{
  "operation": "CREATE",
  "skill_name": "api-sentinel"
}'

# Advance states via signals
npx -y @reactive-skills/axi emit skill-manager USER_INVOKED
```

### MCP Mode

Use MCP only when shell access to AXI is unavailable.
Do not troubleshoot `reactive_state` before trying AXI.

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
├── SKILL.md                # Agent entrypoint with universal reactive bootloader
├── skill.yaml              # HSM statechart manifest (schema_version: 2.1.0)
├── STATECHART.md           # Mermaid diagram of all lifecycle states
├── CONTEXT.md              # Architectural glossary and migration concepts
├── skill-release.json      # Release metadata
├── guards/                 # Deterministic transition guards
├── states/                 # 22 isolated state prompts (*.md)
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
    ├── manifest_snapshot.md.hbs
    └── inventory.json.hbs
```

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](../LICENSE) for details.
