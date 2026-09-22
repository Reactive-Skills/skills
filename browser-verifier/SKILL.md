---
name: browser-verifier
description: >-
  Automated browser verification reactive skill that launches headless browser sessions, verifies DOM states, intercepts console errors, and captures visual artifacts.
metadata:
  author: Reactive-Skills
  version: "1.0.0"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> **REACTIVE SKILL: STRICT RUNTIME EXECUTION**
> This skill is an event-driven state machine. Manual execution is forbidden.
>
> **LOCAL-FIRST RUNTIME SELECTION**
> Select one compatible runtime during INIT, then reuse it for the full run.
> - To start a new task, use selected runtime `invoke browser-verifier [--payload JSON]`.
> - To resume an active task, use selected runtime `state browser-verifier`.
> - For named or parallel work, keep the same `--job <alias>` flag on every command.
> - The runtime resolves aliases to immutable UUID-backed `run_id` values.
> - To advance state, use selected runtime `emit browser-verifier <signal>`.
>
> **SELECTED RUNTIME COMMANDS**
> Use selected MCP or AXI path for every state and signal command.
> First check `reactive_capabilities` when this MCP tool is available.
> Otherwise check `reactive-skills-axi capabilities --json`, then use direct AXI.
> Otherwise use `npx -y @reactive-skills/axi capabilities --json`, then use zero-install AXI.
> MCP uses `reactive_state` and `reactive_emit_signal`.
> Direct AXI uses `reactive-skills-axi state|emit browser-verifier`.
> Zero-install AXI uses `npx -y @reactive-skills/axi state|emit browser-verifier`.
> Emit `RUNTIME_READY` with `transport`, `launcher`, `runtime_version`, `axi_version`, `compatible`, and `capabilities`.
> Persist the selected runtime in `payload.contextUpdates` so later states reuse it.
> AXI remains the runtime interface. `npx` is only its zero-install launcher.
> Do not repeat version or capability checks after INIT.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run selected runtime `reset browser-verifier` or `invoke browser-verifier`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# Browser Verifier

`browser-verifier` is an automated, event-driven reactive quality gate for real browser interfaces. It launches headless browser sessions, navigates to target URLs, executes DOM assertions, monitors console and network health, and captures screenshots and DOM snapshots for release proof.

## Workflow

`INTAKE -> BOOT -> NAVIGATE -> ASSERT_DOM -> INSPECT_CONSOLE -> CAPTURE_ARTIFACT -> GATE -> SUCCESS`

Failures terminate in `ERROR`; broken assertions or console errors terminate in `BLOCKED`.

## Usage

```bash
npx -y @reactive-skills/axi invoke browser-verifier --payload '{"target_url":"http://localhost:3000","assertion_rules":[{"selector":"h1","expected":"Welcome"}]}'
```

## Deliverables

Artifacts are projected into `.docs/browser-verifier/`:
- `screenshot.png` — Full-page visual artifact
- `dom_snapshot.html` — Rendered DOM snapshot
- `verification_report.json` — Machine-readable scorecard
