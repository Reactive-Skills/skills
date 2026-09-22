# 📄 resume-manager

> Consolidated reactive career management engine. Orchestrates master profile bootstrapping, continuous achievement maintenance, multi-track profile specialization, and job application tailoring with automated overqualification and anti-flight risk calibration.

[![Schema Version](https://img.shields.io/badge/schema-v2.1.0-blue.svg)](skill.yaml)
[![Skill Version](https://img.shields.io/badge/version-v2.2.0-green.svg)](skill.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Multi-Profile Specialization](#-multi-profile-specialization)
- [The Overqualification & Flight-Risk Problem](#-the-overqualification--flight-risk-problem)
- [Core Modes](#-core-modes)
  - [1. Customization Mode (`CUSTOMIZE`)](#1-customization-mode-customize)
  - [2. Maintenance Mode (`MAINTAIN`)](#2-maintenance-mode-maintain)
  - [3. Bootstrap Mode (`BOOTSTRAP`)](#3-bootstrap-mode-bootstrap)
  - [4. Multi-Profile Management (`MANAGE_PROFILES`)](#4-multi-profile-management-manage_profiles)
- [Standard Output Hierarchy](#-standard-output-hierarchy)
- [State Machine Workflow](#-state-machine-workflow)
- [Installation](#-installation)
- [Execution & Usage](#-execution--usage)
  - [CLI Mode (Shell)](#cli-mode-shell)
  - [MCP Mode](#mcp-mode)
- [References & Bundled Assets](#-references--bundled-assets)
- [Directory Layout](#-directory-layout)
- [License](#-license)

---

## 🔍 Overview

`resume-manager` is a comprehensive **Reactive Skill** that eliminates the fragmentation of career documents. Rather than maintaining one static resume or ad-hoc copies, it manages a master career repository and specializes targeted application packages on demand.

It features automated overqualification calibration, ATS-compliant single-column formatting, 25–35 role keyword weaving, automated DOCX/PDF export, and company alignment research.

---

## 🎯 Multi-Profile Specialization

Senior practitioners applying across diverse roles or industries need different positioning. `resume-manager` decouples your career history into five distinct profile archetypes:

| Profile Archetype | Target Roles | Core Positioning Strategy |
| :--- | :--- | :--- |
| `senior_technical` | Staff / Principal / Lead SWE, Platform Architect | Distributed systems, architecture ownership, high throughput, scaling, trade-off mastery. |
| `practical_mid_technical` | Mid / Senior Full-Stack, Backend, Web SWE | Hands-on execution, reliable delivery, standard stacks, team collaboration, low ego. |
| `operations_management` | Operations Manager / Director, Program Manager | Process optimization, workflow automation, cost reduction, cycle time compression, cross-functional leadership. |
| `solutions_client_facing` | Solutions Architect, Technical Account Manager | Client enablement, commercial value translation, empathy, stakeholder alignment, high-trust advisory. |
| `adjacent_industry` | Healthcare, Supply Chain, Manufacturing, Retail, Public Sector | Grounded problem solving, dependable stability, practical automation, authentic long-term commitment. |

---

## 🛡️ The Overqualification & Flight-Risk Problem

When senior candidates apply to mid-level or non-tech-hyperscale roles, hiring managers often reject them due to:
1. **Perceived Intimidation / Overqualification**: Concerns that the candidate is overly theoretical, will demand exorbitant salaries, or will destabilize team hierarchy.
2. **Flight-Risk Hesitation**: Fear that the candidate will jump ship as soon as high-paying tech roles rebound.

`resume-manager` automatically detects when candidate seniority exceeds the job level and engages **Framing Calibration** (`CALIBRATE_FRAMING`):
- Translates high-abstraction tech jargon into grounded operational outcomes.
- Builds an authentic, grounded intent narrative in the cover letter explaining genuine interest in the company's mission.
- Calibrates experience thresholds to avoid alarming hiring managers while preserving credibility.

---

## ⚙️ Core Modes

### 1. Customization Mode (`CUSTOMIZE`)
Triggered when providing a Job Description (JD) to tailor a full application package:
1. **JD Ingestion**: Extracts role title, company, requirements, and detected leveling.
2. **Profile Selection & Role Fit Judgment**: Selects the optimal archetype, evaluates fit from JD and verified profile evidence, and checks for overqualification triggers.
   Weak or low-confidence fits pause at `FIT_REVIEW` for a human decision before tailoring continues.
3. **Framing & Anti-Flight Risk Calibration**: Neutralizes jargon and grounds intent.
4. **25–35 Keyword Calibration**: Weaves ATS keywords into bullet points with truthful candidate verification.
5. **Company Alignment**: Researches employer mission, engineering values, and conversational angles.
6. **ATS Drafting**: Generates clean, single-column `resume.md` and tailored `cover_letter.md`.
7. **Document Export**: Compiles pixel-perfect `.docx` and `.pdf` files.
8. **Interview Prep**: Produces tailored Q&A including pre-emptive answers for "Why this role? Aren't you overqualified?".
9. **Continuous Flywheel**: Prompts to compound newly verified skills and sharpened phrasing back into the master profile.

### 2. Maintenance Mode (`MAINTAIN`)
Triggered when adding a new achievement, promotion, or skill:
- Formulates bullet points using the Google XYZ pattern (*Accomplished [X], measured by [Y], by doing [Z]*).
- Synchronizes updates across active profile tracks.

### 3. Bootstrap Mode (`BOOTSTRAP`)
Triggered when starting from scratch:
- Interactive, chronological career interview.
- Synthesizes the master profile and scaffolds default archetype tracks.

### 4. Multi-Profile Management (`MANAGE_PROFILES`)
Triggered to inspect, clone, adjust, or generate new specialized profile tracks.

---

## 📦 Standard Output Hierarchy

Each customized application is materialized into its own directory:

```
<output_dir>/<Company>/<Role>/
├── <Candidate_Name>_Resume.docx          # ATS-ready Word document
├── <Candidate_Name>_Resume.pdf           # Polished PDF for human review
├── <Candidate_Name>_Cover_Letter.docx    # Formatted cover letter
├── <Candidate_Name>_Cover_Letter.pdf
├── resume.md                             # Source ATS markdown
├── cover_letter.md                       # Source cover letter markdown
├── company_alignment.md                  # Research & culture notes
└── interview_prep.md                     # Strategic talking points & defenses
```

---

## 🔄 State Machine Workflow

Defined in [`skill.yaml`](skill.yaml). For the full interactive diagram, see [`STATECHART.md`](STATECHART.md).

The customization path can route from `PROFILE_SELECTION` to `FIT_REVIEW` when fit evidence is weak or uncertain.
The workflow does not auto-reject the role.

```
   ┌──────┐
   │ INIT │
   └──┬───┘
      │ RUNTIME_READY
      ▼
   ┌─────────────┐
   │ SELECT_MODE │
   └──┬───────┬──┘
      │       │
      │       └───────► [BOOTSTRAP / MAINTAIN / MANAGE_PROFILES]
      │ MODE_CUSTOMIZE
      ▼
   ┌───────────┐
   │ INGEST_JD │
   └─────┬─────┘
         │ JD_INGESTED
         ▼
   ┌───────────────────┐     CALIBRATION_REQUIRED     ┌───────────────────┐
   │ PROFILE_SELECTION ├────────────────────────────► │ CALIBRATE_FRAMING │
   └─────┬─────────────┘                              └─────────┬─────────┘
         │ STANDARD_MATCH                                       │
         ▼                                                      │
   ┌──────────────┐ ◄───────────────────────────────────────────┘
   │ GAP_ANALYSIS │
   └─────┬────────┘
         │ ANALYSIS_COMPLETE
         ▼
   ┌───────────────────┐
   │ COMPANY_ALIGNMENT │
   └─────┬─────────────┘
         │ ALIGNMENT_DRAFTED
         ▼
   ┌──────────┐
   │ DRAFTING │
   └─────┬────┘
         │ MATERIALS_DRAFTED
         ▼
   ┌───────────┐
   │ EXPORTING │ ◄── Compiles DOCX & PDF
   └─────┬─────┘
         │ EXPORT_COMPLETE
         ▼
   ┌────────────────┐
   │ INTERVIEW_PREP │
   └─────┬──────────┘
         │ PREP_GENERATED
         ▼
   ┌────────────────┐
   │ EVOLVE_PROFILE │ ◄── Compounding feedback loop
   └─────┬──────────┘
         │ EVOLUTION_COMPLETE
         ▼
   ┌─────────┐
   │ SUCCESS │
   └─────────┘
```

---

## 📥 Installation

Install into your agent workspace using `skills.sh` (`npx skills`):

```bash
npx skills add Reactive-Skills/skills --skill resume-manager
```

---

## 🚀 Execution & Usage

### CLI Mode (Shell)

```bash
# Inspect current state instructions
npx -y @reactive-skills/axi state resume-manager

# Invoke customization mode for a specific role
npx -y @reactive-skills/axi invoke resume-manager --payload '{
  "mode": "CUSTOMIZE",
  "company_name": "Acme Corp",
  "target_title": "Staff Platform Engineer"
}'

# Emit signals to advance
npx -y @reactive-skills/axi emit resume-manager RUNTIME_READY
```

### MCP Mode

When the Reactive Skills MCP server is connected, use `reactive_state` to view current state instructions and `reactive_emit_signal` to transition states.

---

## 📚 References & Bundled Assets

- [`references/ats-optimization.md`](references/ats-optimization.md): Strict ATS formatting rules (single column, semantic headers, keyword calibration).
- [`references/professional-voice-standards.md`](references/professional-voice-standards.md): Anti-AI peer-to-peer tone guidelines, zero cliché phrasing, zero em dashes.
- [`references/overqualification-and-framing.md`](references/overqualification-and-framing.md): Strategies for down-leveling, non-intimidating framing, and anti-flight risk posture.
- [`references/multi-profile-guide.md`](references/multi-profile-guide.md): Guide to managing and calibrating multi-track archetypes.
- [`assets/convert_resume.py`](assets/convert_resume.py): Python document compilation pipeline (Word COM $\rightarrow$ Headless Edge $\rightarrow$ Pandoc).
- [`assets/resume_style.css`](assets/resume_style.css): Professional typography stylesheet for printable PDF outputs.

---

## 📂 Directory Layout

```
resume-manager/
├── README.md               # Human-facing documentation (this file)
├── SKILL.md                # Agent entrypoint with universal reactive bootloader
├── skill.yaml              # HSM statechart manifest (schema_version: 2.1.0)
├── STATECHART.md           # Visual statechart diagram
├── CONTEXT.md              # Domain glossary & architectural terminology
├── skill-release.json      # Release metadata
├── assets/                 # Export scripts and print stylesheets
│   ├── convert_resume.py
│   ├── msedge-print.ps1
│   └── resume_style.css
├── references/             # In-depth guides & tone standards
│   ├── ats-optimization.md
│   ├── multi-profile-guide.md
│   ├── overqualification-and-framing.md
│   └── professional-voice-standards.md
├── guards/                 # Deterministic transition guards
├── states/                 # 20 isolated state prompts (*.md)
└── templates/              # Snapshot & inventory templates (*.hbs)
```

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](../LICENSE) for details.
