# Test Coverage Gate

Deterministic coverage enforcement for release quality gates.

## Capabilities

- Test and coverage command validation
- Clean baseline enforcement
- Line, statement, branch, and function coverage measurement
- Threshold comparison and gap analysis
- Human exception and release-blocking gate
- Reproducible Markdown and JSON projections

## Invoke

```bash
npx -y @reactive-skills/axi invoke test-coverage-gate --payload '{"target_dir":".","test_command":"npm test","coverage_command":"npm run coverage","thresholds":{"lines":80,"statements":80,"branches":70,"functions":80}}'
```

Read the active state with `npx -y @reactive-skills/axi state test-coverage-gate` and advance only with signals declared by that state.

## Directory Layout

```text
test-coverage-gate/
├── CONTEXT.md
├── README.md
├── SKILL.md
├── STATECHART.md
├── skill.yaml
├── guards/
│   └── terminal_guard_assertions.test.js
├── states/
│   ├── intake.md
│   ├── configure.md
│   ├── baseline.md
│   ├── measure.md
│   ├── analyze.md
│   ├── gate.md
│   ├── success.md
│   ├── blocked.md
│   └── error.md
└── templates/
    ├── coverage_report.md.hbs
    └── state_snapshot.json.hbs
```

## Validation

```bash
node scripts/validate-skills.js --no-runtime test-coverage-gate
npx -y @reactive-skills/axi inspect test-coverage-gate
node --test test-coverage-gate/guards/terminal_guard_assertions.test.js
```
