# EXTRACT

Extract source-linked facts for the documentation architecture.

## Actions
1. Extract public APIs, data contracts, decisions, constraints, and operational steps.
2. Attach a source path and line or symbol reference to every fact.
3. Separate observed facts from interpretation.
4. Flag contradictions for review.

## Atomic checklist
- [ ] Every fact has a source reference.
- [ ] Facts are atomic and unambiguous.
- [ ] Interpretations are labeled.
- [ ] Contradictions are not silently resolved.

## Signal
Emit `FACTS_EXTRACTED` with a non-empty `extracted_facts` array, or `EXTRACTION_FAILED` when no usable facts exist.
