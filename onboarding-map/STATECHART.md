# STATECHART

```mermaid
stateDiagram-v2
    [*] --> INTAKE
    INTAKE --> SCAN: INGESTED
    SCAN --> MAP: SCANNED
    MAP --> PATH: MAPPED
    PATH --> REVIEW: DESIGNED
    REVIEW --> SUCCESS: APPROVED
    REVIEW --> PATH: REJECTED
    REVIEW --> BLOCKED: BLOCKED
    SCAN --> ERROR: SCAN_FAILED
    MAP --> ERROR: MAP_FAILED
    PATH --> ERROR: PATH_FAILED
    REVIEW --> ERROR: REVIEW_FAILED
    SUCCESS --> [*]
    BLOCKED --> [*]
    ERROR --> [*]
```

## Transitions Summary

| Signal | Source | Target | Guard |
|--------|--------|--------|-------|
| `INGESTED` | INTAKE | SCAN | `repo_path != null && user_role != null` |
| `SCANNED` | SCAN | MAP | `module_count > 0` |
| `MAPPED` | MAP | PATH | `dependency_graph != null` |
| `DESIGN_PATH` | PATH | REVIEW | `learning_path != null` |
| `APPROVED` | REVIEW | SUCCESS | — |
| `REJECTED` | REVIEW | PATH | — |
| `BLOCKED` | REVIEW | BLOCKED | — |
| `SCAN_FAILED` | SCAN | ERROR | — |
| `MAP_FAILED` | MAP | ERROR | — |
| `PATH_FAILED` | PATH | ERROR | — |
| `REVIEW_FAILED` | REVIEW | ERROR | — |
