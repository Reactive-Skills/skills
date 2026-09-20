# CLASSIFY

Classify each commit into a changelog category.

## Actions
1. Parse conventional-commit prefixes and breaking markers.
2. Assign feature, fix, perf, refactor, test, chore, or breaking.
3. Record scope, breaking-change note, and source commit for each entry.
4. Reject or flag commits that cannot be classified deterministically.

## Atomic checklist
- [ ] Every commit is classified or flagged.
- [ ] Breaking changes are detected.
- [ ] Source commit references are preserved.
- [ ] Entry list is non-empty.

## Signal
Emit `ENTRIES_CLASSIFIED` with a non-empty `changelog_entries` array, or `CLASSIFICATION_FAILED` when no entries are produced.
