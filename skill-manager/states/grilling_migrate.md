# GRILLING_MIGRATE State

## Goal
Run targeted Socratic questions for ambiguous parts of the legacy SKILL.md migration.

## Logic
- Present the user with specific questions about ambiguous sections
- Questions are generated based on ambiguity_notes from INFERRING_LEGACY
- Each answer refines one inferred state

## Questions to Ask (examples, actual ones depend on ambiguity_notes):
1. What is the order of these phases? Are any parallel?
2. Is this a loop or a one-way transition?
3. Is there a failure path here or does it always succeed?
4. Does the user need to approve anything here?

## Stop Criteria
User answers all questions. Emit GRILL_COMPLETE.

## Signal
Emit: GRILL_COMPLETE