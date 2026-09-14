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

## Failure Catalog Summary
When presenting the plan for approval, include a concise failure catalog derived from the skill type classification and architectural shape:

### Known Failure Modes
| Failure Mode | Trigger | Mitigation | Rollback Strategy |
|-------------|---------|------------|------------------|
| **Orphan prompt templates** | State deleted from `skill.yaml` but `.md` file left on disk | Bi-directional hygiene check in VERIFYING flags unreferenced files | DELETE operation removes entire `states/` directory |
| **Missing prompt_template** | `skill.yaml` references a `states/*.md` that was never created | `validate-skills.js` reports error; EXECUTING checklist verifies SSOT alignment before emit | ROLLING_BACK deletes partial `states/` directory |
| **Empty directories** | `mkdir -p` created a parent but no child files were written | Hygiene gate in VERIFYING scans for empty dirs under `states/` | ROLLING_BACK removes empty parent directories |
| **Invalid guard expression** | JavaScript expression fails at runtime (syntax error or undefined variable) | `@reactive-skills/axi inspect` evaluates all guards before transition | N/A — guards are validated at plan time, not runtime |
| **Transition target mismatch** | Signal targets a state not defined in `skill.yaml` | `validate-skills.js` cross-references all transition targets against declared states | ROLLING_BACK reverts `skill.yaml` to last known good version |
| **Bootloader missing** | `SKILL.md` lacks `<!-- REACTIVE BOOTLOADER -->` marker | `validate-skills.js` enforces bootloader presence | ROLLING_BACK restores `SKILL.md` from backup (UPDATE) or deletes (CREATE) |
| **State explosion** | Flat shape selected for workflow with >10 distinct steps | PLANNING HSM Litmus Test recommends Hierarchical HSM; user can override with explicit acknowledgment | N/A — architectural decision, not runtime failure |
| **Middleware misconfiguration** | `invariant_checker` rules file references undefined context keys | RED phase discovery questions validate rule targets against declared `context_keys` | ROLLING_BACK deletes `runtime/` scaffold |
| **Schema version drift** | `skill.yaml` declares `schema_version: 2.1.0` but features require v2.2.0 | CONTEXT.md documents version capabilities; `validate-skills.js` warns on version/feature mismatch | N/A — informational only |

### RED Phase Findings (when `context.red_phase === true`)
If the RED phase was executed during PLANNING, include `plan.red_phase_findings` in the approval summary:
- Domain boundaries and invariants
- Identified failure modes and degradation strategies
- Secrets surface assessment
- Human-in-loop checkpoints
- Observability requirements
- Concurrency considerations

## User Action Required
Ask user to explicitly approve the plan or request revisions:
- If user approves → emit `USER_APPROVED`
- If user rejects or requests shape revisions → emit `USER_REJECTED`

## Stop Criteria
- If user approves → emit `USER_APPROVED`
- If user rejects → emit `USER_REJECTED`

## Signal
Emit: `USER_APPROVED` or `USER_REJECTED`
