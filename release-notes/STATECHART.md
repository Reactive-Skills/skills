# Release Notes - Statechart

```mermaid
stateDiagram-v2
    [*] --> INTAKE
    INTAKE --> COLLECT: INTAKE_READY (valid scope)
    INTAKE --> ERROR: INTAKE_INVALID (invalid scope)
    COLLECT --> CLASSIFY: COLLECTION_COMPLETE (commits present)
    COLLECT --> ERROR: COLLECTION_FAILED (no commits)
    CLASSIFY --> COMPOSE: ENTRIES_CLASSIFIED (entries present)
    CLASSIFY --> ERROR: CLASSIFICATION_FAILED (no entries)
    COMPOSE --> VALIDATE: NOTES_COMPOSED (notes present)
    COMPOSE --> ERROR: COMPOSITION_FAILED (no notes)
    VALIDATE --> REVIEW: VALIDATION_PASSED (exit_code == 0)
    VALIDATE --> ERROR: VALIDATION_FAILED (exit_code != 0)
    REVIEW --> SUCCESS: USER_APPROVED (approved == true)
    REVIEW --> COMPOSE: USER_REQUEST_REVISIONS (revisions_requested == true)
    REVIEW --> BLOCKED: USER_REJECTED (rejected == true)
    SUCCESS --> [*]
    BLOCKED --> [*]
    ERROR --> [*]
```

## Guard Reference

| From | Signal | To | Guard |
|---|---|---|---|
| `INTAKE` | `INTAKE_READY` | `COLLECT` | repository, version, and scope are valid |
| `INTAKE` | `INTAKE_INVALID` | `ERROR` | required intake is missing |
| `COLLECT` | `COLLECTION_COMPLETE` | `CLASSIFY` | commits are non-empty |
| `COLLECT` | `COLLECTION_FAILED` | `ERROR` | commits are absent |
| `CLASSIFY` | `ENTRIES_CLASSIFIED` | `COMPOSE` | changelog entries are non-empty |
| `CLASSIFY` | `CLASSIFICATION_FAILED` | `ERROR` | changelog entries are absent |
| `COMPOSE` | `NOTES_COMPOSED` | `VALIDATE` | release notes are non-empty |
| `COMPOSE` | `COMPOSITION_FAILED` | `ERROR` | release notes are absent |
| `VALIDATE` | `VALIDATION_PASSED` | `REVIEW` | `payload.exit_code === 0` |
| `VALIDATE` | `VALIDATION_FAILED` | `ERROR` | `payload.exit_code !== 0` |
| `REVIEW` | `USER_APPROVED` | `SUCCESS` | `payload.approved === true` |
| `REVIEW` | `USER_REQUEST_REVISIONS` | `COMPOSE` | `payload.revisions_requested === true` |
| `REVIEW` | `USER_REJECTED` | `BLOCKED` | `payload.rejected === true` |

`SUCCESS`, `BLOCKED`, and `ERROR` are terminal states.
