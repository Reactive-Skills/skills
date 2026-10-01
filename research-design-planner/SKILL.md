---
name: research-design-planner
description: >-
  Reactive research design guide based on Creswell and Creswell, Research Design,
  sixth edition. Routes users from uncertainty to a focused design task and loads
  only the needed method or proposal states.
type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "research-design-planner"`.
> - AXI: run `reactive-skills-axi bootloader research-design-planner --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader research-design-planner --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
<!-- END REACTIVE BOOTLOADER -->

# Research Design Planner

Use this skill to explore, choose, plan, or review a research design.
It supports quantitative, qualitative, and mixed methods work.
Start at the user's current need, including "I am not sure yet."
The state machine routes to one focused path and loads its prompt just in time.

Use explicit user choices as facts.
Use judgment contracts only for semantic recommendations among declared options.
Do not send identifying participant information or unrelated context to a judgment.
When emitting a signal, place only relevant declared context keys under `payload.contextUpdates`.
When confidence is below 0.7, a choice is malformed, or a judgment backend fails, ask a focused clarifying question.
Never silently select a method after a failed judgment.

The book informs the guidance but does not override the user's request.
Use its concepts in paraphrase and cite the source when producing a design brief.
Do not reproduce extended passages or examples.
Never invent participants, data, results, references, ethics approvals, or institutional requirements.
