# OPENAPI_CHECK

## Goal
Validate that the discovered spec is well-formed OpenAPI/Swagger.

## Inputs
- `context.api_spec_path` — path to the OpenAPI/Swagger spec

## Instructions
1. Open the spec file using `view_file`.
2. Verify it contains an `openapi:` or `swagger:` version field.
3. Verify it has a `paths:` object with at least one endpoint definition.
4. Verify schemas/responses are defined under `components:` (or `definitions:` for Swagger 2.0).

## Atomic Checklist / Anti-Shortcut Gate
- [ ] Spec version field detected (`openapi:` or `swagger:`)
- [ ] `paths:` object exists and is non-empty
- [ ] At least one `components:` or `definitions:` section present
- [ ] `view_file` was used to read the actual file content

## Output
Set context: `spec_schema` = parsed spec structure (endpoints, schemas, examples).

Emit `OPENAPI_CHECK_DONE` with payload:
```json
{"exit_code": 0, "spec_schema": "<parsed_structure_summary>"}
```

If validation fails, emit with `exit_code: 1` and a description of the schema error.

## Signal
Emit: `OPENAPI_CHECK_DONE` (guard: `event.payload.exit_code === 0`)
