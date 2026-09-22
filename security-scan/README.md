# security-scan

> **REACTIVE SKILL: STRICT RUNTIME EXECUTION**
> This skill is an event-driven state machine.
> Manual execution is forbidden.
>
> **LOCAL-FIRST RUNTIME SELECTION**
> INIT checks local MCP and AXI capabilities and version compatibility before launching a runtime.
> 1. Use the selected compatible local transport for `state`, `invoke`, and `emit`.
> 2. Use direct `reactive-skills-axi` when installed and compatible.
> 3. Use `npx -y @reactive-skills/axi` as AXI's zero-install launcher when direct AXI is unavailable.
> 4. Persist the selected transport and version for the full run.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.

## Description

`security-scan` is a workflow-type reactive skill that scans git-staged changes for secrets, credentials, and insecure configurations before commit. It uses deterministic regex pattern matching and entropy heuristics to detect high-signal security violations, then generates a remediation checklist.

## Installation

```bash
# Zero-install via npx
npx -y @reactive-skills/axi state security-scan

# Or install globally
npm install -g @reactive-skills/axi
reactive-skills-axi state security-scan
```

## Directory Layout

```
security-scan/
├── SKILL.md                              # Bootloader + runtime instructions
├── README.md                             # This file (human-facing docs)
├── skill.yaml                            # HSM statechart manifest (v2.0.0)
├── STATECHART.md                         # Mermaid state diagram
├── CONTEXT.md                            # Domain language & invariants
├── states/                               # State prompt templates
│   ├── collect_staged.md
│   ├── scan_pipeline/
│   │   ├── secrets_scan.md
│   │   ├── credentials_scan.md
│   │   └── config_scan.md
│   ├── report/
│   │   ├── violation_summary.md
│   │   └── remediation.md
│   ├── gate.md                           # HITL human gate
│   ├── completed.md                      # Terminal
│   ├── blocked.md                        # Terminal (critical findings)
│   └── error.md                          # Terminal (unrecoverable error)
├── guards/
│   ├── .gitkeep
│   └── entropy_check.js                  # Custom entropy guard function
├── templates/                            # Handlebars deliverable projections
│   ├── findings.md.hbs
│   ├── remediation_checklist.md.hbs
│   └── state_snapshot.json.hbs
└── runtime/
    ├── middleware/
    │   ├── telemetry.js
    │   ├── audit.js
    │   ├── metrics.js
    │   ├── invariant_checker.js
    │   └── context_sanitizer.js
    └── hooks/
        └── invariants.yaml
```

## States Overview

| State | Type | Description |
|---|---|---|
| COLLECT_STAGED | Leaf | Collect git-staged files for scanning |
| SCAN_PIPELINE | Composite | Orchestrates secrets, credentials, and config scans |
| SECRETS_SCAN | Leaf | Scan for API keys, tokens, private keys (regex + entropy) |
| CREDENTIALS_SCAN | Leaf | Scan for hardcoded credentials |
| CONFIG_SCAN | Leaf | Scan for insecure defaults, debug mode, hardcoded IPs |
| REPORT | Composite | Generate findings summary and remediation checklist |
| VIOLATION_SUMMARY | Leaf | Summarize findings by severity and category |
| REMEDIATION | Leaf | Generate actionable remediation checklist |
| GATE | Leaf (HITL) | Human review: pass, request remediation, or block |
| COMPLETED | Terminal | Scan complete, no critical issues |
| BLOCKED | Terminal | Critical secrets found, commit blocked |
| ERROR | Terminal | Unrecoverable error |

## Usage

```bash
# Read current state
npx -y @reactive-skills/axi state security-scan

# Start the skill
npx -y @reactive-skills/axi invoke security-scan \
  --payload '{"staged_files": ["src/api/config.js", "src/utils/auth.ts"]}'

# After completing each state, emit the next signal
npx -y @reactive-skills/axi emit security-scan STAGED_FILES \
  --payload '{"staged_files": ["src/api/config.js", "src/utils/auth.ts"]}'
```

## Deliverables

Projected to `.docs/security-scan/` on state transitions:
- `findings.md` — Full findings report with severity classification
- `remediation-checklist.md` — Actionable remediation checklist
- `state.json` — Machine-readable state snapshot

## Middleware

| Hook | Trigger | Purpose |
|---|---|---|
| `telemetry` | post_transition | Transition events to stdout |
| `audit` | post_transition | Immutable audit log, redacts secrets |
| `metrics` | post_transition | Prometheus metrics on port 9091 |
| `invariant_checker` | post_transition | Verify context constraints after transitions |
| `context_sanitizer` | pre_transition | Redact secrets/credentials before LLM context |
