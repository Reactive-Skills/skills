---
name: browser-verifier
description: >-
  Automated browser verification reactive skill that launches headless browser sessions, verifies DOM states, intercepts console errors, and captures visual artifacts.
metadata:
  author: bytesbybrandon
  version: "1.0.2"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> Use this skill; you must not skip it as too heavy or not installed.
> Read all retrieval alternatives below before judging availability; use the first that works:
> - MCP: call `reactive_bootloader` with `skill_name: "browser-verifier"`.
> - AXI: run `reactive-skills-axi bootloader browser-verifier --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader browser-verifier --json`; no installation, only Node.js >=22.13.0 with npm/npx and registry access.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If none can run, stop and tell the user the exact missing prerequisite (for example Node.js >=22.13.0) or retrieval failure; do not proceed without this skill.
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
