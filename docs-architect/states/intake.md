# INTAKE

Collect the documentation request before touching source material.

## Inputs
- `source_paths`: non-empty repository paths
- `audience`: named reader group
- `outcomes`: tasks readers must complete

## Actions
1. Confirm each source path exists or report the missing path.
2. Record audience and outcomes without inventing requirements.
3. Define the documentation scope and exclusions.

## Atomic checklist
- [ ] Source paths are repository-relative and non-empty.
- [ ] Audience is explicit.
- [ ] Outcomes are observable tasks.
- [ ] Scope and exclusions are recorded.

## Signal
Emit `INTAKE_READY` with validated intake, or `INTAKE_INVALID` with the failure reason.
