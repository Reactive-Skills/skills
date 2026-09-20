# MAP State

## Goal

Build a dependency graph and identify architectural layers, module ownership, and entry points.

## Inputs

- `context.dependency_graph` — parsed module-to-module dependency tree (must be non-null)

## Actions

1. Parse import graphs from source (`go list`, `madge`, `nx dep-graph`, etc.).
2. Detect circular dependencies and flag as warnings.
3. Identify layer boundaries (e.g. `frontend/ → api/ → db/`).
4. Record module ownership from scan results.

## Signal

Emit: `MAPPED` on success, `MAP_FAILED` on error.
