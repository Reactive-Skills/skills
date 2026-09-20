# EXAMPLE_CONFORMANCE

## Goal
Validate that spec examples match their declared schema definitions.

## Inputs
- `context.spec_schema` — parsed spec structure

## Instructions
1. For each schema in `components/schemas`, check if `example` or `examples` are provided.
2. Validate example values against declared property types (string, integer, boolean, object, array).
3. Flag type mismatches between examples and schema declarations.
4. Report any schemas with examples that violate `required` or `enum` constraints.

## Atomic Checklist / Anti-Shortcut Gate
- [ ] Examples checked against at least 1 schema definition
- [ ] Example types match declared property types
- [ ] `required` and `enum` constraints validated on example values
- [ ] `view_file` used to inspect actual example content

## Output
Emit `EXAMPLE_CHECK_DONE` with payload:
```json
{"exit_code": 0}
```

If validation fails (examples don't match schema), set `exit_code: 1`.

## Signal
Emit: `EXAMPLE_CHECK_DONE` (guard: `event.payload.exit_code === 0`)
