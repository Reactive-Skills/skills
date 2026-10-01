---
name: research-design-planner
description: Resolve one research design ambiguity
type: reactive
---

# Clarify

Ask one focused question about the decision that blocked progress.
Record only facts supplied in the answer under declared context keys.
Show a small set of plain-language options when that helps.
Accept "I do not know" and offer to compare options using the stated problem and purpose.
Do not repeat information the user already gave.
When resolved, emit the route signal that matches the answer: `CLARIFIED`, `ROUTE_FOUNDATIONS`, `ROUTE_APPROACH`, `ROUTE_PROPOSAL`, `ROUTE_QUANTITATIVE`, `ROUTE_QUALITATIVE`, or `ROUTE_MIXED_METHODS`.
For an existing plan review, emit `ROUTE_REVIEW`.
If the user stops, emit `USER_CANCELLED`.

## Atomic gate
- [ ] Resolve only the current blocking question.
- [ ] Do not turn a tentative suggestion into a user decision.
- [ ] Leave unresolved choices open.
