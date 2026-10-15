# Domain Glossary & Ubiquitous Language: resume-manager

## Core Entities & Concepts

### Master Experience Profile (`master_profile.md`)
The single, comprehensive repository of a professional's entire career history. Unlike a tailored resume, it is intentionally unconstrained in length and contains every role, accomplishment, system architecture decision, leadership metric, patent, and tool ever used.

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
The content standard for every resume bullet: a result [X], evidence [Y], and the method [Z].
Evidence is the first of these that is true, in order of preference:
1. A sourced number: scope or scale (volumes, customers served, headcount, direct reports, company context such as ARR growth) or a measured before/after pair.
2. A before/after in words, with the changed state named.
3. Who it helped or what depended on it.
A number is welcome whenever the candidate can name its source, and the interview asks for the number and its basis.
A number is never required: never create, estimate, or round up a number to fill Y, and effect percentages appear only when verified.
XYZ is a content check, not literal wording.
Render bullets verb-first: *[Strong past-tense verb] [result with evidence] by [method]*.
Example with a measured before/after: "Cut client onboarding from 3-5 days to under 5 minutes by building a React/TypeScript operations console and .NET Core API."
Example with an audience: "Gave internal analysts and external consumers access to normalized MLS data through .NET Core APIs with OIDC authentication and Redis caching."
Never open with "Accomplished", never write "as measured by", and never use evidence that restates the action ("as measured by team size mentored").
Action-only bullets with no evidence are strictly prohibited, and a vague claim such as "improved processes" is not evidence.
This ban applies to rendered bullets, not to the raw facts of a Project Record.

### Project Record
The unit of granular career evidence in the master profile.
One record per project, product, or system, stored in place under its employer entry or under Open Source.
A record holds raw facts and rendered bullets.
Raw facts are exempt from the XYZ criterion: period, role, team size, visibility, problem and context, ownership, stack, decisions and tradeoffs, metrics, non-claims, track relevance, keyword tags, and story seed.
Rendered bullets are verb-first Google XYZ and are the only part held to the XYZ criterion.
The agent checks each bullet against the criterion, and the candidate approves every rendered bullet before `RECORDED`.
Every record carries at least one rendered bullet.
When enriching an existing project, restate its existing bullet if it is still accurate so the candidate re-approves it.

Field rules:
- `visibility` is `public` or `confidential`.
  A confidential record also carries a resume label: a function-only description used on resumes in place of internal product names.
- `ownership` is `sole`, `lead`, or `contributor`.
- Metrics are optional, and a record may have none.
  Each metric that exists is written as `value | source | verified yes or no`.
  Only `verified: yes` metrics may appear in drafted materials.
  A figure with conflicting sources stays `verified: no` until the candidate resolves it.
- A non-claim is a statement the evidence does not support, such as a speed gain that was never measured.
  Drafting and authenticity review treat non-claims as banned claims.
- `track relevance` lists one or more profile archetype ids.
- `keyword tags` are the exact terms a job description might use for this project.
- Facts prefilled from repositories or earlier drafts carry `verified: no` until the candidate confirms them.

Where a role, project, or profile has no Project Records, use its existing role-level bullets and metrics as before.
Selection, drafting, interview prep, and company alignment must not stall or drop real metrics when no records exist.
A role-level metric counts as verified when the profile text states it; unconfirmed prefill never counts.

### Story Seed
A short interview narrative stored on a Project Record.
It holds the challenge, the action, and the result in CAR order, one line on what went wrong or what the candidate would change, and any derived figures.
It is raw material for interview answers, not resume text.

### Derived Figure
A number computed from a verified metric to make scale easier to hear, such as a daily count restated per second.
Label it derived and show the arithmetic.
Use it only in spoken answers, never on a resume.
