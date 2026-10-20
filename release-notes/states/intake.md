# INTAKE

Collect the release scope and format policy.

## Inputs
- `repository`: repository path or identifier
- `release_version`: version string being released
- `scope_refs`: non-empty commit range, tags, or branch refs

## Actions
1. Confirm the repository is reachable.
2. Confirm at least one scope ref is named.
3. Take the format policy and excluded paths from the payload, or ask the user for them.

## Atomic checklist
- [ ] Repository is explicit.
- [ ] Version is explicit.
- [ ] Scope refs are non-empty.
- [ ] Format policy is recorded.

## Signal
Emit `INTAKE_READY` with valid inputs, including `format_policy` and `excluded_paths`, or `INTAKE_INVALID` with the missing or invalid fields.
