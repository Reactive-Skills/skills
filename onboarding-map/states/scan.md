# SCAN State

## Goal

Scan the repository to discover module boundaries, ownership metadata, and entry points.

## Inputs

- `context.module_count` — number of discovered modules (must be > 0)

## Actions

1. Enumerate packages/directories in `repo_path`.
2. Read `package.json` names or `go.mod` modules or equivalent.
3. Extract ownership from OWNERS files, CODEOWNERS, or module metadata.
4. Set `context.module_count`.

## Atomic Checklist

- [ ] `module_count` is set and > 0
- [ ] At least one entry-point module identified
- [ ] Ownership metadata captured

## Signal

Emit: `SCANNED` on success, `SCAN_FAILED` on error.
