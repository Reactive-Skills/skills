# EXPORTING State

## Goal
Compile drafted markdown materials into polished, ATS-compliant `.docx` and `.pdf` files.

## Instructions
1. Run the bundled conversion script `assets/convert_resume.py` on the target role directory:
   ```bash
   python "<skill_dir>/assets/convert_resume.py" "<output_dir>/<Company>/<Role>"
   ```
2. The script uses a multi-tier PDF generation backend:
   - Primary: Word COM automation.
   - Secondary: Headless Microsoft Edge via `msedge-print.ps1`.
   - Tertiary: Pandoc + pdflatex.
3. Verify generated output files exist:
   - `<Candidate>_Resume.docx`
   - `<Candidate>_Resume.pdf`
   - `<Candidate>_Cover_Letter.docx`
   - `<Candidate>_Cover_Letter.pdf`
4. If export succeeds with exit code 0, emit `EXPORT_COMPLETE` with payload `{ exit_code: 0 }`.
5. If export fails with non-zero exit code, emit `EXPORT_FAILED` with payload `{ exit_code: 1 }`.

## Atomic Checklist
- [ ] Conversion script executed.
- [ ] Both .docx and .pdf generated for both resume and cover letter.
- [ ] Exit code checked.

## Signal
Emit: `EXPORT_COMPLETE` (exit_code == 0) or `EXPORT_FAILED` (exit_code != 0)
