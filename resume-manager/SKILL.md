---
name: resume-manager
description: >-
  Consolidated career profile management and tailored job application delivery.
  Bootstraps new master profiles, maintains accomplishments, manages multiple specialized
  profile tracks (Senior Tech, Practical Mid-Level, Operations Management, Client Solutions,
  Adjacent Industry), and tailors ATS resumes, cover letters, and interview preparation for
  specific job descriptions with automatic overqualification/anti-flight risk calibration.
type: reactive
triggers:
  - "resume manager"
  - "manage my resumes"
  - "tailor my resume"
  - "customize resume"
  - "update my resume"
  - "build master profile"
  - "interview me for my resume"
  - "overqualified resume"
  - "multiple resume profiles"
---

<!-- REACTIVE BOOTLOADER -->
> **REACTIVE SKILL — RUNTIME CHECK**
> This skill is driven by the Reactive Skills Architecture state machine.
>
> **Default runtime path: AXI CLI**
> AXI is the default runtime path, even when MCP tools are present.
> Run `reactive-skills-axi state resume-manager` to read the active job instructions.
> Run `reactive-skills-axi invoke resume-manager` only when you need a fresh isolated job.
> For named or parallel work, keep the same `--job <job-id>` flag on every `state` and `emit` command.
>
> **Fallback runtime path: MCP**
> Use `reactive_state` and `reactive_emit_signal` only when shell access to AXI is unavailable.
> Do not troubleshoot MCP before trying AXI.
>
> **The TODO Card model**
> AXI `state` = READ the card (loads what to do).
> Do the work described in the prompt.
> AXI `emit` = MARK done (advances the state machine).
> These are always 3 separate steps: Load -> Execute -> Emit.
>
> **Terminal state recovery**
> If this skill reports a completed terminal state and you need a new resume workflow, run `reactive-skills-axi reset resume-manager` or `reactive-skills-axi invoke resume-manager`.
>
> **STRICT INVARIANT:**
> Never manually bypass runtime execution or guess next states.
<!-- END REACTIVE BOOTLOADER -->

# Resume Manager

A comprehensive, multi-track career management and application customization system. Unifies profile bootstrapping, continuous achievement tracking, multi-profile architecture (senior software, mid-level execution, operations/management, adjacent industries), and precision job tailoring with automated overqualification and anti-flight risk calibration.

## Multi-Profile Architecture

Candidates with deep seniority frequently run into two major friction points when applying outside specialized hyperscale roles:
1. **Perceived Overqualification / Intimidation:** Hiring managers fear the candidate is too theoretical, will demand exorbitant compensation, or will disrupt the existing hierarchy.
2. **Flight-Risk Hesitation:** Concerns that the candidate is merely using the position as a temporary stopgap until top-tier tech roles reopen.

`resume-manager` decouples career history into five distinct profile archetypes:

| Profile Archetype | Target Roles | Core Positioning Strategy |
|---|---|---|
| `senior_technical` | Staff/Principal/Lead SWE, Platform Architect | Distributed systems, architectural ownership, scaling, high throughput, trade-off mastery. |
| `practical_mid_technical` | Mid/Senior Full-Stack, Backend, Web SWE | Hands-on execution, reliable delivery, standard stacks, team collaboration, low ego, zero architectural posturing. |
| `operations_management` | Operations Manager/Director, Program Manager | Process optimization, workflow automation, cost reduction, cycle time compression, cross-functional leadership. |
| `solutions_client_facing` | Solutions Architect, Technical Account Manager | Client enablement, commercial value translation, empathy, stakeholder alignment, high-trust advisory. |
| `adjacent_industry` | Healthcare, Supply Chain, Manufacturing, Retail, Public Sector | Grounded problem solving, dependable stability, practical automation, authentic long-term commitment. |

---

## Core Capabilities & Workflows

### 1. Customization Mode (`CUSTOMIZE`)
Triggered when the user provides a Job Description (JD) or asks to tailor materials for a specific opportunity:
1. **Ingest JD:** Extract company, job title, responsibilities, industry, and detected leveling.
2. **Profile Selection & Overqualification Evaluation:** Matches JD to the best profile archetype. If candidate seniority exceeds role leveling or targets a non-tech industry, flags `overqualified_risk = true`.
3. **Framing & Anti-Flight Risk Calibration:**
   - Translates high-abstraction tech jargon into grounded business outcomes (see `references/overqualification-and-framing.md`).
   - Crafts a credible, grounded intent narrative in the cover letter explaining why this specific environment and role are genuinely attractive.
   - De-emphasizes raw years of experience unless explicitly demanded by JD thresholds.
4. **Gap Analysis & 25–35 Keyword Calibration:** Weaves 25–35 role-specific terms into bullet points and taxonomy. Socratic verification prevents unearned keyword claims.
5. **Company Alignment:** Researches culture, mission, public signals, and conversation angles (`company_alignment.md`).
6. **ATS Drafting:** Generates single-column `resume.md` and tailored `cover_letter.md` in `<output_dir>/<Company>/<Role>/`.
7. **Document Export:** Automatically compiles `.docx` and `.pdf` via bundled `convert_resume.py`.
8. **Interview Prep:** Produces `interview_prep.md` including pre-emptive answers to "Why this job? Aren't you overqualified?".
9. **Continuous Flywheel:** Offers to capture newly verified skills and sharpened phrasing back into the master profile.

### 2. Maintenance Mode (`MAINTAIN`)
Triggered when the user wants to add an accomplishment, promotion, or new skill:
1. Loads target profile record.
2. Prompts for the achievement using the Google XYZ formula (*Accomplished [X], measured by [Y], by doing [Z]*).
3. Updates experience entries and synchronizes skill taxonomies.

### 3. Bootstrap Mode (`BOOTSTRAP`)
Triggered when no profile exists:
1. Conducts an interactive, chronological career interview.
2. Synthesizes a master profile and scaffolds default archetype tracks.

### 4. Multi-Profile Management (`MANAGE_PROFILES`)
Triggered when the user wants to view, clone, tweak, or create specialized profile tracks for different career targets.

---

## Standard Output Hierarchy

For customized applications:
```
<output_dir>/<Company>/<Role>/
├── <Candidate_Name>_Resume.docx          (Primary ATS upload)
├── <Candidate_Name>_Resume.pdf           (Direct human/email review)
├── <Candidate_Name>_Cover_Letter.docx
├── <Candidate_Name>_Cover_Letter.pdf
├── resume.md
├── cover_letter.md
├── company_alignment.md
└── interview_prep.md
```

## References & Assets

- `references/ats-optimization.md` — Empirical ATS rules (single column, keyword calibration, title mirroring).
- `references/professional-voice-standards.md` — Peer-to-peer anti-AI voice guide, zero em dashes, and cliché elimination.
- `references/overqualification-and-framing.md` — Framework for down-leveling, non-intimidating phrasing, and anti-flight risk framing.
- `references/multi-profile-guide.md` — Guidance on maintaining and switching between profile archetypes.
- `assets/convert_resume.py` — Multi-tier DOCX/PDF export script (Word COM -> Headless Edge -> Pandoc).
- `assets/msedge-print.ps1` — Edge headless PDF generation helper.
- `assets/resume_style.css` — Typographic print stylesheet.
