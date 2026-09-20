# FIX_RECOMMENDATIONS

## Goal
Generate actionable fix recommendations for each drift violation.

## Inputs
- `context.drift_findings` — classified findings
- `context.missing_endpoints` — endpoints called but not in spec
- `context.coverage_matrix` — spec endpoint coverage

## Instructions
1. For each finding, produce a concrete fix:
   - **Missing endpoint**: "Add `{method} {path}` to spec or remove unauthorized client call"
   - **Type mismatch**: "Update spec schema property `{name}` from `{actual}` to `{expected}`"
   - **Deprecated usage**: "Replace calls to `{path}` with `{replacement}` or add deprecation banner in spec"
   - **Unused endpoint**: "Remove `{method} {path}` from spec or implement client usage"
2. Assign priority based on severity (critical > high > medium > low).
3. Write the full drift report to `.docs/api-contract/drift.md` (deliverable).
4. Write coverage matrix to `.docs/api-contract/coverage.md` (deliverable).

## Atomic Checklist / Anti-Shortcut Gate
- [ ] Each finding has a non-empty recommendation string
- [ ] Priority assigned to each recommendation
- [ ] `drift.md` deliverable written with findings and recommendations
- [ ] `coverage.md` deliverable written with coverage matrix
- [ ] `write_to_file` used for both deliverables

## Output
Emit `RECOMMENDATIONS_GENERATED` with payload:
```json
{"recommendations_count": <number>}
```

## Signal
Emit: `RECOMMENDATIONS_GENERATED` → `GATE` (exits REPORT composite state)
