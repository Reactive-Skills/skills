# DRIFT_DIFFING

## Goal
Walk client code and diff against the spec for endpoint coverage and type mismatches.

## Inputs
- `context.api_spec_path` — path to OpenAPI spec
- `context.client_code_paths` — array of client file paths
- `context.spec_schema` — parsed spec structure

## Instructions
1. Use `grep_search` to find all HTTP calls: `fetch(`, `axios(`, `useSWR(`, `$fetch(`.
2. Extract endpoint paths and HTTP methods from each call.
3. Compare extracted endpoints against `spec_schema.paths`.
4. Detect: missing endpoints (in client but not spec), unused endpoints (in spec but not client), type mismatches.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] All HTTP methods in client code extracted (GET, POST, PUT, DELETE, PATCH)
- [ ] Endpoint paths compared against spec `paths` object
- [ ] At least 1 coverage matrix entry generated
- [ ] `grep_search` used with patterns for fetch/axios/useSWR

## Output / Signal
Set context: `drift_findings` = [{endpoint, method, type, severity, description}], `missing_endpoints` = [], `client_endpoints` = [].

Emit `DRIFT_DIFFED` with `{"exit_code": 0, "drift_findings": [...]}` → DRIFT_ANALYSIS. Bubble `SECURITY_CRITICAL_FOUND` if `severity === 'critical'`.
