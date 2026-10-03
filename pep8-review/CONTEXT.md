# Context

## Terms

- Review input: A diff, changed files, or source supplied for review.
- Project rules: Style instructions and tool settings found in the target repository.
- Finding: A specific, evidenced style mismatch with a file and line reference.
- Companion PEP: A separate proposal that applies to a related topic such as docstrings or type hints.

## Rule Order

Apply explicit project style documentation and configured formatter or linter rules first.
Use surrounding project conventions when no explicit rule covers the case.
Use PEP 8 as the baseline where project guidance is silent.
Use PEP 257 for docstrings only when docstrings are in scope.
Use PEP 484 for annotations only when type hints are in scope or project tooling enforces them.
Use PEP 20 as readability context, not as an enforceable style checklist.
PEP numbers do not form a cumulative sequence.

## Boundaries

Review style only.
Do not report correctness, security, or performance concerns as style findings.
Review changed lines by default, with enough surrounding context to establish the rule.
Do not infer configuration from installed dependencies.
Do not invent style rules when source, project settings, or official guidance do not support them.
Do not modify source code.

## Finding Evidence

Each finding identifies the file and line, the applicable project rule or PEP section, the observed mismatch, and a concrete correction.
If a concern is uncertain or outside scope, omit it or ask a focused question.


## Schema and Operation

Schema version is 2.1.0.
The skill runs one review workflow through INIT, INTAKE, DISCOVER_RULES, REVIEW, and REPORT.
ERROR and BYPASS_DETECTED are terminal recovery states.
The skill does not support create, update, delete, or migration operations; skill-manager owns those lifecycle actions.
