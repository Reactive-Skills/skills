# product-manager — Statechart

Visual representation and transition specifications for the `product-manager` state machine.

---

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> INIT

    INIT --> SELECT_OPPORTUNITY_TYPE: RUNTIME_READY
    INIT --> SETUP_RUNTIME: SETUP_REQUIRED

    SETUP_RUNTIME --> SELECT_OPPORTUNITY_TYPE: SETUP_COMPLETE (exit_code == 0)
    SETUP_RUNTIME --> ERROR: SETUP_FAILED (exit_code != 0)

    SELECT_OPPORTUNITY_TYPE --> RESEARCH_DISCOVERY: OPPORTUNITY_SELECTED (opportunity_type != null)

    RESEARCH_DISCOVERY --> VALIDATE_WORTHWHILENESS: DISCOVERY_COMPLETED
    RESEARCH_DISCOVERY --> SELECT_OPPORTUNITY_TYPE: PIVOT_INTAKE

    VALIDATE_WORTHWHILENESS --> ALIGN_GOALS: WORTHWHILE_CONFIRMED
    VALIDATE_WORTHWHILENESS --> REVIEW_GATE: WORTHWHILE_DOUBTFUL

    ALIGN_GOALS --> GATHER_TEST_REQUIREMENTS: GOALS_ALIGNED
    ALIGN_GOALS --> RESEARCH_DISCOVERY: REALIGN_RESEARCH

    GATHER_TEST_REQUIREMENTS --> FORMULATE_SMART: REQUIREMENTS_TESTED
    GATHER_TEST_REQUIREMENTS --> ALIGN_GOALS: REVISE_GOALS

    FORMULATE_SMART --> EISENHOWER_PRIORITIZATION: SMART_SCOPED
    FORMULATE_SMART --> GATHER_TEST_REQUIREMENTS: REFINE_REQUIREMENTS

    EISENHOWER_PRIORITIZATION --> VERTICAL_SLICING: PRIORITIZATION_COMPLETE
    EISENHOWER_PRIORITIZATION --> FORMULATE_SMART: REVISE_SCOPE

    VERTICAL_SLICING --> REVIEW_GATE: SLICES_DECOMPOSED
    VERTICAL_SLICING --> EISENHOWER_PRIORITIZATION: REVISE_PRIORITIES

    REVIEW_GATE --> PROJECTING: USER_APPROVED
    REVIEW_GATE --> VERTICAL_SLICING: REVISE_SLICES
    REVIEW_GATE --> EISENHOWER_PRIORITIZATION: REVISE_PRIORITIES
    REVIEW_GATE --> ERROR: ABORT

    PROJECTING --> SUCCESS: PROJECTED

    SUCCESS --> [*]
    ERROR --> [*]
```

---

## States & Transitions Reference

| State | Signal | Target | Guard | Description |
|---|---|---|---|---|
| `INIT` | `RUNTIME_READY` | `SELECT_OPPORTUNITY_TYPE` | — | Runtime harness verified |
| `INIT` | `SETUP_REQUIRED` | `SETUP_RUNTIME` | — | Auto-configuration required |
| `SETUP_RUNTIME` | `SETUP_COMPLETE` | `SELECT_OPPORTUNITY_TYPE` | `payload.exit_code == 0` | Harness auto-configured |
| `SETUP_RUNTIME` | `SETUP_FAILED` | `ERROR` | `payload.exit_code != 0` | Auto-configuration failed |
| `SELECT_OPPORTUNITY_TYPE` | `OPPORTUNITY_SELECTED` | `RESEARCH_DISCOVERY` | `context.opportunity_type != null` | Opportunity mode chosen |
| `RESEARCH_DISCOVERY` | `DISCOVERY_COMPLETED` | `VALIDATE_WORTHWHILENESS` | — | Market/user evidence gathered |
| `RESEARCH_DISCOVERY` | `PIVOT_INTAKE` | `SELECT_OPPORTUNITY_TYPE` | — | Re-evaluate product classification |
| `VALIDATE_WORTHWHILENESS` | `WORTHWHILE_CONFIRMED` | `ALIGN_GOALS` | — | Opportunity passes 4-axis test |
| `VALIDATE_WORTHWHILENESS` | `WORTHWHILE_DOUBTFUL` | `REVIEW_GATE` | — | Low viability triggers human gate |
| `ALIGN_GOALS` | `GOALS_ALIGNED` | `GATHER_TEST_REQUIREMENTS` | — | Goals, OKRs & anti-goals defined |
| `ALIGN_GOALS` | `REALIGN_RESEARCH` | `RESEARCH_DISCOVERY` | — | Strategic misalignment triggers research revisit |
| `GATHER_TEST_REQUIREMENTS` | `REQUIREMENTS_TESTED` | `FORMULATE_SMART` | — | Falsification tests passed |
| `GATHER_TEST_REQUIREMENTS` | `REVISE_GOALS` | `ALIGN_GOALS` | — | Requirements suggest different goals |
| `FORMULATE_SMART` | `SMART_SCOPED` | `EISENHOWER_PRIORITIZATION` | — | SMART criteria formulated |
| `FORMULATE_SMART` | `REFINE_REQUIREMENTS` | `GATHER_TEST_REQUIREMENTS` | — | Unresolved ambiguities found |
| `EISENHOWER_PRIORITIZATION` | `PRIORITIZATION_COMPLETE` | `VERTICAL_SLICING` | — | Scope sorted into Q1–Q4 |
| `EISENHOWER_PRIORITIZATION` | `REVISE_SCOPE` | `FORMULATE_SMART` | — | Scope adjustments requested |
| `VERTICAL_SLICING` | `SLICES_DECOMPOSED` | `REVIEW_GATE` | — | Vertical slices & MVP boundary defined |
| `VERTICAL_SLICING` | `REVISE_PRIORITIES` | `EISENHOWER_PRIORITIZATION` | — | Slice dependencies force reprioritization |
| `REVIEW_GATE` | `USER_APPROVED` | `PROJECTING` | — | Human approves specification |
| `REVIEW_GATE` | `REVISE_SLICES` | `VERTICAL_SLICING` | — | Human requests slice redesign |
| `REVIEW_GATE` | `REVISE_PRIORITIES` | `EISENHOWER_PRIORITIZATION` | — | Human requests priority reshuffle |
| `REVIEW_GATE` | `ABORT` | `ERROR` | — | Human cancels opportunity |
| `PROJECTING` | `PROJECTED` | `SUCCESS` | — | Specs and inventory written to disk |
| `SUCCESS` | — | `[*]` | — | Terminal success state |
| `ERROR` | — | `[*]` | — | Terminal error state |
