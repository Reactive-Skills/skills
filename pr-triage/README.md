# PR Triage

Auditable pull request triage for review queues and release readiness.

## Capabilities

- PR metadata, check, review, diff, and ownership collection
- Risk, size, ownership, and reviewer classification
- Policy-based readiness assessment
- Deterministic routing and disposition recommendations
- Human approve, rework, and block gate
- Reproducible Markdown and JSON projections

## Invoke

```bash
npx -y @reactive-skills/axi invoke pr-triage --payload '{"repository":".","pull_requests":["12","14"],"triage_policy":{"max_size":"medium","required_checks":["test","lint"]}}'
```

Read the active state with `npx -y @reactive-skills/axi state pr-triage` and advance only with signals declared by that state.

## Directory Layout

```text
pr-triage/
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
│   ├── assess.md
│   ├── route.md
│   ├── review.md
│   ├── success.md
│   ├── blocked.md
│   └── error.md
└── templates/
    ├── triage_report.md.hbs
    └── state_snapshot.json.hbs
```

## Validation

```bash
node scripts/validate-skills.js --no-runtime pr-triage
npx -y @reactive-skills/axi inspect pr-triage
node --test pr-triage/guards/terminal_guard_assertions.test.js
```
