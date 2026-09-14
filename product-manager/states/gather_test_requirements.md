# GATHER_TEST_REQUIREMENTS State

## Goal
Elicit functional and non-functional requirements and rigorously test them against assumptions using adversarial falsification checks.

## Context Variables Read
- `context.product_name`
- `context.strategic_goals`
- `context.anti_goals`

## Tools
- `ask_question`
- `view_file`
- `grep_search`

## Instructions
1. **Gather Candidate Requirements**:
   - Collect functional requirements: capabilities the user or system must exhibit.
   - Collect non-functional requirements: performance, latency, security, compliance, error resilience.
   - Collect integration requirements: external APIs, databases, message buses, file formats.
2. **Apply Falsification & Stress Testing**:
   - For every requirement, ask:
     - *Why must this exist?* Does it directly support one of our strategic goals?
     - *Does it violate any anti-goals?* (Immediate rejection if it does).
     - *What would falsify this?* If users do not take action X within 3 clicks, does requirement Y become useless?
     - *Can it be deferred without breaking the core loop?*
3. **Filter and Refine**:
   - Discard speculative wishlist items that fail falsification.
   - Clarify ambiguous statements into concrete behavioral obligations.
4. Update context:
   - `tested_requirements`: Array of `{ id, title, description, rationale, falsification_proof, category }`.

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Screened all candidate requirements against declared `anti_goals`.
- [ ] Subjected each requirement to an explicit falsification check.
- [ ] Categorized requirements into functional vs non-functional vs integration.
- [ ] Verified that surviving requirements map to at least one strategic goal.

## Stop Criteria
Requirements gathered, tested, and bound to context. Emit `REQUIREMENTS_TESTED`. If requirements conflict with core goals, emit `REVISE_GOALS`.

## Signals
- `REQUIREMENTS_TESTED`
- `REVISE_GOALS`
