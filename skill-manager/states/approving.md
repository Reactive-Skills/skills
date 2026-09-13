# APPROVING State

## Goal
Present the action plan to the user for review and explicit approval before execution.

## Presentation
Show the user:
- **Operation**: `CREATE` | `UPDATE` | `DELETE`
- **Skill Name**: `context.skill_name`
- **Architectural Shape**: `plan.shape` (`Flat Linear Pipeline` | `Flat Iterative Loop` | `Hierarchical HSM`)
- **Architectural Rationale**: `plan.shape_rationale` (why this shape was selected, noting any bubbling handlers or loop boundaries)
- **File Manifest**:
  - Files to create (grouped by directory/phase to highlight hierarchical structure if present)
  - Files to modify
  - Files to delete (highlighting any pruned orphan files)

## User Action Required
Ask user to explicitly approve the plan or request revisions:
- If user approves → emit `USER_APPROVED`
- If user rejects or requests shape revisions → emit `USER_REJECTED`

## Stop Criteria
- If user approves → emit `USER_APPROVED`
- If user rejects → emit `USER_REJECTED`

## Signal
Emit: `USER_APPROVED` or `USER_REJECTED`
