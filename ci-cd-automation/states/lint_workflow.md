# LINT_WORKFLOW State — CI/CD Automation

## Goal
Verify workflow YAML syntax, step dependencies, and action versions.

## Instructions
1. Parse generated YAML to ensure syntactic validity.
2. Verify all `needs:` step dependencies form an acyclic directed graph.
3. If YAML passes linting with zero syntax errors, emit `VALID`.
4. If syntax or reference errors exist, log to `context.lint_errors` and emit `SYNTAX_ERROR`.
