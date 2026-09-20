# COMPOSE

Compose release notes from classified entries.

## Actions
1. Order entries by category and severity.
2. Render each entry with a source link to its commit.
3. Surface breaking changes and migration guidance.
4. Save the draft and record its length.

## Atomic checklist
- [ ] Categories are ordered consistently.
- [ ] Every entry links to source.
- [ ] Breaking changes are prominent.
- [ ] Release notes are non-empty.

## Signal
Emit `NOTES_COMPOSED` with non-empty `release_notes`, or `COMPOSITION_FAILED` when notes are empty.
