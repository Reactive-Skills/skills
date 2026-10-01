# Systems Diagnosis Statechart

```mermaid
stateDiagram-v2
    [*] --> INIT

    INIT --> INTAKE: RUNTIME_READY
    INIT --> BYPASS_DETECTED: SETUP_REQUIRED

    INTAKE --> DEFINE_BOUNDARY: INTAKE_READY [problem_statement and behavior_over_time present]
    INTAKE --> INTAKE: NEED_INTAKE_DETAIL

    DEFINE_BOUNDARY --> MAP_STRUCTURE: BOUNDARY_CONFIRMED [boundary, horizon, and outcome present]
    DEFINE_BOUNDARY --> DEFINE_BOUNDARY: SCOPE_REVISED

    MAP_STRUCTURE --> DIAGNOSE_DYNAMICS: MAP_READY [system_map present]
    MAP_STRUCTURE --> MAP_STRUCTURE: MAP_NEEDS_EVIDENCE
    MAP_STRUCTURE --> INTAKE: TARGET_CHANGED

    DIAGNOSE_DYNAMICS --> SELECT_LEVERAGE: DYNAMICS_EXPLAINED [causal_hypotheses populated]
    DIAGNOSE_DYNAMICS --> MAP_STRUCTURE: EVIDENCE_CONFLICTS

    SELECT_LEVERAGE --> DESIGN_TEST: LEVERAGE_SELECTED [selected_intervention present]
    SELECT_LEVERAGE --> DIAGNOSE_DYNAMICS: NO_VIABLE_OPTION

    DESIGN_TEST --> SYNTHESIZE: TEST_DESIGNED [test_plan present]
    DESIGN_TEST --> SELECT_LEVERAGE: TEST_UNSAFE

    SYNTHESIZE --> [*]
    BYPASS_DETECTED --> [*]
```

## Guarded Transitions

- INTAKE_READY requires problem_statement and behavior_over_time.
- BOUNDARY_CONFIRMED requires system_boundary, time_horizon, and desired_outcome.
- MAP_READY requires system_map.
- DYNAMICS_EXPLAINED requires at least one causal hypothesis.
- LEVERAGE_SELECTED requires selected_intervention.
- TEST_DESIGNED requires test_plan.

## Revision Loops

- Missing intake evidence returns to INTAKE.
- Revised scope returns to DEFINE_BOUNDARY.
- Missing map evidence returns to MAP_STRUCTURE.
- Conflicting evidence returns to MAP_STRUCTURE.
- No viable intervention returns to DIAGNOSE_DYNAMICS.
- An unsafe test returns to SELECT_LEVERAGE.
