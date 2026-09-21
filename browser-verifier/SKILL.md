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
> **DEFAULT EXECUTION: AXI CLI**
> AXI is the default runtime path, even when MCP tools are present.
> - To start a new task: Run `reactive-skills-axi invoke browser-verifier [--payload JSON]`
> - To resume an active task: Run `reactive-skills-axi state browser-verifier`
> - For named or parallel work: Keep the same `--job <job-id>` flag on every command.
> - To advance state: Run `reactive-skills-axi emit browser-verifier <signal>`
>
> **FALLBACK EXECUTION: MCP**
> Use `reactive_state` and `reactive_emit_signal` only when shell access to AXI is unavailable.
> Do not troubleshoot MCP before trying AXI.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run `reactive-skills-axi reset browser-verifier` or `reactive-skills-axi invoke browser-verifier`.
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
