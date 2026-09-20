# PATH State

## Goal

Design a personalized learning path based on role, dependencies, and ownership.

## Inputs

- `context.learning_path` — ordered array of resources, exercises, and ramp-up tasks (must be non-null)

## Actions

1. Cross-reference `user_role` with module ownership.
2. Sequence resources: docs → examples → owned modules → contribution tasks.
3. Include estimated time per item.
4. Store in `context.learning_path`.

## Atomic Checklist

- [ ] `learning_path` includes at least 3 items
- [ ] References at least one user-owned module
- [ ] Includes a first contribution task

## Signal

Emit: `DESIGNED` on success, `PATH_FAILED` on error.
