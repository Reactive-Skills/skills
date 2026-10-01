---
name: research-design-planner
description: Produce a focused research design brief or section outline
type: reactive
---

# Synthesize

Deliver only the requested scope: a design brief, plan review, or proposal section outline.
Include decisions and rationale, assumptions, missing information, ethics questions, alignment checks, limits, and next steps as relevant.
For a full design, connect problem, purpose, questions, approach, methods, evidence, analysis, quality criteria, and interpretation.
For mixed methods, include strand timing and integration.
Label recommendations, user decisions, and open questions separately.
Cite Creswell and Creswell (2023) in the bibliography when book-based guidance informs the response.
Never invent participants, data, findings, references, approvals, or completed analyses.
After delivery emit `DELIVERED`; for revision emit `REFINE`; for another design path emit `CONTINUE_DESIGN`.

## Atomic gate
- [ ] Keep output within the requested scope.
- [ ] Mark every unknown as unknown.
- [ ] Separate a recommendation from a user decision.
