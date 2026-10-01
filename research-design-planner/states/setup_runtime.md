---
name: research-design-planner
description: Reactive runtime setup handoff
type: reactive
---

# Runtime setup required

Explain that this skill needs a compatible Reactive Skills runtime.
Do not install software, change runtime configuration, or guess a fallback.
Ask the user to set up the runtime or choose another route for this request.
After the user confirms setup, emit `SETUP_COMPLETE`.
If setup cannot be completed, emit `SETUP_FAILED`.

## Atomic gate
- [ ] Do not claim setup succeeded without a capability check.
- [ ] Do not continue design decisions without the runtime.
