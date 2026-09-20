# api-contract

> **REACTIVE SKILL: STRICT RUNTIME EXECUTION**
> This skill is an event-driven state machine.
> Manual execution is forbidden.
>
> **DEFAULT EXECUTION: AXI CLI**
> AXI is the default runtime path, even when MCP tools are present.
> 1. Run `reactive-skills-axi state api-contract` to read the active job instructions.
> 2. Run `reactive-skills-axi invoke api-contract` only when you need a fresh isolated job.
> 3. For named or parallel work, keep the same `--job <job-id>` flag on every `state` and `emit` command.
> 4. Run `reactive-skills-axi emit api-contract <signal>` to advance the current job.
>
> **FALLBACK EXECUTION: MCP**
> Use `reactive_state` and `reactive_emit_signal` only when shell access to AXI is unavailable.
> Do not troubleshoot MCP before trying AXI.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.

## Description

`api-contract` is a workflow-type reactive skill that detects drift between an OpenAPI/Swagger specification and client-side code that consumes it. It parses the API spec, walks client `fetch`/`axios` calls, diffs endpoint coverage and type compatibility, classifies findings by severity, and projects a structured drift report with fix recommendations.

## Installation

```bash
# Zero-install via npx
npx -y @reactive-skills/axi state api-contract

# Or install globally
npm install -g @reactive-skills/axi
reactive-skills-axi state api-contract
```

## Directory Layout

```
skills/api-contract/
├── SKILL.md                          # Bootloader + runtime instructions
├── README.md                         # This file (human-facing docs)
├── skill.yaml                        # HSM statechart manifest (v2.0.0)
├── STATECHART.md                     # Mermaid state diagram
├── CONTEXT.md                        # Domain language & invariants
├── states/                           # State prompt templates
│   ├── discover_apis.md
│   ├── validation_pipeline/
│   │   ├── drift_diffing.md
│   │   └── schema_validation/
│   │       ├── openapi_check.md
│   │       ├── type_compatibility.md
│   │       ├── breaking_change_detection.md
│   │       └── example_conformance.md
│   ├── drift_analysis.md
│   ├── report/
│   │   ├── violation_summary.md
│   │   └── fix_recommendations.md
│   ├── gate.md
│   ├── completed.md
│   ├── blocked.md
│   └── error.md
├── guards/                           # Custom guard functions (.gitkeep placeholder)
├── templates/                        # Handlebars deliverable projections
│   ├── drift_report.md.hbs
│   ├── coverage_matrix.md.hbs
│   └── state_snapshot.json.hbs
└── runtime/
    ├── middleware/
    │   ├── telemetry.js
    │   ├── audit.js
    │   ├── invariant_checker.js
    │   └── context_sanitizer.js
    └── hooks/
        └── invariants.yaml
```

## States Overview

| State | Type | Description |
|---|---|---|
| DISCOVER_APIS | Leaf | Locate OpenAPI spec and client code paths |
| VALIDATION_PIPELINE | Composite | Orchestrates schema validation and drift diffing |
| SCHEMA_VALIDATION | Composite (sub) | Parse and validate OpenAPI schema |
| OPENAPI_CHECK | Leaf | Validate spec is well-formed OpenAPI/Swagger |
| TYPE_COMPATIBILITY | Leaf | Verify schema types and definitions are consistent |
| BREAKING_CHANGE_DETECTION | Leaf | Scan for deprecated endpoints and breaking patterns |
| EXAMPLE_CONFORMANCE | Leaf | Validate spec examples match schema definitions |
| DRIFT_DIFFING | Leaf | Walk client code, diff against spec |
| DRIFT_ANALYSIS | Leaf | Classify drift findings by severity |
| REPORT | Composite | Generate violation summary and fix recommendations |
| VIOLATION_SUMMARY | Leaf | Summarize violations by category |
| FIX_RECOMMENDATIONS | Leaf | Generate actionable fix recommendations |
| GATE | Leaf (HITL) | Human review: approve, request revisions, or reject |
| COMPLETED | Terminal | Validation complete successfully |
| BLOCKED | Terminal | Critical issues found, workflow halted |
| ERROR | Terminal | Unrecoverable error occurred |

## Usage

```bash
# Read current state
npx -y @reactive-skills/axi state api-contract

# Start the skill with a spec path and client code paths
npx -y @reactive-skills/axi invoke api-contract \
  --payload '{"api_spec_path": "openapi.json", "client_code_paths": ["src/api/"]}'

# After completing each state's task, emit the next signal
npx -y @reactive-skills/axi emit api-contract SPEC_LOADED \
  --payload '{"api_spec_path": "openapi.json", "client_code_paths": ["src/api/"]}'
```

## Deliverables

Projected to `.docs/api-contract/` on state transitions:
- `drift.md` — Findings, severity classification, and fix recommendations
- `coverage.md` — Endpoint coverage matrix (spec paths vs client call sites)
- `state.json` — Machine-readable context snapshot

## Middleware

| Hook | Trigger | Purpose |
|---|---|---|
| `telemetry` | post_transition | Transition events to stdout |
| `audit` | post_transition | Immutable audit log at `.reactive/api-contract.audit.log` |
| `invariant_checker` | post_transition | Verify context constraints after transitions |
| `context_sanitizer` | pre_transition | Redact secrets/tokens before LLM context |
