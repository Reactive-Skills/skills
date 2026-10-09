# DRAFTING State

## Context
You are drafting the candidate's single-column ATS-compliant resume (`resume.md`) and targeted cover letter (`cover_letter.md`).

## Realistic Constraints
- Resume Formatting Standards:
  - 100% single-column linear layout. Zero tables, zero multi-column blocks, zero sidebars.
  - Plain text contact info in first paragraph of body flow (zero icons/emojis, never in header/footer XML).
  - Standard headings: `Professional Experience`, `Technical Skills` (or `Core Competencies`), `Education & Certifications`, `Projects`.
  - Strict uniform date syntax: `Month YYYY – Present` or `Month YYYY – Month YYYY`.
  - Universal metric standard: every bullet point carries Google XYZ content (result X, metric Y, method Z) rendered verb-first per `CONTEXT.md` ("Cut client onboarding from 3-5 days to under 5 minutes by building a React/TypeScript operations console").
  - Never open a bullet with "Accomplished" and never write "as measured by". No opening verb starts more than two bullets in one resume.
  - State an estimate once with `~` ("~40%"). Never stack hedges ("up to approximately").
  - Attribute work to the employer where it was done. Personal or open-source work goes under `Open Source` or `Projects`, never under an employer entry.
  - Follow the markdown layout in `templates/resume-template.md` so the exporter can right-align dates and locations without tables.
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

## Career Timeline Reconciliation
- Before signaling `MATERIALS_DRAFTED`, compare the dated employment entries in the verified master profile with the dated employment entries in the tailored resume.
- Normalize dates to month and year, sort roles chronologically, and account for concurrent roles and overlapping dates.
- Check whether omitting any profile-backed role leaves a period with no represented employment and therefore creates an unexplained gap in the resume timeline.
- If a verified role bridges a gap, restore it in a concise experience entry with its actual employer, title, and dates, even when its details are less relevant to the target role.
- If profile dates are incomplete, a period is a genuine career break, or the candidate wants to omit a gap-bridging role, ask the candidate to clarify before proceeding.
- Never invent a job, employment date, or reason for a gap.
- A candidate-confirmed career break or intentional omission is resolved only when its confirmation is recorded in `timeline_audit_notes`.
- Emit `MATERIALS_DRAFTED` with `timeline_reconciled: true`, `unresolved_gap_count: 0`, and `timeline_audit_notes` alongside the resume and cover letter paths.
- If any gap is unresolved, repair the resume or ask the candidate, then repeat the chronology audit before emitting the signal.

## Revision After Authenticity Review
- Apply this section only when `AUTHENTICITY_REVIEW` sent the resume back: `context.authenticity_flags` or `context.unverified_metrics` has entries, or `context.resume_text` is set.
- If both lists are empty but `resume_text` is set, the judgment rejected the resume as a whole.
  Reread `resume.md` against the question in `guards/resume_authenticity_audit.yaml` and rewrite the weakest bullets.
- Otherwise rewrite only the flagged lines in `resume.md`.
  Leave every other line and `cover_letter.md` unchanged.
- Build each rewrite from facts in the verified master profile: the real system, the real action, the real result, and the real method.
- Give each rewritten bullet a different opening verb from the other bullets in its entry.
- Remove or replace each metric listed in `unverified_metrics` with the figure the master profile supports.
- If the profile gives no verified metric or method for a flagged line, ask the candidate for the real detail.
  Never invent, estimate, or round up a number to clear a flag.
- If a flag has `repeat` of 1 or more, the same location failed review after a rewrite.
  Stop rewriting it and ask the candidate for the real detail.
- Leave `authenticity_flags` in context when emitting `MATERIALS_DRAFTED`.
  `AUTHENTICITY_REVIEW` reads it to detect repeats and clears it when the resume passes.

## Instructions
1. Use the same resolved `master_profile_path` and selected track under `profiles_dir` used by earlier states; do not search a second agent-specific location.
2. Draft `resume.md` adhering to all ATS and calibration constraints, or follow `Revision After Authenticity Review` when flags are present.
3. Draft `cover_letter.md` adhering to voice rules and intent framing, unless this is a revision pass.
4. Save both files to the target role directory.
5. Emit `MATERIALS_DRAFTED` with payload `{"resume_path": resume_path, "cover_letter_path": cover_letter_path}`.

## Atomic Verification Checklist
- [CRUCIAL] Single-column linear layout strictly enforced.
- [CRUCIAL] Zero em dashes anywhere in cover letter.
- [CRUCIAL] Every resume bullet is verb-first Google XYZ: result, metric, and method, with no "Accomplished" opener or "as measured by" clause.
- [CRUCIAL] Every bullet sits under the employer or project where the work was actually done.
- [CRUCIAL] Contact info in primary body text without emojis or header XML.
- [CRUCIAL] Every dated role from the master profile has been compared with the tailored resume timeline.
- [CRUCIAL] No unexplained employment gaps remain before export.
- [IMPORTANT] Confirmed career breaks or intentional omissions are recorded in the timeline audit notes.
- [IMPORTANT] 25–35 keywords woven naturally across resume and cover letter.
- [CRUCIAL] On a revision pass, no metric was invented, estimated, or rounded up.
- [NEGATIVE] Absence of corporate buzzwords and AI cliché openers (enforced via `guards/voice_standards_audit.yaml`).

## Signal
Emit: `MATERIALS_DRAFTED` (gated by `guards/voice_standards_audit.yaml` predicate contract).
The resume then goes to `AUTHENTICITY_REVIEW`, which uses `guards/resume_authenticity_audit.yaml`.
