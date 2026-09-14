# ALIGN_GOALS State

## Goal
Anchor the product initiative to overarching strategic vision, define measurable success metrics (OKRs / KPIs), and declare non-negotiable **anti-goals** to protect focus.

## Context Variables Read
- `context.product_name`
- `context.problem_statement`
- `context.worthwhileness_score`

## Tools
- `view_file`
- `write_to_file`
- `ask_question`

## Instructions
1. **Identify Overarching Strategic Objectives**:
   - What high-level business goal or organizational theme does this effort advance?
   - How does it align with the product's North Star metric?
2. **Define Success Metrics & OKRs**:
   - Establish 1-2 Leading Indicators (e.g. daily active flow completions, reduction in drop-off rate, API response time).
   - Establish 1 Lagging Indicator (e.g. 30-day user retention, ARR contribution, developer support ticket reduction).
3. **Formulate Explicit Anti-Goals**:
   - An anti-goal is something we **intentionally choose NOT to do** during this scope to avoid dilution and scope creep.
   - Example anti-goals:
     - "We will NOT build a custom billing engine; we integrate Stripe Checkout only."
     - "We will NOT support multi-tenant federation in this phase."
     - "We will NOT rewrite the legacy backend."
4. Update context:
   - `strategic_goals`: Array of `{ objective, target_metric, timeframe }`.
   - `anti_goals`: Array of strings detailing explicit non-goals.

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Documented at least 1 North Star / strategic alignment objective.
- [ ] Formulated at least 2 measurable success metrics (1 leading, 1 lagging).
- [ ] Established at least 2 explicit, non-trivial Anti-Goals.
- [ ] Verified that goals directly address the problem statement from discovery.

## Stop Criteria
Goals, metrics, and anti-goals bound to context. Emit `GOALS_ALIGNED`. If fundamental misalignment is discovered, emit `REALIGN_RESEARCH`.

## Signals
- `GOALS_ALIGNED`
- `REALIGN_RESEARCH`
