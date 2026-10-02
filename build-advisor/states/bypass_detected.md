---
name: build-advisor
description: Bypass detected - Agent operated outside signal contract
type: reactive
---

# build-advisor - BYPASS_DETECTED

Runtime compatibility failed or work occurred outside the signal contract.

## Recovery
1. Run selected runtime `reset build-advisor`.
2. Run selected runtime `invoke build-advisor` to start a fresh isolated job.
3. Use selected runtime `state build-advisor --job <alias>` only when resuming a known run.

## Prevention
- Use selected runtime `state` to load the TODO card.
- Use selected runtime `emit` after each completed state task.
- Keep `--job <alias>` on every command for named or parallel work.

## Atomic checklist

- [ ] Report the actual compatibility or contract failure.
- [ ] Preserve useful evidence without continuing the failed run.
- [ ] Do not manually author runtime projections.

Terminal state.
No further signal is required.
