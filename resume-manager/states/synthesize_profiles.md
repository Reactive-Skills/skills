# SYNTHESIZE_PROFILES State

## Context
You are transforming raw interview notes into the candidate's canonical Master Experience Profile and scaffolding initial specialized profile tracks.

## Realistic Constraints
- Primary master profile must be written to `~/.gemini/resume/master_profile.md` (or workspace profile directory).
- Must scaffold five distinct Profile Archetypes under `profiles/`:
  1. `senior_technical.md`: Emphasizing distributed systems, throughput, architecture, and systems leadership.
  2. `practical_mid_technical.md`: Emphasizing hands-on execution, reliable feature delivery, clean code, and team collaboration.
  3. `operations_management.md`: Emphasizing workflow redesign, cycle-time elimination, cost reduction, and operational oversight.
  4. `solutions_client_facing.md`: Emphasizing technical translation, customer empathy, and commercial alignment.
  5. `adjacent_industry.md`: Emphasizing grounded language, dependability, stable problem-solving, and anti-flight risk framing.
- All bullet points across all profiles must adhere to the Google XYZ formula.

## Instructions
1. Compile and format `master_profile.md` using the standard master profile template.
2. Generate the five specialized profile archetype files under `profiles/`.
3. Verify all files are written to disk cleanly.
4. Emit `PROFILES_SYNTHESIZED`.

## Atomic Verification Checklist
- [CRUCIAL] `master_profile.md` generated with full sections (contact, summary, skills, experience, education, projects).
- [CRUCIAL] All five profile archetypes scaffolded with distinct narrative emphasis.
- [IMPORTANT] Every bullet point adheres strictly to Google XYZ syntax.
- [NEGATIVE] Absence of generic or unedited template placeholders.

## Signal
Emit: `PROFILES_SYNTHESIZED`
