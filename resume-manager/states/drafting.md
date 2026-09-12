# DRAFTING State

## Context
You are drafting the candidate's single-column ATS-compliant resume (`resume.md`) and targeted cover letter (`cover_letter.md`).

## Realistic Constraints
- Resume Formatting Standards:
  - 100% single-column linear layout. Zero tables, zero multi-column blocks, zero sidebars.
  - Plain text contact info in first paragraph of body flow (zero icons/emojis, never in header/footer XML).
  - Standard headings: `Professional Experience`, `Technical Skills` (or `Core Competencies`), `Education & Certifications`, `Projects`.
  - Strict uniform date syntax: `Month YYYY – Present` or `Month YYYY – Month YYYY`.
  - Universal metric standard: every bullet point must satisfy Google XYZ syntax (*Accomplished [X], measured by [Y], by doing [Z]*).
  - Title Mirroring: headline mirrors or standardizes the target job title.
- Overqualification & Down-Leveling Calibration (when `overqualified_risk == true`):
  - Apply grounded language mappings from `calibrate_framing.md`.
  - Strip out raw year-count lead-ins ("15+ years").
  - Emphasize practical execution, team collaboration, and reliable day-to-day delivery.
- Cover Letter Voice & Constraints:
  - Adhere to candidate's calibrated voice register (`direct_practitioner`, `mission_led`, `executive_strategic`, or `standard_professional`).
  - If `direct_practitioner`: strictly zero glazing, zero storytelling preamble, zero company flattery; lead directly with problem domain, technical mechanics, and quantifiable outcomes.
  - Grounded, conversational, sharp first-person voice.
  - Zero em dashes (`—` or `--`). Use periods, commas, or split sentences.
  - Zero corporate slop or AI cliché openers ("I am writing to express my enthusiastic interest", "testament to", "delve", "leverage", "synergy").
  - For overqualified/adjacent roles, weave the authentic anti-flight risk intent narrative naturally into paragraphs 1 and 4.
- Save files to `<output_dir>/<Company>/<Role>/`.

## Instructions
1. Draft `resume.md` adhering to all ATS and calibration constraints.
2. Draft `cover_letter.md` adhering to voice rules and intent framing.
3. Save both files to the target role directory.
4. Emit `MATERIALS_DRAFTED` with payload `{"resume_path": resume_path, "cover_letter_path": cover_letter_path}`.

## Atomic Verification Checklist
- [CRUCIAL] Single-column linear layout strictly enforced.
- [CRUCIAL] Zero em dashes anywhere in cover letter.
- [CRUCIAL] Every resume bullet point adheres to Google XYZ metric syntax.
- [CRUCIAL] Contact info in primary body text without emojis or header XML.
- [IMPORTANT] 25–35 keywords woven naturally across resume and cover letter.
- [NEGATIVE] Absence of corporate buzzwords and AI cliché openers.

## Signal
Emit: `MATERIALS_DRAFTED`
