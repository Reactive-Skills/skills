# VALIDATE

Validate release notes before human review.

## Actions
1. Check Markdown formatting and list structure.
2. Verify every source link resolves within scope.
3. Confirm all scope commits are represented.
4. Run the documentation linter and capture the exit code.

## Atomic checklist
- [ ] Markdown parses.
- [ ] Links resolve.
- [ ] Scope coverage is complete.
- [ ] Validation exit code is recorded.

## Signal
Emit `VALIDATION_PASSED` with `exit_code: 0`, or `VALIDATION_FAILED` with a non-zero exit code.
