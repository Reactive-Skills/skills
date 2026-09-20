# DIAGRAM

Create embedded diagrams from documented relationships.

## Actions
1. Select relationships that benefit from visual explanation.
2. Generate Mermaid or repository-native diagrams from sourced nodes and edges.
3. Embed each diagram beside the relevant claim.
4. Record title, type, source references, and validation status.

## Atomic checklist
- [ ] Every diagram has a purpose.
- [ ] Nodes and edges trace to facts.
- [ ] Diagrams are embedded in the draft.
- [ ] Inventory is non-empty.

## Signal
Emit `DIAGRAMS_EMBEDDED` with a non-empty `diagram_inventory`, or `DIAGRAM_FAILED` when no valid diagram can be produced.
