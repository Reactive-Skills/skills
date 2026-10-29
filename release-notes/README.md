# Release Notes

Auditable, source-linked release note generation with quality gates.

## Capabilities

- Release scope, version, and format policy intake
- Commit and artifact collection within scope
- Changelog classification using conventional rules
- Draft release note composition from classifications
- Formatting, link integrity, and scope coverage validation
- Human approval, revision, and rejection gate
- Reproducible Markdown and JSON projections

## Runtime and saved evidence

Requires Reactive Skills runtime **0.20.0 or newer** with `evidence.local_registry` and `evidence.reference_submission`.
Run `reactive-skills-axi preflight release-notes --json` before invocation and stop on incompatibility; keep the same compatible transport and run UUID throughout.
Do not remove evidence fields to continue on an older runtime. Existing inline text submissions remain supported on compatible runtimes.

The compose state prefers `emit --evidence` with a workspace-relative path to the saved draft. `COMPOSITION_FAILED` stays inline.
This imports and verifies the saved bytes in the signal call, preserving existing guards, judgment inputs and projections.
For MCP, use `reactive_emit_signal` with the same pointer map in `evidence`.
For reuse, `evidence <skill> import <path> --media-type text/markdown --job <run-uuid>` returns a receipt; bind it as `{"/field":{"reference":<receipt>}}`.
Receipts belong to the selected run. Re-import after editing a file; do not reuse a receipt for changed content.
Only an explicit evidence read returns the saved content.

### Measured path

`release-notes/guards/evidence_references.test.cjs` runs the real CLI for `NOTES_COMPOSED` with a 2,400-byte saved draft: file written, then imported, then checked, then projected.
Every shape writes the draft file once (not shown in the table). Counts after that write cover: CLI calls, request argument bytes (excluding the skill path), response bytes, reads of the draft, saved blobs and receipts, and projection writes.
Every shape also has one host read of the projection to verify it. Starting the run is not counted.

| Shape | Calls | Request B | Response B | Draft reads | Blob reads | Receipt reads | Projection writes / B |
|---|---:|---:|---:|---:|---:|---:|---|
| Inline `release_notes` | 1 | 2,561 | 4,270 | 1 | 0 | 0 | 2 / 5,377 |
| `--evidence` path | 1 | 165 | 2,404 | 1 | 8 | 8 | 2 / 5,377 |
| Import, then receipt | 2 | 492 | 2,692 | 1 | 8 | 8 | 2 / 5,377 |
| Extra `evidence read` | +1 | +326 | +2,756 | 0 | +2 | +2 | 0 |

The projected `state.json` and `release-notes.md` both hold the same 2,400 bytes in every shape.
References cut request and response bytes. They do not cut total work: the runtime reads the saved blob and receipt 8 times each across import, checks and projection, and a separate receipt adds a call.
If you need the text again after a reference, `evidence read` costs one more call and returns the text (the extra row above). Inline hosts already have it.
This is one sample. Latency was not measured and no speedup is claimed. Rerun with `node --test release-notes/guards/evidence_references.test.cjs` on runtime 0.20.0.

## Invoke

```bash
npx -y @reactive-skills/axi invoke release-notes --payload '{"repository":".","release_version":"1.2.0","scope_refs":["main","v1.1.0"]}'
```

Read the active state with `npx -y @reactive-skills/axi state release-notes` and advance only with signals declared by that state.

## Directory Layout

```text
release-notes/
├── CONTEXT.md
├── README.md
├── SKILL.md
├── STATECHART.md
├── skill.yaml
├── guards/
│   └── terminal_guard_assertions.test.js
├── states/
│   ├── intake.md
│   ├── collect.md
│   ├── classify.md
│   ├── compose.md
│   ├── validate.md
│   ├── review.md
│   ├── success.md
│   ├── blocked.md
│   └── error.md
└── templates/
    ├── release_notes.md.hbs
    └── state_snapshot.json.hbs
```

## Validation

```bash
node scripts/validate-skills.js --no-runtime release-notes
npx -y @reactive-skills/axi inspect release-notes
node --test release-notes/guards/terminal_guard_assertions.test.js
```
