# PEP 8 Review

A reactive code review skill for Python style.

It checks changed lines by default and follows the project's own style documentation and configured tools.
It uses PEP 8 as the baseline and considers PEP 257 docstring conventions or PEP 484 type hints only when relevant.
It reports actionable findings with file and line references.
It does not modify source code.

## Review Flow

1. Intake confirms the code or diff, project root, and review scope.
2. Discover rules reads project style documentation and formatter or linter configuration.
3. Review checks applicable Python style rules and records evidence.
4. Report returns findings or states that no actionable style findings were found.

## Runtime

Start a run with `npx -y @reactive-skills/axi invoke pep8-review`.
Read the active prompt with `npx -y @reactive-skills/axi state pep8-review --job <job-id>`.
Advance only with the signal named by the active prompt.
Each work signal is guarded: intake needs a review input and scope, rule discovery needs recorded sources, and review completion needs findings, count, and outcome to agree.
The skill uses the standard reactive runtime bootloader for runtime selection and recovery.

## Installation

Install it with `npx skills add Reactive-Skills/skills --skill pep8-review`.
In an MCP host, invoke pep8-review with the host skill command, then use reactive_state and reactive_emit_signal for the active job.

## Standards

- [PEP 8](https://peps.python.org/pep-0008/)
- [PEP 257](https://peps.python.org/pep-0257/)
- [PEP 484](https://peps.python.org/pep-0484/)
- [PEP 20](https://peps.python.org/pep-0020/)

PEP numbers are identifiers, not a cumulative checklist.
PEP 0 indexes proposals and is not a prerequisite for PEP 8.

## Directory Layout

```text
pep8-review/
  skill.yaml
  skill-release.json
  SKILL.md
  README.md
  CONTEXT.md
  STATECHART.md
  states/
    init.md
    intake.md
    discover_rules.md
    review.md
    report.md
    bypass_detected.md
    error.md
  guards/
    workflow.test.cjs
  templates/
    snapshot.md.hbs
    inventory.json.hbs
    reactive_bootloader.md.hbs
    init_state.md.hbs
    bypass_detected.md.hbs
```
