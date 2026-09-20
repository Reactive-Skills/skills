# onboarding-map

A reactive skill for structured codebase onboarding.

## Directory Layout

```
onboarding-map/
├── skill.yaml                         # Statechart SSOT
├── SKILL.md                           # Reactive bootloader
├── README.md                          # This file
├── CONTEXT.md                         # Domain language and invariants
├── STATECHART.md                      # Mermaid state diagram
├── states/
│   ├── intake.md                      # Collect role and repo path
│   ├── scan.md                        # Scan modules and ownership
│   ├── map.md                         # Build dependency graph
│   ├── path.md                        # Design learning path
│   ├── review.md                      # Stakeholder review
│   ├── success.md                     # Handoff complete
│   ├── blocked.md                     # Human intervention required
│   └── error.md                       # Error recovery
├── guards/
│   └── terminal_guard_assertions.test.js
└── templates/
    ├── onboarding_guide.md.hbs
    └── state_snapshot.json.hbs
```

## Invocation

```bash
npx -y @reactive-skills/axi invoke onboarding-map
```

## Lifecycle

`INTAKE → SCAN → MAP → PATH → REVIEW → SUCCESS`

Failure terminal states: `BLOCKED`, `ERROR`.
