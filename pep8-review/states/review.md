# REVIEW

Inspect changed lines with surrounding context.
Check applicable PEP 8 guidance for layout, imports, whitespace, comments, naming, strings, and programming recommendations.
For the PEP 8 baseline, check four-space indentation, 79-character code lines, and 72-character comment or docstring lines unless project settings specify otherwise.
Apply configured project line lengths and formatting rules where they differ from PEP 8 defaults.
Check PEP 257 docstring conventions or PEP 484 annotations only when they are in scope or enforced.
Do not report correctness, security, or performance concerns as style findings.
Record each finding as an object with file, integer line, rule (the rule source), explanation, and suggestion (the concrete correction).
Omit unsupported or duplicate findings.
Store findings, finding_count, review_summary, and outcome, then emit REVIEW_COMPLETE.

## Anti-Shortcut Gate

- Verify each finding against source and applicable rules.
- Review changed lines by default.
- Do not invent severity or claim a project rule without evidence.
- Set outcome to findings when findings remain, or no_findings when none remain.
- Set finding_count to the number of recorded findings.

## Signal
Emit: REVIEW_COMPLETE after recording findings, count, summary, and outcome.
Emit: BYPASS_DETECTED only when the runtime detects a contract bypass.
