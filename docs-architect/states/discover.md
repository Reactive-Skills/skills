# DISCOVER

Inventory repository material and classify likely sources of truth.

## Actions
1. Enumerate files under `source_paths`.
2. Identify API surfaces, architecture records, runbooks, tests, and examples.
3. Mark each candidate as authoritative, supporting, or stale.
4. Record missing or contradictory sources.

## Atomic checklist
- [ ] Inventory is reproducible.
- [ ] Authority classification is explicit.
- [ ] Missing sources are listed.
- [ ] Discovery exit code is captured.

## Signal
Emit `DISCOVERY_COMPLETE` with `exit_code: 0`, or `DISCOVERY_FAILED` with a non-zero exit code.
