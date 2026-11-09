# DETECTING State

## Objective and inputs

Inspect the actual target files and route the requested operation.
Consume `context.skill_name` and `operation`.
Read the registered source list and honor the explicitly selected source.
Resolve ambiguity before mutation; reject distribution and agent-local destinations before following links.
Verify canonical target containment in the selected source, including existing ancestors and links.
For CREATE, check the existing parent and planned path.
Set absolute `context.authoring_source`, `context.target_skill_dir`, and `context.manager_skill_dir` in `contextUpdates`.
Use `target_skill_dir` for every check, regardless of CWD.

## Observe target type

Check actual readable files under `context.target_skill_dir`:
- `hasReactiveManifest`: `skill.yaml` or `skill.yml` exists. A malformed manifest remains reactive and must fail runtime validation; never fall back to passive checks.
- `hasSKILL`: `SKILL.md` exists.
- `target_type`: `reactive` when a manifest exists, `passive` when SKILL.md exists without a manifest, otherwise `missing`.
- `skillExists`: either a reactive manifest or SKILL.md exists.
- `isLegacy`: target_type is passive; this retains the explicit MIGRATE_LEGACY eligibility meaning, not a requirement to migrate.
- `isV1Reactive`: a reactive manifest declares `schema_version: reactive/v1`.
- `isV2Reactive`: a reactive manifest declares `schema_version: 2.0.0`; other schemas still require runtime validation.

Unreadable or non-file inputs are failures, not permission to overwrite them.
Persist these observations in `contextUpdates`, including `target_type`.
Existing passive skills are valid UPDATE targets. Preserve their identity without manufacturing a manifest, bootloader, states or topology.

## Route and exit

| Operation | Observed condition | Signal |
|---|---|---|
| CREATE | skillExists is false | `NOT_EXISTS_CREATE` |
| CREATE | skillExists is true, including passive | `EXISTS_CREATE` |
| UPDATE | skillExists is true, reactive or passive | `EXISTS_UPDATE_DELETE` |
| UPDATE | target_type is missing | `NOT_EXISTS_UPDATE_DELETE` |
| DELETE | hasReactiveManifest is true | `EXISTS_UPDATE_DELETE` |
| DELETE | hasReactiveManifest is false | `NOT_EXISTS_UPDATE_DELETE` |
| MIGRATE_LEGACY | isLegacy is true | `IS_LEGACY` |
| MIGRATE_LEGACY | isLegacy is false | `IS_NOT_LEGACY` |
| MIGRATE_REACTIVE | isV1Reactive is true | `IS_V1_REACTIVE` |
| MIGRATE_REACTIVE | isV1Reactive is false | `NOT_V1_REACTIVE` |

DELETE retains its reactive-only scope. Passive UPDATE never implies migration.
Emit only the applicable existing signal after recording the inspected type and source evidence.
