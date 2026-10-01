# Domain Glossary & Ubiquitous Language: resume-manager

## Core Entities & Concepts

### Master Experience Profile (`master_profile.md`)
The single, comprehensive repository of a professional's entire career history. Unlike a tailored resume, it is intentionally unconstrained in length and contains every role, quantifiable accomplishment, system architecture decision, leadership metric, patent, and tool ever used.

## Profile Home and Path Resolution

The default profile home is `~/.resume-manager/`, where `~` expands to the current user's home directory.
Fresh installs create the master profile at `~/.resume-manager/master_profile.md` and profile tracks under `~/.resume-manager/profiles/`.
The home is agent-neutral and can be changed with `context.profile_home`.
Exact path overrides take precedence: when both `context.master_profile_path` and `context.profiles_dir` are supplied, use both as given.
When only `context.master_profile_path` is supplied, derive tracks from its parent directory's `profiles/` folder.
When only `context.profiles_dir` is supplied, derive the master path from that directory's parent as `master_profile.md`.
When neither exact path is supplied, derive both paths from `context.profile_home`, defaulting to `~/.resume-manager/`.

Search legacy roots `~/.gemini/resume/`, `~/.agents/resume/`, and `~/.kilocode/resume/` only when `context.profile_home` is the default `~/.resume-manager/`, both exact path overrides are unset, and that home has no master profile.
Ask before reading from or migrating any legacy root.
If the user chooses to use a legacy profile in place, set explicit `master_profile_path` and `profiles_dir` values before reading it.
If the user approves a copy, copy the master and existing tracks to the resolved home only when destination files do not exist, verify the copies, and preserve all legacy files.
Never silently switch to, overwrite, move, or delete legacy records.
If the user declines migration, continue with the resolved path and treat it as empty.

### Profile Archetype / Specialized Track
A targeted projection of the Master Profile calibrated for a specific job category or seniority tier. Archetypes prevent cognitive dissonance and overqualification pushback by curating relevant wins and setting the appropriate narrative register:
- **`senior_technical`**: Principal, Staff, Lead Engineer, Architect. Focus on scale, architecture, distributed systems, trade-offs.
- **`practical_mid_technical`**: Senior/Mid Full-Stack, Backend, Frontend. Focus on execution, team collaboration, reliable feature delivery, standard tech stack.
- **`operations_management`**: Operations Manager/Director, Technical Program Manager. Focus on process efficiency, cross-functional delivery, cost containment, cycle-time elimination.
- **`solutions_client_facing`**: Solutions Architect, Technical Account Manager. Focus on client empathy, technical translation, revenue enablement, commercial outcomes.
- **`adjacent_industry`**: Non-software industries (healthcare, supply chain, manufacturing, municipal/education). Focus on dependability, pragmatic automation, grounding, long-term stability.

### Overqualification & Flight-Risk Calibration
The intentional transformation of senior technical achievements into grounded, accessible language that demonstrates high capability without triggering recruiter fears that the candidate will be bored, arrogant, or quickly depart. Addresses two key concerns:
1. *Intimidation Factor:* Eliminates unnecessary hyperscale jargon that alienates non-technical or mid-tier hiring teams.
2. *Flight Risk:* Explicitly weaves an authentic narrative explaining why this role, team, and industry align with current career priorities.

### Role Fit Judgment
An evidence-backed classification of `strong_fit`, `conditional_fit`, or `weak_fit` based on the job description, verified profile evidence, transferable strengths, and material gaps.
Low-confidence or weak classifications require human review before tailoring work continues.

### The 25–35 Keyword "Goldilocks Zone"
Empirical ATS optimization standard where resumes containing between 25 and 35 exact-match keywords from the target job posting achieve peak search ranking without tripping automated AI spam/keyword-stuffing penalties.

### Google XYZ Formula
The standardized metric syntax required for every resume bullet:
*Accomplished [X], as measured by [Y], by doing [Z]*. Action-only bullets without quantifiable outcomes are strictly prohibited.
