---
name: systems-diagnosis
description: Explain the pattern with causal hypotheses
type: reactive
---

# DIAGNOSE_DYNAMICS

Explain how the mapped structure could produce the observed pattern over time.

Consider reinforcing and balancing feedback, delays, changing loop strength, limits, and unintended effects.

Compare at least one plausible alternative when evidence permits.

Name a system trap only when its structure fits.

Store causal_hypotheses and archetype_hypotheses in contextUpdates with support, contrary evidence, and uncertainty.

## Anti-Shortcut Gate

- Do not present an inference as an observed fact.
- Do not force a familiar archetype onto a poor fit.
- Do not recommend an intervention before stating the proposed mechanism.

Emit DYNAMICS_EXPLAINED when at least one testable hypothesis is recorded.

Emit EVIDENCE_CONFLICTS when the map needs revision.

## Signals

- DYNAMICS_EXPLAINED
- EVIDENCE_CONFLICTS
