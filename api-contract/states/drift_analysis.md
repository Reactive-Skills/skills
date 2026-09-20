# DRIFT_ANALYSIS

## Goal
Analyze drift findings and classify by severity.

## Inputs
- `context.drift_findings` — raw drift findings from DRIFT_DIFFING
- `context.missing_endpoints` — endpoints called but not in spec
- `context.type_mismatches` — type incompatibilities
- `context.deprecated_usage` — deprecated endpoints used

## Classifications
- **Critical**: Exposed credentials in spec, type mismatch causing runtime null-pointer risk
- **High**: Missing endpoint (client calls something not in spec)
- **Medium**: Deprecated endpoint usage
- **Low**: Unused endpoint (in spec but not called)
2. Build coverage matrix: spec endpoints × client call sites.
3. If any finding is `critical`, emit `CRITICAL_DRIFT` → BLOCKED.
4. Otherwise, emit `DRIFT_CLASSIFIED` → REPORT.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] All findings classified by severity (1-4 scale)
- [ ] Coverage matrix has at least one entry
- [ ] Critical findings checked before proceeding
- [ ] `view_file` used to verify at least one finding in source

## Output / Signal
Set context: `coverage_matrix` = {spec_endpoint: {called: bool, clients: [paths]}}.

If critical findings exist, emit `CRITICAL_DRIFT` with `{"severity": "critical", "findings": [...]}` → BLOCKED.

Otherwise, emit `DRIFT_CLASSIFIED` with `{"drift_findings": [...], "coverage_matrix": {...}}` → REPORT.
