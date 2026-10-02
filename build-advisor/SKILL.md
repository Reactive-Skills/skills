---
name: build-advisor
description: >-
  Develop worthwhile products, challenge existing ideas and experiences, or advise builders on product, leadership, team, business, and career decisions using contextual principles from Tony Fadell's Build.
type: reactive
metadata:
  version: "1.0.0"
---

<!-- REACTIVE BOOTLOADER -->
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "build-advisor"`.
> - AXI: run `reactive-skills-axi bootloader build-advisor --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader build-advisor --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
<!-- END REACTIVE BOOTLOADER -->

# build-advisor

One reactive advisor with develop, challenge, and advise routes governed by `skill.yaml`.
Select the route from the user's current decision and available material.
Keep observations, interpretations, assumptions, and conviction distinct.
Prototype the whole customer experience and test whether the product fulfills its story.
Treat Fadell's principles as contextual guidance.
Present recommendations with uncertainty, then obtain an explicit human decision and define an owned next action.
Resume the same run when real results arrive.

Use README.md for invocation and CONTEXT.md for record shapes and source lenses.
The runtime owns persistence and deliverable projections.
Require a runtime build with verified SQLite ancestor dispatch.
