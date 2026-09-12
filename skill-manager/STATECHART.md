# Statechart: skill-manager

```mermaid
stateDiagram-v2
    [*] --> INIT

    %% Bootloader & Runtime Verification
    INIT --> READY : RUNTIME_READY
    INIT --> SETUP_RUNTIME : SETUP_REQUIRED

    SETUP_RUNTIME --> READY : SETUP_COMPLETE [exit_code == 0]
    SETUP_RUNTIME --> ERROR : SETUP_FAILED [exit_code != 0]

    READY --> PARSING : USER_INVOKED [skill_name != null]

    PARSING --> DETECTING : PARSED [valid operation]
    PARSING --> ERROR : ERROR [invalid operation]

    %% Existence & Mode Detection
    DETECTING --> PLANNING : NOT_EXISTS_CREATE [operation == CREATE]
    DETECTING --> ERROR : EXISTS_CREATE [operation == CREATE]
    DETECTING --> PLANNING : EXISTS_UPDATE_DELETE [operation in UPDATE, DELETE]
    DETECTING --> ERROR : NOT_EXISTS_UPDATE_DELETE [operation in UPDATE, DELETE]
    DETECTING --> BACKING_UP_MIGRATE : IS_LEGACY [operation == MIGRATE_LEGACY]
    DETECTING --> ERROR : IS_NOT_LEGACY [operation == MIGRATE_LEGACY]
    DETECTING --> BACKING_UP_MIGRATE : IS_V1_REACTIVE [operation == MIGRATE_REACTIVE]
    DETECTING --> ERROR : NOT_V1_REACTIVE [operation == MIGRATE_REACTIVE]

    %% CREATE / UPDATE / DELETE Lifecycle Branch
    PLANNING --> APPROVING : PLAN_READY
    APPROVING --> EXECUTING : USER_APPROVED
    APPROVING --> ERROR : USER_REJECTED
    EXECUTING --> VERIFYING : EXECUTED
    VERIFYING --> PROJECTING : VERIFIED_OK [exit_code == 0]
    VERIFYING --> ROLLING_BACK : VERIFIED_FAIL [exit_code != 0]
    ROLLING_BACK --> ERROR : ROLLED_BACK
    ROLLING_BACK --> ERROR : ROLLBACK_FAILED

    %% Migration Branch (MIGRATE_LEGACY / MIGRATE_REACTIVE)
    BACKING_UP_MIGRATE --> INFERRING_LEGACY : BACKED_UP_LEGACY [operation == MIGRATE_LEGACY]
    BACKING_UP_MIGRATE --> INSPECTING_REACTIVE : BACKED_UP_REACTIVE [operation == MIGRATE_REACTIVE]

    INFERRING_LEGACY --> PLANNING_MIGRATE : INFERRED [confidence >= 0.5]
    INFERRING_LEGACY --> GRILLING_MIGRATE : LOW_CONFIDENCE [confidence < 0.5]
    GRILLING_MIGRATE --> PLANNING_MIGRATE : GRILL_COMPLETE

    INSPECTING_REACTIVE --> PLANNING_MIGRATE : INSPECTED

    PLANNING_MIGRATE --> APPROVING_MIGRATE : PLAN_READY
    APPROVING_MIGRATE --> EXECUTING_MIGRATE : USER_APPROVED
    APPROVING_MIGRATE --> RESTORING_MIGRATE : USER_REJECTED
    EXECUTING_MIGRATE --> VERIFYING_MIGRATE : EXECUTED
    VERIFYING_MIGRATE --> PROJECTING : VERIFIED_OK [exit_code == 0]
    VERIFYING_MIGRATE --> RESTORING_MIGRATE : VERIFIED_FAIL [exit_code != 0]
    RESTORING_MIGRATE --> ERROR : RESTORED
    RESTORING_MIGRATE --> ERROR : RESTORE_FAILED

    %% Projection & Terminal States
    PROJECTING --> SUCCESS : PROJECTED
    SUCCESS --> [*]
    ERROR --> [*]
```

## State Machine Summary

| Phase | States | Description |
|-------|--------|-------------|
| **Bootloader** | `INIT`, `SETUP_RUNTIME`, `READY`, `PARSING` | Verifies the reactive runtime environment, sets up harness MCP tools if required, and parses the requested operation. |
| **Detection** | `DETECTING` | Checks workspace and user skill directories to determine whether the target exists, is legacy, or is v1 reactive. Routes to the appropriate branch or halts on constraint errors. |
| **CRUD Lifecycle** | `PLANNING`, `APPROVING`, `EXECUTING`, `VERIFYING`, `ROLLING_BACK` | Scaffolds (`CREATE`), modifies (`UPDATE`), or deletes (`DELETE`) skills with a mandatory human approval gate and automated rollback on verification failure. |
| **Migration Lifecycle** | `BACKING_UP_MIGRATE`, `INFERRING_LEGACY`, `GRILLING_MIGRATE`, `INSPECTING_REACTIVE`, `PLANNING_MIGRATE`, `APPROVING_MIGRATE`, `EXECUTING_MIGRATE`, `VERIFYING_MIGRATE`, `RESTORING_MIGRATE` | Creates an atomic backup, analyzes legacy `SKILL.md` or v1 `skill.yaml` structure (with Socratic grilling if confidence is $< 0.5$), executes migration, and restores from backup on failure. |
| **Delivery & Terminus** | `PROJECTING`, `SUCCESS`, `ERROR` | Renders the manifest snapshot and inventory projection templates before completing or reporting errors. |
