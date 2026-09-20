# TYPE_COMPATIBILITY

## Goal
Verify that schema types and definitions within the OpenAPI spec are internally consistent.

## Inputs
- `context.spec_schema` — parsed spec structure from OPENAPI_CHECK

## Instructions
1. Walk each schema definition in `components/schemas`.
2. Check for type mismatches (e.g., a property declared as `string` but used in a context requiring `integer`).
3. Verify `$ref` references resolve to existing definitions.
4. Detect unresolvable circular references that could cause infinite loops in client code.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] All `$ref` references resolved successfully
- [ ] No type mismatches found between declared and used types
- [ ] No unresolvable circular references detected
- [ ] `view_file` or `grep_search` used to verify at least 3 schema definitions

## Output
Emit `TYPE_CHECK_DONE` with payload:
```json
{"exit_code": 0, "type_mismatches": []}
```

If mismatches found, set `exit_code: 1` and list mismatches in `type_mismatches`.

## Signal
Emit: `TYPE_CHECK_DONE` (guard: `event.payload.exit_code === 0`)
