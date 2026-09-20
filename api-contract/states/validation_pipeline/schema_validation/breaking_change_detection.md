# BREAKING_CHANGE_DETECTION

## Goal
Scan the OpenAPI spec for deprecated endpoints and breaking change patterns.

## Inputs
- `context.spec_schema` — parsed spec structure

## Instructions
1. Check each path for `deprecated: true` at the operation level.
2. Look for `x-deprecated-endpoints` or custom deprecation markers.
3. Scan for responses with `410`, `404`, or `403` status codes marked as "Gone" or "Forbidden" without replacement.
4. Flag any endpoint using non-versioned base paths that may break consumers.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] Deprecated operations flag checked on all paths
- [ ] 410/404 response codes scanned for removal markers
- [ ] Base path versioning strategy verified
- [ ] `grep_search` used to find `deprecated` patterns

## Output
Set context: `deprecated_usage` = list of deprecated endpoint paths.

Emit `BREAKING_CHECK_DONE` with payload:
```json
{"exit_code": 0, "deprecated_usage": []}
```

## Signal
Emit: `BREAKING_CHECK_DONE` (guard: `event.payload.exit_code === 0`)
