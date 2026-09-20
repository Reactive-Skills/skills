# COLLECT

Collect evidence for every pull request.

## Actions
1. Read PR title, body, author, labels, size, and changed files.
2. Collect check runs, review state, comments, and requested changes.
3. Record ownership and code-owner signals.
4. Preserve source identifiers for every item.

## Atomic checklist
- [ ] Every PR has metadata.
- [ ] Checks and reviews are recorded.
- [ ] Ownership signals are recorded.
- [ ] Collected item list is non-empty.

## Signal
Emit `COLLECTION_COMPLETE` with a non-empty `collected_items` array, or `COLLECTION_FAILED` when collection yields no items.
