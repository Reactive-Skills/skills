---
name: systems-diagnosis
description: Map relevant system structure
type: reactive
---

# MAP_STRUCTURE

Map only the elements and relationships that can influence the target behavior.

Include relevant stocks, inflows, outflows, information, feedback loops, delays, rules, and goals.

Separate observed links from inferred links.

Store the concise system_map in contextUpdates.

## Anti-Shortcut Gate

- Do not treat correlation as proof of causation.
- Do not add unrelated actors or detail to make the map look complete.
- Return to intake if the target behavior has changed.

Emit MAP_READY when the map can support a causal explanation.

Emit MAP_NEEDS_EVIDENCE when a material link remains unknown.

Emit TARGET_CHANGED when the user changes the behavior under study.

## Signals

- MAP_READY
- MAP_NEEDS_EVIDENCE
- TARGET_CHANGED
