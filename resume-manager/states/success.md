# SUCCESS State

## Context
Terminal success state indicating that the `resume-manager` workflow has completed.

## Instructions
1. Present a consolidated summary of all completed actions and generated artifacts:
   - Mode executed (`CUSTOMIZE`, `MAINTAIN`, `BOOTSTRAP`, `MANAGE_PROFILES`).
   - Profile tracks updated or referenced.
   - Generated application materials:
     - `resume.md`
     - `cover_letter.md`
     - `<Candidate>_Resume.docx`
     - `<Candidate>_Resume.pdf`
     - `<Candidate>_Cover_Letter.docx`
     - `<Candidate>_Cover_Letter.pdf`
     - `company_alignment.md`
     - `interview_prep.md`
   - Framing calibration notes (if overqualification/flight-risk flags were disarmed).
2. Advise the candidate on immediate next steps (reviewing PDFs, applying via ATS, preparing for initial screens).

## Signal
Terminal state. No further signals.
