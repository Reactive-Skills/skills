# DISCOVER_RULES

Read the nearest project instructions and style documentation.
Inspect relevant configuration such as .editorconfig, pyproject.toml, setup.cfg, tox.ini, and .flake8.
Record the source paths and any explicit formatter or linter rules.
Apply project rules first, local conventions second, and PEP 8 where guidance is silent.
Use PEP 257 only for docstrings in scope and PEP 484 only for annotations in scope or enforced by project tooling.
Treat PEP 20 as context, not a mechanical rule.
Do not infer settings from installed packages.
Store project_rules as an object, even when empty, and style_sources as a list that always includes PEP 8, then emit RULES_READY.

## Anti-Shortcut Gate

- Check for project instructions and relevant configuration.
- Separate explicit settings from inferred conventions.
- Record which PEPs apply and why.

## Signal
Emit: RULES_READY after recording sources and applicable rules.
Emit: BYPASS_DETECTED only when the runtime detects a contract bypass.
