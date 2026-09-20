# PR Triage - Statechart

```mermaid
stateDiagram-v2
    [*] --> INTAKE
    INTAKE --> COLLECT: INTAKE_READY (valid intake)
    INTAKE --> ERROR: INTAKE_INVALID (invalid intake)
    COLLECT --> CLASSIFY: COLLECTION_COMPLETE (items present)
    COLLECT --> ERROR: COLLECTION_FAILED (no items)
    CLASSIFY --> ASSESS: CLASSIFICATION_COMPLETE (classifications present)
    CLASSIFY --> ERROR: CLASSIFICATION_FAILED (no classifications)
    ASSESS --> ROUTE: ASSESSMENT_COMPLETE (assessments present)
    ASSESS --> ERROR: ASSESSMENT_FAILED (no assessments)
    ROUTE --> REVIEW: ROUTING_COMPLETE (routing plan present)
    ROUTE --> ERROR: ROUTING_FAILED (no routing plan)
    REVIEW --> SUCCESS: USER_APPROVED (approved == true)
    REVIEW --> ASSESS: USER_REQUEST_REWORK (rework_requested == true)
    REVIEW --> BLOCKED: USER_REJECTED (rejected == true)
    SUCCESS --> [*]
    BLOCKED --> [*]
    ERROR --> [*]
```

## Guard Reference

| From | Signal | To | Guard |
|---|---|---|---|
| `INTAKE` | `INTAKE_READY` | `COLLECT` | repository, PR batch, and policy are valid |
| `INTAKE` | `INTAKE_INVALID` | `ERROR` | required intake is missing |
| `COLLECT` | `COLLECTION_COMPLETE` | `CLASSIFY` | collected items are non-empty |
| `COLLECT` | `COLLECTION_FAILED` | `ERROR` | collected items are absent |
| `CLASSIFY` | `CLASSIFICATION_COMPLETE` | `ASSESS` | classifications are non-empty |
| `CLASSIFY` | `CLASSIFICATION_FAILED` | `ERROR` | classifications are absent |
| `ASSESS` | `ASSESSMENT_COMPLETE` | `ROUTE` | assessments are non-empty |
| `ASSESS` | `ASSESSMENT_FAILED` | `ERROR` | assessments are absent |
| `ROUTE` | `ROUTING_COMPLETE` | `REVIEW` | routing plan is non-empty |
| `ROUTE` | `ROUTING_FAILED` | `ERROR` | routing plan is absent |
| `REVIEW` | `USER_APPROVED` | `SUCCESS` | `payload.approved === true` |
| `REVIEW` | `USER_REQUEST_REWORK` | `ASSESS` | `payload.rework_requested === true` |
| `REVIEW` | `USER_REJECTED` | `BLOCKED` | `payload.rejected === true` |

`SUCCESS`, `BLOCKED`, and `ERROR` are terminal states.
