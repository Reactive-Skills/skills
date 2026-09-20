# VIOLATION_SUMMARY

## Goal
Summarize all drift violations by category and severity.

## Inputs
- `context.drift_findings` — classified findings from DRIFT_ANALYSIS
- `context.missing_endpoints` — endpoints called but not in spec
- `context.type_mismatches` — type incompatibilities
- `context.deprecated_usage` — deprecated endpoints used

## Instructions
1. Group findings by type: Missing Endpoints, Type Mismatches, Deprecated Usage, Unused Endpoints.
2. Count findings per severity (critical, high, medium, low).
3. List each finding with: endpoint, method, severity, brief description.
4. Write the summary to `.docs/api-contract/draft_violation_summary.md` (intermediate artifact).

## Atomic Checklist / Anti-Shortcut Gate
- [ ] All findings categorized (no raw findings left uncategorized)
- [ ] Counts computed for each severity level
- [ ] At least one finding per category listed (if category is empty, note it)
- [ ] `write_to_file` used to persist the draft summary

## Output
Emit `SUMMARY_GENERATED` with payload:
```json
{"finding_count": <number>, "categories": ["missing_endpoints", "type_mismatches", "deprecated_usage", "unused_endpoints"]}
```

## Signal
Emit: `SUMMARY_GENERATED` → `REPORT.FIX_RECOMMENDATIONS`
