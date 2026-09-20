# STATECHART — security-scan

```mermaid
stateDiagram-v2
    [*] --> COLLECT_STAGED
    COLLECT_STAGED --> SCAN_PIPELINE : STAGED_FILES\n(guard: staged_files.length > 0)

    state SCAN_PIPELINE {
        [*] --> SECRETS_SCAN
        SECRETS_SCAN --> CREDENTIALS_SCAN : SECRETS_SCANNED\n(guard: exit_code === 0)
        CREDENTIALS_SCAN --> CONFIG_SCAN : CREDENTIALS_SCANNED\n(guard: exit_code === 0)
        CONFIG_SCAN --> REPORT : CONFIG_SCANNED\n(guard: exit_code === 0, exits SCAN_PIPELINE)
    }

    state REPORT {
        [*] --> VIOLATION_SUMMARY
        VIOLATION_SUMMARY --> REMEDIATION : SUMMARY_GENERATED\n(guard: exit_code === 0)
        REMEDIATION --> GATE : REMEDIATION_GENERATED\n(guard: exit_code === 0, exits REPORT)
    }

    GATE --> COMPLETED : USER_APPROVED\n(guard: approved === true)
    GATE --> SCAN_PIPELINE : REQUEST_REMEDIATION\n(guard: remediation_requested === true)
    GATE --> BLOCKED : USER_REJECTED\n(guard: rejected === true)

    COMPLETED --> [*]
    BLOCKED --> [*]
    ERROR --> [*]
```

## Bubble-Up Transitions

1. **`CRITICAL_SECRET_FOUND`** (from any substate of SCAN_PIPELINE): Guards with `event.payload.severity === 'critical'`, transitions to `BLOCKED`. Catches security-critical secrets (e.g., AWS access keys, private keys with high entropy) without requiring each leaf scan to handle them.

2. **`REPORT_ERROR`** (from any substate of REPORT): Transitions to `ERROR` terminal state for unrecoverable report generation failures.

## Gate Semantics

The `GATE` state is the sole Human-in-the-Loop (HITL) checkpoint. The user can:
- **Pass (no critical issues)** → `COMPLETED` (guard: `approved === true`)
- **Request Remediation** → `SCAN_PIPELINE` (guard: `remediation_requested === true`) — re-runs all scans
- **Block Commit** → `BLOCKED` (guard: `rejected === true`) — halts with critical findings

## Scan Pipeline Flow

```
SECRETS_SCAN → CREDENTIALS_SCAN → CONFIG_SCAN
     |              |              |
     |              |              |
     └────────── All must pass (exit_code === 0) ───────────┘
                          ↓
                       REPORT
```

Each scan sub-state runs independently with deterministic guards. If any scan fails (exit_code !== 0), the transition is blocked and the scan must be retried. If a critical secret is found, the `CRITICAL_SECRET_FOUND` bubble-up event propagates to the parent `SCAN_PIPELINE` state, which transitions to `BLOCKED`.

## Event Sourcing

All signals, guard evaluations, and state transitions are appended to:
- `.reactive/skills/security-scan/events.jsonl` (human-readable)
- `.reactive/skills/security-scan/events.db` (SQLite queries)

Deliverable projections are triggered on `STATE_TRANSITION` and `SIGNAL_EMITTED` events, rendering from Handlebars templates in `templates/`.
