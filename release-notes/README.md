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
