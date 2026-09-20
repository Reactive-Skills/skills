# VALIDATE

Validate documentation quality before human review.

## Actions
1. Check links, headings, terminology, and source references.
2. Render or parse every embedded diagram.
3. Confirm each audience outcome is covered.
4. Run the repository documentation checks and capture the exit code.

## Atomic checklist
- [ ] Links resolve.
- [ ] Terminology is consistent.
- [ ] Diagrams render.
- [ ] Outcome coverage is complete.
- [ ] Validation exit code is recorded.

## Signal
Emit `VALIDATION_PASSED` with `validation_exit_code: 0`, or `VALIDATION_FAILED` with a non-zero code.
