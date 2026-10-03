---
name: pep8-review
description: Reactive review of Python changes for PEP 8 style and applicable project conventions.
type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "pep8-review"`.
> - AXI: run `reactive-skills-axi bootloader pep8-review --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader pep8-review --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
<!-- END REACTIVE BOOTLOADER -->

# PEP 8 Review

Review Python changes against PEP 8 and the target project's documented style rules and tool configuration.
Use PEP 257 for docstring conventions and PEP 484 for type hints only when they are in the review scope or enforced by the project.
Treat PEP 20 as context for readability, not as a mechanical checklist.
Review changed lines by default and include surrounding code only to understand them.
Report actionable findings with file, line, rule source, explanation, and a concrete correction.
Do not modify code or turn this style review into a correctness or security review.
