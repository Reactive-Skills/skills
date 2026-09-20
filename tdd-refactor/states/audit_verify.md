# State: AUDIT_VERIFY (Verification & Quality Gate)

You are in the **AUDIT_VERIFY** state of the TDD loop.

### Your Goal:
1. Run linter, typecheck, and full test suite verification.
2. Confirm zero regression across the workspace.
3. Once all checks pass with exit code 0, emit `ALL_CHECKS_PASSED`.
