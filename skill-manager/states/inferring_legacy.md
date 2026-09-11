# INFERRING_LEGACY State

## Goal
Parse the legacy SKILL.md and infer discrete states from its content.

## Logic
- Read SKILL.md content
- Look for:
  - Numbered steps (1., 2., 3.)
  - Section headers that imply phases (## Phase 1, ## Discovery, ## Execution)
  - Keywords: "then", "next", "after", "when done"
  - Repeated workflow patterns
- Assign confidence score (0.0 to 1.0) based on how clearly structured the content is
- Emit LOW_CONFIDENCE if confidence < 0.5, INFERRED if >= 0.5

## Context Variables Set
- inferred_states: array of {name, description, transitions}
- confidence: number between 0.0 and 1.0
- ambiguity_notes: array of sections that were ambiguous

## Signal
Emit: INFERRED (confidence >= 0.5) or LOW_CONFIDENCE (confidence < 0.5)
