# INTAKE

Collect the Python diff or files, project root, and requested review scope.
Set review_scope to changed_lines by default, or full_files when full-file review is requested.
Record review_input, review_subject, changed_files, review_scope, and python_version.
If source or scope is missing, ask for it and remain in INTAKE.
Do not infer file paths or project conventions from snippets.
When sufficient input is available, emit INPUT_READY.

## Anti-Shortcut Gate

- Confirm the review target and changed-line scope.
- Record unknown Python version or project root as unknown.
- Do not begin review before required input is available.

## Signal
Emit: INPUT_READY with review_input and review_scope when required input is available.
Emit: BYPASS_DETECTED only when the runtime detects a contract bypass.
