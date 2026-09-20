# INTAKE State

## Goal

Collect the repository path and contributor role to scope the onboarding session.

## Inputs

- `context.repo_path` — absolute path to the repository
- `context.user_role` — the contributor's role (e.g. `frontend engineer`, `data engineer`)

## Actions

1. Ask the user for `repo_path` and `user_role`.
2. Verify `repo_path` resolves to a valid directory on disk.
3. Set both context variables.

## Guard Assertion

Before transitioning, assert:

```js
context.repo_path != null && context.user_role != null
```

## Signal

Emit: `INGESTED`
