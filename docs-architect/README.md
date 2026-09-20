# Docs Architect

Documentation architecture workflow for turning repository evidence into living, diagram-backed documentation.

## Capabilities

- Source inventory and authority classification
- Fact, API, decision, and constraint extraction
- Audience and outcome driven information architecture
- Source-linked drafting and terminology control
- Embedded diagram planning and integrity checks
- Link, traceability, and readability validation
- Human publication gate with revision and rejection paths

## Invoke

```bash
npx -y @reactive-skills/axi invoke docs-architect --payload '{"source_paths":["README.md","src"],"audience":"maintainers","outcomes":["onboard","operate"]}'
```

Read the active state with `npx -y @reactive-skills/axi state docs-architect` and advance only with signals declared by that state.

## Directory Layout

```text
docs-architect/
├── CONTEXT.md
├── README.md
├── SKILL.md
├── STATECHART.md
├── skill.yaml
├── guards/
│   └── terminal_guard_assertions.test.js
├── states/
│   ├── intake.md
│   ├── discover.md
│   ├── extract.md
│   ├── design.md
│   ├── author.md
│   ├── diagram.md
│   ├── validate.md
│   ├── review.md
│   ├── success.md
│   ├── blocked.md
│   └── error.md
└── templates/
    ├── documentation_architecture.md.hbs
    ├── diagram_inventory.md.hbs
    └── state_snapshot.json.hbs
```

## Validation

```bash
node scripts/validate-skills.js --no-runtime docs-architect
npx -y @reactive-skills/axi inspect docs-architect
node --test docs-architect/guards/terminal_guard_assertions.test.js
```
