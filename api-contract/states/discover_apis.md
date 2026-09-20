# DISCOVER_APIS

## Goal
Locate the OpenAPI/Swagger spec file and identify all client code paths that may consume the API.

## Inputs
- `context.api_spec_path` — file path to the OpenAPI/Swagger spec (to be discovered or provided)
- `context.client_code_paths` — array of file/directory paths containing client HTTP calls

## Instructions
1. Search the repository for OpenAPI spec files (`openapi.json`, `openapi.yaml`, `swagger.yaml`, `swagger.json`, `*.openapi.*`).
2. If `context.api_spec_path` is already set, verify the file exists.
3. Search client code directories for `fetch(`, `axios(`, `useSWR(`, or `$fetch(` patterns to identify consuming files.
4. Confirm both inputs are non-empty.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] `api_spec_path` resolves to an existing file (use `find_by_name`)
- [ ] `client_code_paths` contains at least 1 file or directory
- [ ] No spec credentials found in spec (will be sanitized by middleware, but report if found)
- [ ] `find_by_name` and `grep_search` were used, not assumptions

## Output
Emit `SPEC_LOADED` with payload:
```json
{"api_spec_path": "<resolved_path>", "client_code_paths": ["<path1>", "<path2>"]}
```

## Signal
Emit: `SPEC_LOADED` (guard: `Boolean(api_spec_path) && Boolean(client_code_paths)`)
