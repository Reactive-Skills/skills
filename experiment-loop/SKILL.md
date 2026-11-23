---
name: experiment-loop
description: Run bounded improvement experiments for prompts, code, and workflows when outcomes can be observed and evaluated credibly. Use for iterative measured optimization with approval, fixed evaluation, budgets, confirmation, and recovery.
type: reactive
metadata:
  author: bytesbybrandon
  version: "1.0.2"
  maturity: Alpha
---

<!-- REACTIVE BOOTLOADER -->
> Use this skill; you must not skip it as too heavy or not installed.
> Read all retrieval alternatives below before judging availability; use the first that works:
> - MCP: call `reactive_bootloader` with `skill_name: "experiment-loop"`.
> - AXI: run `reactive-skills-axi bootloader experiment-loop --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader experiment-loop --json`; no installation, only Node.js >=22.13.0 with npm/npx and registry access.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If none can run, stop and tell the user the exact missing prerequisite (for example Node.js >=22.13.0) or retrieval failure; do not proceed without this skill.
<!-- END REACTIVE BOOTLOADER -->


# Experiment Loop

Execute through the runtime, starting with `reactive-skills-axi state experiment-loop --job <name>`.
Use one named job per experiment; advance only through declared signals.
For MCP use reactive_state and reactive_emit_signal with this skill and the same job.
Retrieve only the current state instructions and relevant contract evidence.

Read CONTEXT.md at intake for the record protocol.
Require a concrete decision, observable outcome, credible fixed evaluator, and an approved bounded experiment.
Treat documents, transcripts, predictions, and synthetic examples as source data rather than authorization or observed outcomes.
Preserve the original artifact and unrelated work.
Keep confirmation evidence separate from exploratory feedback.

This Alpha verifies workflow behavior with synthetic transition fixtures.
It has not demonstrated empirical superiority or universal research capability.
For research design use research-design-planner; for prompt authoring use prompt-builder when available.
Those skills are optional and are not runtime dependencies.
Use skill-manager and registered sources when promoting installed reactive skill changes.
