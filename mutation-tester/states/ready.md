# State: READY

## Goal
Verify execution target parameters and initialize the mutation testing session.

## Instructions
1. Inspect parameters in context:
   - `target_dir`: Root directory of codebase to test (defaults to `.`).
   - `diff_ref`: Optional git reference for differential scoping (e.g. `HEAD~1`, `main`, or `working-tree`).
   - `runner_cmd`: Optional explicit test runner command (e.g. `go test ./...`, `npm test`).
   - `timeout_sec`: Maximum seconds allowed per mutant test run (default: 5).
2. Emit signal `START` to begin environment inspection.

## Anti-Shortcut Checklist
- [ ] Are target directories confirmed to exist?
- [ ] Is git repository initialized if differential scoping was requested?
