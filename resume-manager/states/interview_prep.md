# INTERVIEW_PREP State

## Context
You are generating a strategic interview preparation artifact (`interview_prep.md`) in the role directory, focusing on candidate project alignment and pre-emptive defense against overqualification and flight-risk skepticism.

## Realistic Constraints
- Save to `<output_dir>/<Company>/<Role>/interview_prep.md`.
- Structure must include:
  1. Project Alignment: Map 2–3 existing candidate projects directly to the employer's core business and operational challenges.
  2. Pre-emptive Hard Questions & Answers:
     - Directly address: *"Why do you want this role given your senior software background? Aren't you overqualified? Won't you leave when high-tech hiring rebounds?"*
     - Provide crisp, disarming answers leading with the bottom line in sentence one (BLUF style without printing the acronym).
  3. Questions to Ask Them (Audience-Split):
     - Part A (Recruiters & Talent Acquisition): Role genesis (growth vs backfill), team topology, 90-day success metrics, hiring timeline.
     - Part B (Technical / Operational Hiring Managers): Technical debt, operational handoffs, workflow bottlenecks, team culture.
     - Each question must include a **Strategic Intent** note explaining why asking it positions the candidate as a high-value peer.
  4. Portfolio / Proof Points: 1–2 practical reference concepts or small architectures proving domain mastery.

## Instructions
1. Draft `interview_prep.md` in the target role directory.
2. Emit `PREP_GENERATED` with payload `{"interview_prep_path": path}`.

## Atomic Verification Checklist
- [CRUCIAL] Pre-emptive answer to overqualification / flight-risk question provided with authentic, non-defensive reasoning.
- [CRUCIAL] Questions to ask are split by audience (Recruiter vs Hiring Manager).
- [IMPORTANT] Strategic intent explained for every suggested question.
- [NEGATIVE] Zero defensive, arrogant, or dismissive phrasing.

## Signal
Emit: `PREP_GENERATED`
