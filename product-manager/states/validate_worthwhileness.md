# VALIDATE_WORTHWHILENESS State

## Goal
Evaluate whether pursuing this opportunity is worthwhile across the 4 canonical product dimensions: Desirability, Feasibility, Viability, and Defensibility/Timing.

## Context Variables Read
- `context.opportunity_type`
- `context.product_name`
- `context.problem_statement`
- `context.target_persona`

## Tools
- `ask_question`
- `view_file`

## Instructions
1. Evaluate the opportunity against the **4-Axis Worthwhileness Rubric**:
   - **Desirability (User Pull)**:
     - Do users actively complain about this or seek solutions?
     - Is the problem frequent, painful, or urgent enough that users will adopt a solution?
     - Evidence score: 1 (Speculative) to 5 (Strong validated pull).
   - **Feasibility (Technical Realism)**:
     - Can our team/architecture realistically deliver this within reasonable constraints?
     - Are there high-risk dependencies, unknown third-party APIs, or severe architectural hurdles?
     - Feasibility score: 1 (Blocker-heavy) to 5 (Straightforward execution).
   - **Viability (Economic & Strategic Return)**:
     - Does building this yield meaningful ROI (revenue, retention, cost savings, velocity)?
     - What is the Cost of Delay if we postpone or ignore it?
     - Viability score: 1 (Zero payoff) to 5 (High strategic leverage).
   - **Defensibility & Timing ("Why Now? Why Us?")**:
     - Is there an inflection point (new API, market shift, regulatory change) creating an immediate window?
     - Do we possess an unfair advantage or existing moat?
     - Timing score: 1 (Poor timing) to 5 (Immediate catalyst).
2. Calculate composite `worthwhileness_score`:
   - Average of the 4 scores (scale 1.0 - 5.0).
   - Flag key risks and critical assumptions.
3. Decision Gate:
   - If composite score >= 3.0 and no catastrophic feasibility blockers exist:
     - Set `context.worthwhileness_score` and emit `WORTHWHILE_CONFIRMED`.
   - If composite score < 3.0 or critical red flags emerge:
     - Present findings to user and emit `WORTHWHILE_DOUBTFUL` to route to human review.

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Explicitly graded each of the 4 axes (Desirability, Feasibility, Viability, Timing).
- [ ] Documented at least one specific risk or critical assumption that must be tested.
- [ ] Computed numerical composite score and bound to context.

## Stop Criteria
Worthwhileness validated. Emit `WORTHWHILE_CONFIRMED` or route to `WORTHWHILE_DOUBTFUL`.

## Signals
- `WORTHWHILE_CONFIRMED`
- `WORTHWHILE_DOUBTFUL`
