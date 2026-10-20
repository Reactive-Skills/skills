# State: RED_SPEC (Failing Specification)

You are in the **RED_SPEC** state of the TDD loop.

### Active Constraints:
- Target File: `{{context.target_file}}`
- Test File: `{{context.test_file}}`

### Your Goal:
1. View the current test suite in `{{context.test_file}}`.
2. Add a new, precise test case specifying the new requirement.
3. Run the test suite using `run_command`.
4. **DO NOT** write the production code implementation yet.
5. The test MUST fail (`exit_code != 0`).

After running the suite, emit `TEST_RAN` with payload `{ "exit_code": <actual exit code> }`.
A non-zero exit code advances the run to **GREEN_CODE**.
