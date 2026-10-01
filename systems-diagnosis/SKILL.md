---
name: systems-diagnosis
description: >
  Diagnose recurring system behavior, map its structure, and choose a testable
  intervention. Use when a user asks why a system repeatedly produces an
  unwanted result or how to change that pattern.
metadata:
  author: Reactive-Skills
  version: "1.0.0"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "systems-diagnosis"`.
> - AXI: run `reactive-skills-axi bootloader systems-diagnosis --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader systems-diagnosis --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
<!-- END REACTIVE BOOTLOADER -->

# Systems Diagnosis

Use this skill to explain a recurring system behavior and shape a testable response.

Start with an observable pattern over time.

Confirm the system boundary and desired outcome before explaining causes.

Map only relationships relevant to the question.

Separate observed facts, inferred links, and unknowns.

Treat system traps and leverage rankings as hypotheses for investigation.

Return intervention options with mechanisms, counterforces, delays, and measurable tests.

Never execute external changes or present a single intervention as a universal fix.
