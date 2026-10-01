---
name: research-design-planner
description: Proposal section router
type: reactive
---

# Proposal router

If the user named a section, route directly to that section.
If not, ask whether they need an introduction, purpose or aim, or research questions or hypotheses.
Do not make the user draft all proposal sections.
For literature or theory needs, route to foundations.
Emit `SECTION_INTRODUCTION`, `SECTION_PURPOSE`, `SECTION_QUESTIONS`, `SECTION_OTHER`, or `ASK_CLARIFY`.

## Atomic gate
- [ ] Load only the requested section.
- [ ] Keep the section aligned with the user's problem and approach.
