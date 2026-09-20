# AUTHOR

Draft documentation from the approved outline and extracted facts.

## Actions
1. Write one source-linked claim at a time.
2. Use the audience vocabulary and outcome-first headings.
3. Link related pages and identify unresolved gaps.
4. Save the draft at `draft_path`.

## Atomic checklist
- [ ] Claims trace to extracted facts.
- [ ] Headings support reader outcomes.
- [ ] Cross-links are meaningful.
- [ ] Draft path is recorded.

## Signal
Emit `DRAFT_WRITTEN` with a non-empty `draft_path`, or `AUTHORING_FAILED` when drafting cannot produce a draft.
