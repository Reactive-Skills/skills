# COLLECT

Collect commits and artifacts within the release scope.

## Actions
1. Resolve the scope refs to a commit range.
2. Enumerate commits with hashes, authors, dates, and messages.
3. Attach linked artifacts, PRs, and breaking-change markers.
4. Preserve every commit identifier for classification.

## Atomic checklist
- [ ] Commit range is resolved.
- [ ] Commits have source identifiers.
- [ ] Artifacts and links are recorded.
- [ ] Commit list is non-empty.

## Signal
Emit `COLLECTION_COMPLETE` with a non-empty `commits` array, or `COLLECTION_FAILED` when no commits are in scope.
