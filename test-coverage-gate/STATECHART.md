# Test Coverage Gate - Statechart

```mermaid
stateDiagram-v2
    [*] --> INTAKE
    INTAKE --> CONFIGURE: INTAKE_READY (valid intake)
    INTAKE --> ERROR: INTAKE_INVALID (invalid intake)
    CONFIGURE --> BASELINE: CONFIGURATION_READY (exit_code == 0)
    CONFIGURE --> ERROR: CONFIGURATION_FAILED (invalid configuration)
    BASELINE --> MEASURE: BASELINE_PASSED (exit_code == 0)
    BASELINE --> ERROR: BASELINE_FAILED (exit_code != 0)
    MEASURE --> ANALYZE: COVERAGE_MEASURED (report and metrics present)
    MEASURE --> ERROR: MEASUREMENT_FAILED (report or metrics missing)
    ANALYZE --> GATE: GAPS_ANALYZED (metrics and gaps present)
    ANALYZE --> ERROR: ANALYSIS_FAILED (metrics or gaps missing)
    GATE --> SUCCESS: USER_APPROVED (approved == true)
    GATE --> MEASURE: USER_REQUEST_REMEDIATION (remediation_requested == true)
    GATE --> BLOCKED: USER_REJECTED (rejected == true)
    SUCCESS --> [*]
    BLOCKED --> [*]
    ERROR --> [*]
```

## Guard Reference

| From | Signal | To | Guard |
|---|---|---|---|
| `INTAKE` | `INTAKE_READY` | `CONFIGURE` | target, commands, and thresholds are present |
| `INTAKE` | `INTAKE_INVALID` | `ERROR` | required intake is missing |
| `CONFIGURE` | `CONFIGURATION_READY` | `BASELINE` | `payload.exit_code === 0` and thresholds exist |
| `CONFIGURE` | `CONFIGURATION_FAILED` | `ERROR` | configuration failed or thresholds are missing |
| `BASELINE` | `BASELINE_PASSED` | `MEASURE` | `payload.exit_code === 0` |
| `BASELINE` | `BASELINE_FAILED` | `ERROR` | `payload.exit_code !== 0` |
| `MEASURE` | `COVERAGE_MEASURED` | `ANALYZE` | report and metrics are present |
| `MEASURE` | `MEASUREMENT_FAILED` | `ERROR` | report or metrics are missing |
| `ANALYZE` | `GAPS_ANALYZED` | `GATE` | metrics and gap array are present |
| `ANALYZE` | `ANALYSIS_FAILED` | `ERROR` | metrics or gap array are missing |
| `GATE` | `USER_APPROVED` | `SUCCESS` | `payload.approved === true` |
| `GATE` | `USER_REQUEST_REMEDIATION` | `MEASURE` | `payload.remediation_requested === true` |
| `GATE` | `USER_REJECTED` | `BLOCKED` | `payload.rejected === true` |

`SUCCESS`, `BLOCKED`, and `ERROR` are terminal states.
