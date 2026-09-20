# State: REFACTOR (Code Health & Optimization)

You are in the **REFACTOR** state of the TDD loop.

### Active Constraints:
- Target File: `{{context.target_file}}`
- Invariant: All tests MUST stay green throughout your edits.

### Your Goal:
1. Simplify code structure, improve naming, remove duplication, and enhance performance.
2. After every atomic edit, re-run tests using `run_command`.
3. If any test fails, the reactive engine will catch the regression and return you to **GREEN_CODE**.
4. When satisfied with code quality and tests remain green, emit signal `REFACTOR_APPROVED`.
