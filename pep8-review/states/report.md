# REPORT

Return a concise review with scope, project rules consulted, and applicable PEPs.
List each finding with file and line, rule source, explanation, and concrete correction.
Separate project-rule mismatches from PEP 8 guidance.
If finding_count is zero, state that no actionable style findings were found.
Do not make code changes.
This is the terminal review state.

## Anti-Shortcut Gate

- Ensure every finding has a location and source.
- State review limits and unknowns.
- Do not add out-of-scope correctness findings.

