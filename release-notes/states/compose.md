# COMPOSE

Compose release notes from classified entries.
When `revision_feedback` is present, apply it to the previous draft.

## Actions
1. Order entries by category and severity.
2. Render each entry with a source link to its commit.
3. Surface breaking changes and migration guidance.
4. Save the draft as Markdown inside the runtime workspace and record its length.
5. Prefer importing that saved draft with the signal, using the selected compatible runtime and same run UUID:
   ```bash
   reactive-skills-axi emit release-notes NOTES_COMPOSED --job <run-uuid> --evidence '{"/release_notes":{"path":"<workspace-relative-notes-path>","media_type":"text/markdown"}}'
   ```
   The runtime resolves `/release_notes` before the existing non-empty guard and projects the same text.
   For MCP supply this map in `reactive_emit_signal.evidence`.
   Do not also send `release_notes` inline or under `contextUpdates` when binding it.
   Re-import after revisions. Correct import/verification failures before retrying; do not bypass validation or human review.
   Inline `release_notes` remains accepted on a compatible runtime.

## Atomic checklist
- [ ] Categories are ordered consistently.
- [ ] Every entry links to source.
- [ ] Breaking changes are prominent.
- [ ] Release notes are non-empty.

## Signal
Emit `NOTES_COMPOSED` with non-empty `release_notes`, or `COMPOSITION_FAILED` when notes are empty.
