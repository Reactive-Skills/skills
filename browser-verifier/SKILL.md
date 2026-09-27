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
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "browser-verifier"`.
> - AXI: run `reactive-skills-axi bootloader browser-verifier --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader browser-verifier --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
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
