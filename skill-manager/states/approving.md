# APPROVING State

## Goal
Present the action plan to the user for review and explicit approval before execution.

## Presentation
Show the user:
- Operation type (CREATE/UPDATE/DELETE)
- Skill name
- Files to create/modify/delete

## User Action Required
Ask user to explicitly approve or reject the plan.

## Stop Criteria
- If user approves → emit `USER_APPROVED`
- If user rejects → emit `USER_REJECTED`

## Signal
Emit: `USER_APPROVED` or `USER_REJECTED`
