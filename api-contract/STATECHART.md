# STATECHART - api-contract

```mermaid
stateDiagram-v2
    [*] --> DISCOVER_APIS
    DISCOVER_APIS --> VALIDATION_PIPELINE: SPEC_LOADED [spec and code paths valid]

    state VALIDATION_PIPELINE {
        [*] --> SCHEMA_VALIDATION

        state SCHEMA_VALIDATION {
            [*] --> OPENAPI_CHECK
            OPENAPI_CHECK --> TYPE_COMPATIBILITY: OPENAPI_CHECK_DONE [exit_code == 0]
            TYPE_COMPATIBILITY --> BREAKING_CHANGE_DETECTION: TYPE_CHECK_DONE [exit_code == 0]
            BREAKING_CHANGE_DETECTION --> EXAMPLE_CONFORMANCE: BREAKING_CHECK_DONE [exit_code == 0]
        }

        SCHEMA_VALIDATION --> DRIFT_DIFFING: EXAMPLE_CHECK_DONE [exit_code == 0]
    }

    %% External transitions from VALIDATION_PIPELINE
    VALIDATION_PIPELINE --> BLOCKED: SECURITY_CRITICAL_FOUND [severity == critical]
    DRIFT_DIFFING --> DRIFT_ANALYSIS: DRIFT_DIFFED [exit_code == 0]

    DRIFT_ANALYSIS --> REPORT: DRIFT_CLASSIFIED
    DRIFT_ANALYSIS --> BLOCKED: CRITICAL_DRIFT [severity == critical]

    state REPORT {
        [*] --> VIOLATION_SUMMARY
        VIOLATION_SUMMARY --> FIX_RECOMMENDATIONS: SUMMARY_GENERATED
    }

    %% External transitions from REPORT
    REPORT --> ERROR: REPORT_ERROR
    FIX_RECOMMENDATIONS --> GATE: RECOMMENDATIONS_GENERATED

    GATE --> COMPLETED: USER_APPROVED [approved == true]
    GATE --> DRIFT_ANALYSIS: USER_REQUEST_REVISIONS [revisions_requested == true]
    GATE --> BLOCKED: USER_REJECTED [rejected == true]

    COMPLETED --> [*]
    BLOCKED --> [*]
    ERROR --> [*]
```

## Bubble-Up Transitions

1. **`SECURITY_CRITICAL_FOUND`** (from any substate of VALIDATION_PIPELINE): Guards with `event.payload.severity === 'critical'`, transitions to `BLOCKED`. This catches security issues (e.g., credentials in spec, exposed endpoints) without requiring each leaf state to explicitly handle them.

2. **`CRITICAL_DRIFT`** (from DRIFT_ANALYSIS): Guards with `event.payload.severity === 'critical'`, transitions to `BLOCKED`. Catches drift findings severe enough to halt the pipeline.

3. **`REPORT_ERROR`** (from any substate of REPORT): Transitions to `ERROR` terminal state without a guard, for unrecoverable report generation failures.

## Gate Semantics

The `GATE` state is the sole Human-in-the-Loop (HITL) checkpoint. The user can:
- **Approve & Complete** → `COMPLETED` (guard: `approved === true`)
- **Request Revisions** → `DRIFT_ANALYSIS` (guard: `revisions_requested === true`) - sends the workflow back to the analysis phase
- **Reject (Block)** → `BLOCKED` (guard: `rejected === true`) - halts with critical violations

## Event Sourcing

All signals, guard evaluations, and state transitions are appended to:
- `.reactive/skills/api-contract/events.jsonl` (human-readable)
- `.reactive/skills/api-contract/events.db` (SQLite queries)

Deliverable projections are triggered on `STATE_TRANSITION` and `SIGNAL_EMITTED` events, rendering from Handlebars templates in `templates/`.
