# ⚡ Reactive Skills Registry

> Official catalog of **Reactive Skills** powered by the [Reactive Skills Architecture](https://github.com/Reactive-Skills/reactive-skills).

Each skill is a hierarchical state machine with isolated state prompts, deterministic guards, and projected deliverables.
Browse the catalog online at [reactive-skills.com/registry](https://reactive-skills.com/registry/).

---

## 📑 Table of Contents

- [📥 Installation](#-installation)
- [📋 Available Skills Catalog](#-available-skills-catalog)
- [🛠️ Execution & Requirements](#️-execution--requirements)
- [✅ Validating Skills](#-validating-skills)
- [🏷️ Versioning & Releases](#️-versioning--releases)
- [🔄 Maintaining the Table of Contents](#-maintaining-the-table-of-contents)
- [🤝 Contributing Skills](#-contributing-skills)
- [📜 License](#-license)

---

## 📥 Installation

Install skills into your agent environment with `skills.sh` (`npx skills`):

```bash
# Install one skill
npx skills add Reactive-Skills/skills --skill <skill-name>

# Example
npx skills add Reactive-Skills/skills --skill jsm-workflow

# Install every skill in the registry
npx skills add Reactive-Skills/skills
```

---

## 📋 Available Skills Catalog

The table below is generated from each skill's `skill.yaml`.
Each skill's own `README.md` documents its workflow, inputs, and deliverables, and its `STATECHART.md` shows the full state diagram.

<!-- TOC_START -->

| Skill | Version | Schema | Description |
| :--- | :--- | :--- | :--- |
| [`api-contract`](api-contract/) | `v1.0.0` | `v2.0.0` | OpenAPI/Swagger spec vs client code drift detector — parses spec, walks fetch/axios calls, detects mismatches |
| [`browser-verifier`](browser-verifier/) | `v1.0.0` | `v2.0.0` | Automated browser verification reactive skill that launches headless browser sessions, verifies DOM states, intercepts console errors, and captures visual artifacts. |
| [`build-advisor`](build-advisor/) | `v1.0.2` | `v2.1.0` | Develop worthwhile products, challenge existing ideas and experiences, or advise builders on product, leadership, team, business, and career decisions using contextual principles from Tony Fadell's Build. |
| [`ci-cd-automation`](ci-cd-automation/) | `v1.0.0` | `v2.0.0` | Automated CI/CD pipeline generator and linter that scaffolds production-ready workflows with caching, matrix builds, and security gates. |
| [`docs-architect`](docs-architect/) | `v1.0.1` | `v2.0.0` | Documentation architecture workflow that discovers source truth, designs information architecture, authors living documentation, embeds diagrams, validates links, and gates publication. |
| [`experiment-loop`](experiment-loop/) | `v1.0.1` | `v2.1.0` | Run bounded, evidence-backed improvement experiments with fixed evaluators, repeated baselines, protected confirmation, budgets, and recovery. |
| [`jsm-workflow`](jsm-workflow/) | `v1.5.0` | `v2.1.0` | Reactive SDLC coordinator taking software changes from intake to final context sync, implementing the JS Mastery Engineering Workflow (https://jsmastery.com/skills). |
| [`llm-eval-design`](llm-eval-design/) | `v1.0.0` | `v2.1.0` | Define measurable success criteria for an LLM application and design the evaluations that test them. Produces an approved plan covering criteria, eval methods, graders, and test-case coverage. Optionally generates an eval harness and runs it, each behind its own human approval gate. |
| [`mutation-tester`](mutation-tester/) | `v1.0.0` | `v2.2.0` | Technology-agnostic mutation testing reactive skill powered by high-performance Go CLI engine. |
| [`onboarding-map`](onboarding-map/) | `v1.0.3` | `v2.0.0` | Codebase onboarding workflow: intake role and scope, scan architecture and ownership, map modules and dependencies, design a personalized learning path, review with stakeholders, and approve completion. |
| [`pep8-review`](pep8-review/) | `v1.0.0` | `v2.1.0` | Reactive Python style review using PEP 8, project-specific style rules, and relevant companion conventions for docstrings and type annotations. |
| [`pr-triage`](pr-triage/) | `v1.0.1` | `v2.0.0` | Pull request triage workflow that collects PR metadata, classifies risk and ownership, assesses readiness, routes work, and pauses at a human disposition gate. |
| [`product-manager`](product-manager/) | `v1.0.2` | `v2.1.0` | Event-driven product management and opportunity realization engine. Orchestrates opportunity discovery & worthwhileness research (new green-field projects vs existing product feature enhancements), strategic goal alignment, SMART requirement scoping, Eisenhower matrix prioritization, and lean vertical slice architecture. |
| [`release-notes`](release-notes/) | `v1.0.0` | `v2.0.0` | Automated changelog and release note generator that scopes changes, classifies entries, composes draft notes, validates formatting, and gates human approval. |
| [`research-design-planner`](research-design-planner/) | `v1.0.0` | `v2.1.0` | One reactive entry point that helps users explore, choose, plan, or review a quantitative, qualitative, or mixed methods research design. |
| [`resume-manager`](resume-manager/) | `v2.6.0` | `v2.1.0` | Consolidated reactive career management engine. Orchestrates master profile bootstrapping, continuous achievement maintenance, multi-track profile specialization (Senior Technical, Practical Mid-Level, Operations Management, Client Solutions, and Adjacent Industry), and job application tailoring with automated overqualification and anti-flight risk calibration. |
| [`security-scan`](security-scan/) | `v1.0.0` | `v2.0.0` | Pre-commit secret and credential scanner with remediation checklist — scans staged changes for API keys, tokens, private keys, hardcoded credentials, insecure defaults |
| [`skill-manager`](skill-manager/) | `v1.3.1` | `v2.1.0` | Full CRUD lifecycle management for reactive skills - CREATE UPDATE DELETE MIGRATE_LEGACY and MIGRATE_REACTIVE with pre-COMMIT approval best-effort rollback and manifest snapshot projection |
| [`systems-diagnosis`](systems-diagnosis/) | `v1.0.0` | `v2.1.0` | Diagnose recurring or surprising behavior in a system, explain it through observed patterns and structure, and develop a testable intervention. |
| [`tdd-refactor`](tdd-refactor/) | `v2.0.4` | `v2.1.0` | Hierarchical TDD & Refactoring state machine with nested micro-cycles, regression detection, event bubbling, and live projections |
| [`test-coverage-gate`](test-coverage-gate/) | `v1.0.0` | `v2.0.0` | Test coverage quality gate that establishes a clean baseline, measures statement, branch, function, and line coverage, analyzes gaps, and blocks release below explicit thresholds. |

<!-- TOC_END -->

---

## 🛠️ Execution & Requirements

Reactive skills run through the `@reactive-skills/axi` CLI, which requires Node.js 22.5 or later.
Use it through `npx` with no install, or install it globally for the `reactive-skills-axi` command:

```bash
# Zero install:
npx -y @reactive-skills/axi invoke <skill>
npx -y @reactive-skills/axi state <skill>
npx -y @reactive-skills/axi emit <skill> <signal>

# Optional global install:
npm install -g @reactive-skills/axi
```

Agents load each skill through the bootloader in its `SKILL.md`, then advance only with the signals the active state declares.

---

## ✅ Validating Skills

The skill validator checks manifest structure, prompt templates, bootloader presence, and runtime statechart compilation via `@reactive-skills/axi`:

```bash
# Validate all skills:
node scripts/validate-skills.js

# Validate one skill:
node scripts/validate-skills.js mutation-tester

# Check release manifests and required version increases against a base branch:
node scripts/validate-skill-releases.js --base-ref origin/main
```

Skills with acceptance tests keep them beside their guards and run them against the installed runtime:

```bash
node --test product-manager/guards/projections.test.cjs
```

---

## 🏷️ Versioning & Releases

Every skill is versioned independently with Semantic Versioning in `skill.yaml` and mirrored in `skill-release.json`.
Any change to a skill's content requires a version increase, which CI enforces on every pull request.
`skill-release.json` also declares the release channel: `stable`, `preview`, or `experimental`, where `experimental` marks skills whose real-world effectiveness is still being established.
Releases are published as GitHub Releases tagged `<skill>-v<version>`, for example `skill-manager-v1.3.0`.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the full versioning policy.

---

## 🔄 Maintaining the Table of Contents

`scripts/update-toc.js` scans every `skill.yaml` and regenerates the catalog table in this README:

```bash
# Regenerate the catalog after adding or changing a skill:
node scripts/update-toc.js

# Verify the catalog is current (runs in CI):
node scripts/update-toc.js --check
```

See the [Catalog Scaling & Pagination Roadmap](docs/catalog-pagination-roadmap.md) for how the catalog will grow into domain groups and machine-readable indexes.

---

## 🤝 Contributing Skills

Community-contributed reactive skills are welcome.
See [CONTRIBUTING.md](CONTRIBUTING.md) for statechart modeling, deterministic guards, versioning, and the pull request checklist.

---

## 📜 License

Skills in this repository are licensed under the **MIT License**.
