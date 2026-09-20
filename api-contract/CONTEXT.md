# CONTEXT — api-contract

## Ubiquitous Language

| Term | Definition |
|---|---|
| **API Spec** | An OpenAPI 2.0/3.0/3.1 or Swagger document describing declared API endpoints, schemas, and examples |
| **Client Code** | Source files (TypeScript, JavaScript, etc.) that consume the API via `fetch()`, `axios`, `useSWR`, or equivalent HTTP clients |
| **Endpoint** | A unique HTTP method + path combination (e.g., `GET /users/{id}`) declared in the spec and/or called in client code |
| **Drift** | Any mismatch between the API spec and client code: missing endpoints, type mismatches, deprecated usage, or coverage gaps |
| **Coverage** | The proportion of spec-defined endpoints that are actually called by client code, broken down per endpoint |
| **Violation** | A specific drift finding classified by severity (critical, high, medium, low) |
| **Bubble Event** | A signal emitted from a substate that propagates to a parent composite state (e.g., `SECURITY_CRITICAL_FOUND` during validation) |

## Domain Boundaries

- **In scope**: OpenAPI/Swagger spec parsing, client code AST/grep walking, endpoint coverage analysis, type compatibility checking, deprecated endpoint detection, drift reporting
- **Out of scope**: Generating client SDKs, implementing API endpoints, running API servers, live API testing

## Statechart Invariants

1. **Spec Loaded Before Validation**: `VALIDATION_PIPELINE` must not be entered unless `api_spec_path` and `client_code_paths` are both non-empty (enforced by `SPEC_LOADED` guard).
2. **Validation Completes Before Drift Analysis**: `DRIFT_ANALYSIS` must not be entered unless all schema validation substates pass (enforced by `exit_code === 0` guards on each validation transition).
3. **Critical Issues Block**: Any substate within `VALIDATION_PIPELINE` or `DRIFT_ANALYSIS` that encounters a critical-severity issue must emit `SECURITY_CRITICAL_FOUND` or `CRITICAL_DRIFT`, transitioning to `BLOCKED`.
4. **Report Before Gate**: `GATE` human review must not be reached unless `REPORT.FIX_RECOMMENDATIONS` has completed (enforced by sequential substate transitions).
5. **Revision Goes Back to Analysis**: If the user requests revisions at `GATE`, the skill must return to `DRIFT_ANALYSIS`, not a completed state.
6. **No Orphaned State Prompts**: Every `.md` file under `states/` must be referenced by an active state in `skill.yaml`.

## Schema Version

This skill uses `schema_version: "2.0.0"` of the Reactive Skills manifest format. No migration path from legacy SKILL.md is supported (this is a new CREATE operation).
