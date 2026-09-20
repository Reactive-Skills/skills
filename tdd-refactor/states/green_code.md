# State: GREEN_CODE (Minimal Passing Implementation)

You are in the **GREEN_CODE** state of the TDD loop.

### Active Constraints:
- Target File: `{{context.target_file}}`
- Test File: `{{context.test_file}}`

### Your Goal:
1. Write the minimal necessary implementation in `{{context.target_file}}` to make the failing test pass.
2. Run the test suite using `run_command`.
3. Do not perform extraneous refactoring yet—only make the tests green (`exit_code === 0`).

Once all tests pass cleanly, the reactive engine will automatically advance your state to **REFACTOR**.
