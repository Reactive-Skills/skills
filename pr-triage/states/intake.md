# INTAKE

Collect the PR triage batch and policy.

## Inputs
- `repository`: repository path or identifier
- `pull_requests`: non-empty PR identifier list
- `triage_policy`: size, check, reviewer, ownership, and risk rules

## Actions
1. Confirm the repository is reachable.
2. Confirm every PR identifier is explicit.
3. Validate the policy schema and required check names.

## Atomic checklist
- [ ] Repository is explicit.
- [ ] PR batch is non-empty.
- [ ] Policy is present and structured.
- [ ] Required checks are named.

## Signal
Emit `INTAKE_READY` with valid inputs, or `INTAKE_INVALID` with missing or invalid fields.
