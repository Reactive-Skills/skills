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

The draft states prefer `emit --evidence` with workspace-relative Markdown paths.
This imports and verifies the saved bytes in the signal call, preserving existing guards, judgment inputs and projections.
For MCP, use `reactive_emit_signal` with the same pointer map in `evidence`.
For reuse, `evidence <skill> import <path> --media-type text/markdown --job <run-uuid>` returns a receipt; bind it as `{"/field":{"reference":<receipt>}}`.
Receipts belong to the selected run. Re-import after editing a file; do not reuse a receipt for changed content.
Only an explicit evidence read returns the saved content.

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
