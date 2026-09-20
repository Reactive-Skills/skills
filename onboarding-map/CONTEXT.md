# CONTEXT

## Ubiquitous Language

| Term | Definition |
|------|-----------|
| **module** | A discrete unit of code (package, library, service) with a bounded responsibility |
| **ownership** | The team or individual responsible for maintaining a module |
| **dependency graph** | A directed graph of module-to-module import relationships |
| **learning path** | An ordered sequence of resources, exercises, and ramp-up tasks |
| **stakeholder** | A reviewer with domain expertise who validates the learning path |
| **onboarding guide** | The final deliverable document handed to the new contributor |

## Domain Invariants

1. At least one entry point module must exist in any onboardable repo.
2. The learning path must reference at least one owned module.
3. `INTAKE` must complete before `SCAN` begins (role context required).
4. `REVIEW` may cycle back to `PATH` if feedback is `REJECTED`.
5. `SUCCESS` and `BLOCKED` and `ERROR` are terminal — no forward transitions.

## Boundary Conditions

- **Empty repo**: If `module_count == 0` after `SCAN`, emit `ERROR`.
- **No stakeholders**: If no reviewers respond within 48 hours, `REVIEW` → `BLOCKED`.
- **Circular dependencies**: Graph detection in `MAP` flags cycles as a warning.
