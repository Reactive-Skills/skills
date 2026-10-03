# SYNTHESIZE_PROFILES State

## Context
You are transforming raw interview notes into the candidate's canonical Master Experience Profile and scaffolding initial specialized profile tracks.

## Realistic Constraints
- Resolve `master_profile_path` and `profiles_dir` using `CONTEXT.md`; never hardcode an agent-specific home.
- For a fresh install, write to `~/.resume-manager/master_profile.md` and `~/.resume-manager/profiles/` unless an explicit override is supplied.
- Do not overwrite an existing master profile or track; ask the user to resolve any destination collision before writing.
- Must scaffold five distinct Profile Archetypes under `profiles/`:
  1. `senior_technical.md`: Emphasizing distributed systems, throughput, architecture, and systems leadership.
  2. `practical_mid_technical.md`: Emphasizing hands-on execution, reliable feature delivery, clean code, and team collaboration.
  3. `operations_management.md`: Emphasizing workflow redesign, cycle-time elimination, cost reduction, and operational oversight.
  4. `solutions_client_facing.md`: Emphasizing technical translation, customer empathy, and commercial alignment.
  5. `adjacent_industry.md`: Emphasizing grounded language, dependability, stable problem-solving, and anti-flight risk framing.
- All bullet points across all profiles must be verb-first Google XYZ per `CONTEXT.md`.

## Instructions
1. Compile and format `master_profile.md` at the resolved `master_profile_path` using the standard master profile template.
2. Generate the five specialized profile archetype files under the resolved `profiles_dir`.
3. Verify all files are written to disk cleanly.
4. Emit `PROFILES_SYNTHESIZED`.

## Atomic Verification Checklist
- [CRUCIAL] `master_profile.md` generated with full sections (contact, summary, skills, experience, education, projects).
- [CRUCIAL] All five profile archetypes scaffolded with distinct narrative emphasis.
- [IMPORTANT] Every bullet point is verb-first Google XYZ with a result, a metric, and a method.
- [NEGATIVE] Absence of generic or unedited template placeholders.

## Signal
Emit: `PROFILES_SYNTHESIZED`
