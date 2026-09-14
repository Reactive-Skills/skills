# FORMULATE_SMART State

## Goal
Transform tested requirements into unambiguous, verifiable SMART specifications (Specific, Measurable, Achievable, Relevant, Time-bound).

## Context Variables Read
- `context.product_name`
- `context.tested_requirements`
- `context.strategic_goals`

## Tools
- `view_file`
- `write_to_file`
- `ask_question`

## Instructions
1. For each item in `context.tested_requirements`, translate it into the **SMART Framework**:
   - **Specific (S)**:
     - Clear, unambiguous statement of system and user behavior.
     - States who initiates the action, what data is processed, and what state change occurs.
   - **Measurable (M)**:
     - Formulate explicit Given/When/Then acceptance criteria or quantitative threshold (e.g. "Response within 200ms at 95th percentile", "Exit code 0 on valid inputs").
     - Can an automated test or human evaluator objectively verify completion with a binary Pass/Fail?
   - **Achievable (A)**:
     - Scoped to be deliverable without unrealistic architectural re-engineering or unbounded dependencies.
   - **Relevant (R)**:
     - Cites the specific Strategic Goal or OKR from `context.strategic_goals` that this requirement directly advances.
   - **Time-bound / Sequenced (T)**:
     - Associated with a delivery milestone or sequencing dependency (e.g. "Prerequisite for Slice S02", "Sprint 1 Walking Skeleton").
2. Format as a structured requirement schema:
   ```json
   {
     "id": "REQ-01",
     "title": "...",
     "specific": "...",
     "measurable": "Given [context], When [action], Then [outcome]",
     "achievable_notes": "...",
     "relevant_goal": "OKR-1",
     "time_sequence": "Phase 1 / Walking Skeleton"
   }
   ```
3. Update context:
   - `smart_requirements`: Array of structured SMART requirement objects.

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Every requirement contains an explicit Given/When/Then or verifiable metric under `measurable`.
- [ ] Every requirement explicitly references its parent `relevant_goal`.
- [ ] Removed all ambiguous adjectives (e.g., "fast", "intuitive", "scalable") in favor of concrete criteria.

## Stop Criteria
SMART requirements fully formulated and bound to context. Emit `SMART_SCOPED`. If unresolvable requirement ambiguities remain, emit `REFINE_REQUIREMENTS`.

## Signals
- `SMART_SCOPED`
- `REFINE_REQUIREMENTS`
