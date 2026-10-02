---
name: tdd-refactor
description: "Hierarchical TDD & Refactoring state machine with nested micro-cycles, regression detection, event bubbling, and live projections"
type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "tdd-refactor"`.
> - AXI: run `reactive-skills-axi bootloader tdd-refactor --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader tdd-refactor --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
<!-- END REACTIVE BOOTLOADER -->

# tdd-refactor

Skill: tdd-refactor governed by `skill.yaml`.

