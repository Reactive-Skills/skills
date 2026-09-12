# ⚡ Reactive Skills Registry

> Official community catalog of verified, production-grade **Reactive Skills** powered by the [Reactive Skills Architecture](https://github.com/Reactive-Skills/reactive-skills).

---

## 📑 Table of Contents

- [📥 Installation](#-installation)
- [📋 Available Skills Catalog](#-available-skills-catalog)
- [🔍 Skills Overview](#-skills-overview)
  - [`mutation-tester`](#mutation-tester)
  - [`resume-manager`](#resume-manager)
  - [`skill-manager`](#skill-manager)
- [🛠️ Execution & Requirements](#️-execution--requirements)
- [🔄 Maintaining the Table of Contents](#-maintaining-the-table-of-contents)
- [🤝 Contributing Skills](#-contributing-skills)
- [📜 License](#-license)

---

## 📥 Installation

Install any skill directly into your agent environment using `skills.sh` (`npx skills`):

```bash
# Install a specific skill
npx skills add Reactive-Skills/skills --skill mutation-tester
npx skills add Reactive-Skills/skills --skill resume-manager
npx skills add Reactive-Skills/skills --skill skill-manager

# Or install all official skills
npx skills add Reactive-Skills/skills
```

---

## 📋 Available Skills Catalog

<!-- TOC_START -->

| Skill | Version | Schema | Description |
| :--- | :--- | :--- | :--- |
| [`mutation-tester`](mutation-tester/) | `v1.0.0` | `v2.2.0` | Technology-agnostic mutation testing reactive skill powered by high-performance Go CLI engine. |
| [`resume-manager`](resume-manager/) | `v2.2.0` | `v2.1.0` | Consolidated reactive career management engine. Orchestrates master profile bootstrapping, continuous achievement maintenance, multi-track profile specialization (Senior Technical, Practical Mid-Level, Operations Management, Client Solutions, and Adjacent Industry), and job application tailoring with automated overqualification and anti-flight risk calibration. |
| [`skill-manager`](skill-manager/) | `v1.0.0` | `v2.1.0` | Full CRUD lifecycle management for reactive skills - CREATE UPDATE DELETE MIGRATE_LEGACY and MIGRATE_REACTIVE with pre-COMMIT approval best-effort rollback and manifest snapshot projection |

<!-- TOC_END -->

---

## 🔍 Skills Overview

### `mutation-tester`
- **Directory**: [`mutation-tester/`](mutation-tester/)
- **Version**: `1.0.0` | **Schema**: `skill.yaml v2.2.0`
- **Core Engine**: Pure-Go static binary (`mutate.exe`) with zero CGo dependencies.
- **Capabilities**:
  - AST-level mutation operators for boundaries (`<`, `<=`, `>`, `>=`), equality (`==`, `!=`), arithmetic (`+`, `-`, `*`, `/`), boolean logic (`&&`, `||`), and boolean returns (`return true`/`false`).
  - Multi-ecosystem runner auto-detection (`go test`, `npm test`, `pytest`, `cargo test`, `dotnet test`, `mvn test`) with closest-ancestor resolution for polyglot monorepos.
  - Differential scoping (`--diff`) to restrict fault injection strictly to git-modified lines.
  - Fail-safe sandbox with in-place swap, `.mutation_orig` backups, and guaranteed atomic rollback.
  - Structured Markdown (`mutation_scorecard.md`) and JSON (`mutation_report.json`) reporting.

### `resume-manager`
- **Directory**: [`resume-manager/`](resume-manager/)
- **Version**: `2.2.0` | **Schema**: `skill.yaml v2.1.0`
- **Capabilities**:
  - Full-lifecycle career profile management and achievement capture.
  - Multi-track specialization across 5 profile archetypes: Senior Technical, Practical Mid-Level, Operations Management, Client Solutions, and Adjacent Industry.
  - Automated job description alignment, keyword matching, and anti-flight risk / overqualification calibration.
  - Tailored ATS resumes, cover letters, and interview preparation packages.

### `skill-manager`
- **Directory**: [`skill-manager/`](skill-manager/)
- **Version**: `1.0.0` | **Schema**: `skill.yaml v2.1.0`
- **Capabilities**:
  - Full CRUD lifecycle management for reactive skills: `CREATE`, `UPDATE`, `DELETE`, `MIGRATE_LEGACY`, and `MIGRATE_REACTIVE`.
  - Scaffolding of state charts, isolated state prompts, templates, and transition guards.
  - Pre-commit approval workflows and manifest snapshot projections.

---

## 🛠️ Execution & Requirements

Reactive skills execute immediately via **`npx`** (zero install required) or via the globally installed CLI:

```bash
# Zero install — works out of the box for any agent:
npx -y @reactive-skills/axi state <skill>
npx -y @reactive-skills/axi emit <skill> <signal>

# Optional: Install globally for instant local commands (reactive-skills-axi / axi):
npm install -g @reactive-skills/axi
```

---

## ✅ Validating Skills

This repository includes a skill validator that performs structural manifest verification, prompt template checks, bootloader presence, and runtime statechart compilation via `@reactive-skills/axi`:

```bash
# Validate all skills in the repository:
node scripts/validate-skills.js

# Validate a specific skill:
node scripts/validate-skills.js mutation-tester

# Or inspect a skill directly via AXI CLI:
npx -y @reactive-skills/axi inspect mutation-tester
```

---

## 🔄 Maintaining the Table of Contents

This repository includes an automated script that scans all `skill.yaml` files and regenerates the Table of Contents in `README.md`:

```bash
# Update README.md with newly added or modified skills:
node scripts/update-toc.js

# Verify the Table of Contents is up to date (useful in CI):
node scripts/update-toc.js --check
```

---

## 🤝 Contributing Skills

We welcome community-contributed reactive skills! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on statechart modeling, deterministic guards, and test verification.

---

## 📜 License

Skills in this repository are licensed under the **MIT License**.
