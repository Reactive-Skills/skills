# ERROR State

## Goal
Terminal failure state. Capture failure diagnostics, log the root cause, and present recovery steps to the operator.

## Context Variables Read
- `context.product_name`
- `payload.reason`
- `payload.error`

## Tools
- `write_to_file`

## Instructions
1. Inspect the error payload and state history to identify what caused the termination:
   - Setup/runtime failure
   - Worthwhileness gate rejection
   - Stakeholder abort in Review Gate
   - Internal transition error
2. Write a diagnostic entry to `.docs/product-manager-errors.md`.
3. Provide remediation advice:
   - If aborted by stakeholder: summarize unresolved feedback and offer to re-run with revised opportunity parameters.
   - If runtime issue: provide CLI reinstall or Node verification steps.

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Captured detailed failure reason in error logs.
- [ ] Displayed actionable recovery instructions to the operator.

## Stop Criteria
Error diagnosed and reported.
