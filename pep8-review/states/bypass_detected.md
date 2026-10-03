---
name: pep8-review
description: Bypass detected - Agent operated outside signal contract
type: reactive
---

# pep8-review - BYPASS_DETECTED

The runtime detected work outside the signal contract.

## Recovery
1. Run reactive-skills-axi reset pep8-review.
2. Run reactive-skills-axi invoke pep8-review to start a fresh isolated job.
3. Run reactive-skills-axi state pep8-review --job <job-id> only when resuming a known job.

## Prevention
- Use AXI state to load the active prompt.
- Use AXI emit after each completed state task.
- Keep --job <job-id> on every command for named or parallel work.
- Use MCP only when shell access to AXI is unavailable.

## Anti-Shortcut Gate
- Stop work in this run.
- Do not advance signals outside the contract.
- Resume only through reset or a known job id.
