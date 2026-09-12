# State: INSPECTING

## Goal
Detect test runner configuration and compute git-diff line boundaries if differential mutation is active.

## Instructions
1. Check for build/manifest files in `target_dir`:
   - `go.mod` -> default command: `go test ./...`
   - `package.json` -> default command: `npm test` or `vitest run`
   - `pyproject.toml` / `pytest.ini` -> default command: `pytest`
   - `Cargo.toml` -> default command: `cargo test`
   - `.mutation.yaml` -> user-configured overrides
2. If `diff_ref` is provided, compute modified files and line ranges using `git diff`.
3. Set `runner_cmd` in payload and emit signal `CONFIGURED`.
4. If runner detection fails and no `runner_cmd` was specified, emit `INSPECTION_FAILED`.

## Anti-Shortcut Checklist
- [ ] Has a valid test runner command been identified?
- [ ] Are target source files identified and readable?
