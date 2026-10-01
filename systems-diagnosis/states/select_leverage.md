---
name: systems-diagnosis
description: Compare intervention options
type: reactive
---

# SELECT_LEVERAGE

Generate feasible options that could change relevant information, rules, structure, goals, or assumptions.

Use the book's leverage hierarchy as a search aid, not a universal ranking.

For each option, explain its mechanism, affected actors, likely delays, counterforces, feasibility, and possible side effects.

Ask the user to select an option when preferences or authority matter.

Store candidate_interventions and selected_intervention in contextUpdates.

## Anti-Shortcut Gate

- Do not treat a parameter adjustment as sufficient without a mechanism.
- Do not hide tradeoffs or affected groups.
- Do not execute the selected intervention.

Emit LEVERAGE_SELECTED when one candidate is selected.

Emit NO_VIABLE_OPTION when current hypotheses need revision.

## Signals

- LEVERAGE_SELECTED
- NO_VIABLE_OPTION
